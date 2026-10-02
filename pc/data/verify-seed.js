#!/usr/bin/env node
/**
 * 시딩 사전 점검 (업로드 전 안전장치)
 *
 * Firestore 시딩은 실패해도 부분 반영될 수 있어, 올리기 전에 검증하는 편이 훨씬 싸다.
 * 특히 '시더가 쓰는 컬렉션'과 'firestore.rules가 허용하는 경로'는 서로 다른 파일이라
 * 한쪽만 고치면 조용히 어긋나고, 실제 업로드 도중에야 permission-denied로 터진다.
 * 이 스크립트는 그 어긋남을 업로드 전에 잡는다.
 *
 * 사용법: npm run verify:seed
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SEED_PATH = path.join(ROOT, 'data', 'firebase-seed.json');
const SEEDER_PATH = path.join(ROOT, 'data', 'firebase-seeder.js');
const RULES_PATH = path.join(ROOT, 'firestore.rules');

const problems = [];
const warnings = [];
const notes = [];

function fail(msg) { problems.push(msg); }
function warn(msg) { warnings.push(msg); }
function note(msg) { notes.push(msg); }

// 1) 시드 파일이 mockData.js와 일치하는가
function checkSeedFresh() {
  const { build } = require('./build-seed.js');
  const { seed } = build();
  const expected = JSON.stringify(seed, null, 2) + '\n';
  const actual = fs.existsSync(SEED_PATH) ? fs.readFileSync(SEED_PATH, 'utf8') : '';
  if (!actual) {
    fail('data/firebase-seed.json이 없습니다. `npm run build:seed`를 실행하십시오.');
  } else if (actual !== expected) {
    fail('firebase-seed.json이 mockData.js보다 낡았습니다. `npm run build:seed`를 실행하십시오.');
  } else {
    note('시드 파일이 mockData.js와 일치합니다.');
  }
  return seed;
}

// 2) 시더가 쓰는 컬렉션이 모두 보안 규칙에 열려 있는가
function checkRulesCoverage() {
  const seeder = fs.readFileSync(SEEDER_PATH, 'utf8');
  const rules = fs.readFileSync(RULES_PATH, 'utf8');

  const seederCols = new Set([...seeder.matchAll(/collection:\s*'([a-z_]+)'/g)].map((m) => m[1]));
  const ruleCols = new Set([...rules.matchAll(/match \/([a-z_]+)\/\{/g)].map((m) => m[1]));

  const missing = [...seederCols].filter((c) => !ruleCols.has(c));
  if (missing.length) {
    fail(`시더가 쓰지만 firestore.rules에 없는 컬렉션: ${missing.join(', ')}\n`
      + '     → 이대로 업로드하면 permission-denied로 실패합니다. 규칙에 추가하십시오.');
  } else {
    note(`시더 컬렉션 ${seederCols.size}종이 모두 보안 규칙에 등록되어 있습니다.`);
  }
  return seederCols;
}

// 3) 시더 SPEC이 참조하는 키가 시드에 실제로 있는가
function checkSpecKeys(seed) {
  const seeder = fs.readFileSync(SEEDER_PATH, 'utf8');
  const keys = [...seeder.matchAll(/key:\s*'([a-zA-Z]+)'/g)].map((m) => m[1]);
  const missing = keys.filter((k) => seed[k] === undefined);
  if (missing.length) {
    fail(`시더 SPEC이 참조하지만 시드에 없는 키: ${missing.join(', ')}`);
  }
  const seedKeys = Object.keys(seed).filter((k) => k !== '_meta');
  const unseeded = seedKeys.filter((k) => !keys.includes(k));
  if (unseeded.length) {
    warn(`시드에 있으나 업로드되지 않는 항목: ${unseeded.join(', ')}\n`
      + '     → 의도한 것이면 무시해도 됩니다.');
  } else {
    note(`시드 항목 ${seedKeys.length}종이 모두 업로드 대상입니다.`);
  }
}

// 4) 문서 ID로 쓸 값이 유효한가 (중복/누락은 데이터 유실로 이어진다)
function checkDocIds(seed) {
  const idSpecs = [
    ['employees', (e) => e.id],
    ['notices', (n) => n.id],
    ['todos', (t) => t.id],
    ['trashedTodos', (t) => t.id],
    ['projects', (p) => p.id],
    ['notifications', (n) => n.id],
    ['workReports', (r) => r.id],
    ['dailyWorkReports', (r) => r.id],
    ['teamWorkReports', (r) => r.id]
  ];
  idSpecs.forEach(([key, pick]) => {
    const arr = seed[key];
    if (!Array.isArray(arr)) return;
    const ids = arr.map(pick).map((v) => (v === undefined || v === null ? '' : String(v)));
    const blank = ids.filter((v) => v === '').length;
    if (blank) fail(`'${key}'에 id가 없는 항목 ${blank}건 — 문서 ID를 만들 수 없습니다.`);
    const dup = ids.filter((v, i) => v !== '' && ids.indexOf(v) !== i);
    if (dup.length) {
      fail(`'${key}'에 중복 id ${[...new Set(dup)].join(', ')} — 나중 문서가 앞 문서를 덮어써 유실됩니다.`);
    }
  });

  // members는 이메일이 문서 ID다. 겸직으로 인한 중복은 build-seed.js가 이미 병합했어야 한다.
  const emails = (seed.members || []).map((m) => String(m.email || '').trim().toLowerCase());
  const blank = emails.filter((e) => !e).length;
  if (blank) fail(`members에 이메일 없는 항목 ${blank}건`);
  const dup = emails.filter((v, i) => v && emails.indexOf(v) !== i);
  if (dup.length) fail(`members 이메일 중복: ${[...new Set(dup)].join(', ')}`);
}

// 5) 접근 명부 점검 — 여기가 비면 로그인해도 아무것도 못 읽는다
function checkMembers(seed) {
  const members = seed.members || [];
  const employees = seed.employees || [];
  if (!members.length) {
    fail('members 접근 명부가 비어 있습니다. 이 상태로는 아무도 데이터를 읽을 수 없습니다.');
    return;
  }
  const noEmail = employees.filter((e) => !String(e.email || '').trim());
  if (noEmail.length) {
    warn(`이메일이 없어 명부에서 빠진 임직원 ${noEmail.length}명: `
      + `${noEmail.map((e) => e.name).join(', ')}\n     → 이 인원은 로그인해도 데이터를 읽지 못합니다.`);
  }
  const joint = members.filter((m) => m.alsoKnownAs && m.alsoKnownAs.length);
  if (joint.length) {
    note(`겸직으로 병합된 계정 ${joint.length}건: ${joint.map((m) => m.name).join(', ')}`);
  }
  note(`members 접근 명부 ${members.length}명 (임직원 ${employees.length}건 기준)`);
}

// 6) 규모 추정 — 무료 할당량 판단 근거
function reportScale(seed) {
  let docs = 0;
  Object.entries(seed).forEach(([k, v]) => {
    if (k === '_meta') return;
    if (Array.isArray(v)) docs += v.length;
    else if (v && typeof v === 'object') docs += 1;
  });
  // schedules는 날짜별 문서라 별도 가산
  if (seed.schedules) docs += Object.keys(seed.schedules).length - 1;
  note(`예상 업로드 문서 수: 약 ${docs}건 (Firestore 무료 한도 일 2만 쓰기 대비 충분)`);
}

function main() {
  console.log('🔍 Firestore 시딩 사전 점검\n');
  const seed = checkSeedFresh();
  checkRulesCoverage();
  checkSpecKeys(seed);
  checkDocIds(seed);
  checkMembers(seed);
  reportScale(seed);

  notes.forEach((n) => console.log(`  ✓ ${n}`));
  if (warnings.length) {
    console.log('');
    warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
  }
  if (problems.length) {
    console.log('');
    problems.forEach((p) => console.log(`  ❌ ${p}`));
    console.log(`\n점검 실패: ${problems.length}건을 해결한 뒤 업로드하십시오.`);
    process.exit(1);
  }
  console.log('\n✅ 점검 통과 — 업로드를 진행해도 안전합니다.');
  console.log('   다음: firebase/seed.html을 관리자 계정으로 열어 실행하십시오.');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('❌ 점검 중 오류:', err.message);
    process.exit(1);
  }
}
