#!/usr/bin/env node
/**
 * Firestore 시드 데이터 빌더 (data/mockData.js -> data/firebase-seed.json)
 *
 * 왜 이 스크립트가 필요한가
 *   시드 JSON을 손으로 관리하면 mockData.js가 갱신될 때마다 어긋난다.
 *   실제로 이전 시드는 2026-08-14에 멈춘 채 6종이 누락되고 2종이 낡아 있었다.
 *   따라서 시드는 '작성하는 파일'이 아니라 '단일 원본에서 생성하는 산출물'로 다룬다.
 *   원본은 언제나 data/mockData.js 하나뿐이다.
 *
 * 사용법
 *   npm run build:seed     생성
 *   npm run check:seed     생성물이 최신인지 검사만 (CI/커밋 전 점검용, 파일을 쓰지 않음)
 *
 * 주의
 *   이 스크립트는 파일만 만든다. Firestore에 업로드하지 않는다.
 *   업로드는 firebase/seed.html을 관리자 계정으로 열어 수동 실행한다.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const MOCK_PATH = path.join(ROOT, 'data', 'mockData.js');
const SEED_PATH = path.join(ROOT, 'data', 'firebase-seed.json');

/** mockData.js는 브라우저 전역 스크립트(window.MockData=...)이므로 window를 흉내 내어 평가한다. */
function loadMockData() {
  const src = fs.readFileSync(MOCK_PATH, 'utf8');
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: MOCK_PATH });
  const md = sandbox.window.MockData;
  if (!md || typeof md !== 'object') {
    throw new Error('mockData.js에서 window.MockData를 찾지 못했습니다.');
  }
  // 함수/헬퍼는 데이터가 아니므로 시드에서 제외한다.
  const data = {};
  for (const [k, v] of Object.entries(md)) {
    if (typeof v === 'function') continue;
    data[k] = v;
  }
  return data;
}

/**
 * 주소록에서 members 접근 명부를 파생한다.
 * firestore.rules의 isMember()가 이 명부를 근거로 접근을 판별하므로,
 * 명부가 비면 로그인에 성공해도 어떤 데이터도 읽지 못한다.
 * 이메일이 문서 ID이므로 겸직(동일 이메일 복수 직책)은 자연히 1건으로 병합된다.
 */
function buildMembers(employees) {
  const members = {};
  const skipped = [];
  (employees || []).forEach((emp) => {
    const email = String(emp.email || '').trim().toLowerCase();
    if (!email) {
      skipped.push(emp.name || `id:${emp.id}`);
      return;
    }
    if (members[email]) {
      // 겸직: 먼저 등록된 직책을 유지하고 겸직 이력만 덧붙인다.
      members[email].alsoKnownAs = members[email].alsoKnownAs || [];
      members[email].alsoKnownAs.push({ dept: emp.dept, role: emp.role, employeeId: emp.id });
      return;
    }
    members[email] = {
      email,
      name: emp.name,
      dept: emp.dept,
      role: emp.role,
      employeeId: emp.id
    };
  });
  return { members, skipped };
}

function build() {
  const mock = loadMockData();
  const { members, skipped } = buildMembers(mock.employees);

  const seed = {
    _meta: {
      projectName: 'lebass98/groupware',
      description: 'Firestore 시딩 전용 데이터셋. data/mockData.js에서 자동 생성되므로 직접 수정하지 마십시오.',
      generatedBy: 'data/build-seed.js',
      source: 'data/mockData.js',
      version: '2.0.0'
    },
    ...mock,
    members: Object.values(members)
  };

  return { seed, mock, members, skipped };
}

/** 생성물을 안정적으로 직렬화한다(키 순서 고정 없이 원본 순서 유지, 들여쓰기 2). */
function serialize(seed) {
  return JSON.stringify(seed, null, 2) + '\n';
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const { seed, mock, members, skipped } = build();
  const next = serialize(seed);

  if (checkOnly) {
    const current = fs.existsSync(SEED_PATH) ? fs.readFileSync(SEED_PATH, 'utf8') : '';
    if (current === next) {
      console.log('✅ firebase-seed.json이 mockData.js와 일치합니다.');
      process.exit(0);
    }
    console.error('❌ firebase-seed.json이 mockData.js와 어긋났습니다. `npm run build:seed`를 실행하십시오.');
    process.exit(1);
  }

  fs.writeFileSync(SEED_PATH, next, 'utf8');

  const counts = Object.entries(seed)
    .filter(([k]) => k !== '_meta')
    .map(([k, v]) => `  ${k}: ${Array.isArray(v) ? `${v.length}건` : `${Object.keys(v).length}개 키`}`)
    .join('\n');

  console.log('✅ data/firebase-seed.json 생성 완료\n');
  console.log(counts);
  console.log(`\n  members 접근 명부: ${Object.keys(members).length}명 (임직원 ${mock.employees.length}건에서 파생)`);
  if (skipped.length) {
    console.warn(`\n⚠️  이메일이 없어 명부에서 제외된 임직원: ${skipped.join(', ')}`);
    console.warn('   이 인원은 로그인하더라도 데이터를 읽을 수 없습니다.');
  }
  console.log('\n다음 단계: firebase/seed.html을 관리자 계정으로 열어 업로드하십시오.');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('❌ 시드 생성 실패:', err.message);
    process.exit(1);
  }
}

module.exports = { build, loadMockData, buildMembers };
