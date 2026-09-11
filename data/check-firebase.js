#!/usr/bin/env node
/**
 * Firebase 콘솔 설정 상태 원격 점검
 *
 * 콘솔에서 무엇을 했고 무엇이 남았는지 터미널에서 바로 확인하기 위한 도구다.
 * 설정 단계마다 이걸 돌리면 다음에 뭘 해야 하는지 알 수 있다.
 *
 * 인증 없이 공개 엔드포인트만 두드리므로 자격 증명이 필요 없고, 아무것도 변경하지 않는다.
 *
 * 사용법: npm run check:firebase
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');

/** firebase/config.js에서 설정값을 읽는다(브라우저 전역 스크립트이므로 window를 흉내 낸다). */
function loadConfig() {
  const vm = require('vm');
  const src = fs.readFileSync(path.join(ROOT, 'firebase', 'config.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return {
    cfg: sandbox.window.FirebaseConfig || {},
    opts: sandbox.window.FirebaseOptions || {}
  };
}

function request(url, options = {}, body = null) {
  return new Promise((resolve) => {
    const req = https.request(url, { timeout: 15000, ...options }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) { }
        resolve({ status: res.statusCode, json, raw: data });
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    if (body) req.write(body);
    req.end();
  });
}

const OK = '✅';
const NO = '❌';
const WARN = '⚠️ ';

/** 1) API 키가 유효하고 프로젝트가 실재하는가 + 이메일/비밀번호 로그인이 켜져 있는가 */
async function checkAuth(apiKey) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const body = JSON.stringify({
    email: 'readiness-probe@example.invalid',
    password: 'probe-not-a-real-password',
    returnSecureToken: true
  });
  const res = await request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, body);

  const msg = (res.json && res.json.error && res.json.error.message) || '';

  if (res.status === 0) return { key: 'auth', ok: false, label: '네트워크 오류', detail: res.error };
  if (msg.includes('API key not valid')) {
    return { key: 'auth', ok: false, label: 'API 키 무효',
      detail: 'firebase/config.js의 apiKey를 콘솔 값과 대조하십시오.' };
  }
  if (msg.includes('CONFIGURATION_NOT_FOUND')) {
    return { key: 'auth', ok: false, label: 'Authentication 미설정',
      detail: '콘솔 > Authentication > Sign-in method 에서 "이메일/비밀번호"를 사용 설정하십시오.' };
  }
  // 계정이 없다는 응답이 오면 = 인증 자체는 정상 동작
  if (['EMAIL_NOT_FOUND', 'INVALID_LOGIN_CREDENTIALS', 'INVALID_PASSWORD'].some((c) => msg.includes(c))) {
    return { key: 'auth', ok: true, label: '이메일/비밀번호 로그인 활성' };
  }
  return { key: 'auth', ok: false, label: `예상 밖 응답 (${res.status})`, detail: msg.slice(0, 120) };
}

/**
 * 2) Firestore 데이터베이스 존재 여부 + 보안 규칙 상태
 *
 * 비인증 읽기 응답으로 세 가지를 구분한다.
 *   NOT_FOUND         -> 데이터베이스가 아직 없음
 *   PERMISSION_DENIED -> 데이터베이스 있음 + 규칙이 정상 차단 중 (바람직)
 *   200 OK            -> 데이터베이스 있음 + 규칙이 전체 공개 (위험)
 */
async function checkFirestore(projectId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/employees?pageSize=1`;
  const res = await request(url);

  if (res.status === 0) {
    return [{ key: 'db', ok: false, label: '네트워크 오류', detail: res.error }];
  }

  const err = res.json && res.json.error;
  const status = err && err.status;

  if (status === 'NOT_FOUND') {
    return [
      { key: 'db', ok: false, label: 'Firestore 데이터베이스 없음',
        detail: '콘솔 > Firestore Database > 데이터베이스 만들기 (리전: asia-northeast3 서울 권장, 변경 불가)' },
      { key: 'rules', ok: null, label: '보안 규칙 — 데이터베이스 생성 후 확인 가능' },
      { key: 'seed', ok: null, label: '시딩 데이터 — 데이터베이스 생성 후 확인 가능' }
    ];
  }

  if (status === 'PERMISSION_DENIED') {
    return [
      { key: 'db', ok: true, label: 'Firestore 데이터베이스 존재' },
      { key: 'rules', ok: true, label: '보안 규칙 적용 중 (비로그인 읽기 정상 차단)' },
      { key: 'seed', ok: null, label: '시딩 데이터 — 규칙이 막고 있어 외부에서 확인 불가(정상). seed.html 로그로 확인하십시오.' }
    ];
  }

  if (res.status === 200) {
    const docs = (res.json && res.json.documents) || [];
    return [
      { key: 'db', ok: true, label: 'Firestore 데이터베이스 존재' },
      { key: 'rules', ok: false, label: '보안 규칙이 전체 공개 상태 (위험)',
        detail: '비로그인 상태로 임직원 데이터가 읽힙니다. firestore.rules를 즉시 게시하십시오.' },
      { key: 'seed', ok: docs.length > 0, label: docs.length > 0
        ? 'employees 컬렉션에 데이터 있음'
        : 'employees 컬렉션이 비어 있음 (시딩 필요)' }
    ];
  }

  return [{ key: 'db', ok: false, label: `예상 밖 응답 (${res.status})`,
    detail: (err && err.message || res.raw || '').slice(0, 120) }];
}

/** 3) 로컬 준비 상태(시드 파일)도 함께 보여 준다. */
function checkLocal() {
  const seedPath = path.join(ROOT, 'data', 'firebase-seed.json');
  if (!fs.existsSync(seedPath)) {
    return { key: 'local', ok: false, label: '시드 파일 없음', detail: 'npm run build:seed 를 실행하십시오.' };
  }
  try {
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    const members = (seed.members || []).length;
    // 시더가 실제로 쓰는 문서 수와 같은 방식으로 센다.
    // (배열은 원소마다 1문서, schedules는 날짜마다 1문서, 그 밖의 객체는 통째로 1문서)
    let docs = 0;
    Object.entries(seed).forEach(([k, v]) => {
      if (k === '_meta') return;
      if (Array.isArray(v)) docs += v.length;
      else if (k === 'schedules') docs += Object.keys(v).length;
      else docs += 1;
    });
    return { key: 'local', ok: true, label: `시드 준비 완료 (약 ${docs}문서, 명부 ${members}명)` };
  } catch (e) {
    return { key: 'local', ok: false, label: '시드 파일 손상', detail: e.message };
  }
}

function render(rows) {
  rows.forEach((r) => {
    const mark = r.ok === true ? OK : r.ok === false ? NO : '⬜';
    console.log(`  ${mark} ${r.label}`);
    if (r.detail) console.log(`       ${r.detail}`);
  });
}

/** 남은 단계를 순서대로 안내한다. 이미 끝난 단계는 보여 주지 않는다. */
function nextSteps(all) {
  const by = Object.fromEntries(all.map((r) => [r.key, r]));
  const steps = [];

  if (by.db && by.db.ok !== true) {
    steps.push('콘솔 > Firestore Database > 데이터베이스 만들기 (리전 asia-northeast3 / 서울, 이후 변경 불가)');
  }
  if (by.auth && by.auth.ok !== true) {
    steps.push('콘솔 > Authentication > Sign-in method > 이메일/비밀번호 사용 설정');
  }
  if (by.rules && by.rules.ok === false) {
    steps.push('콘솔 > Firestore > 규칙 탭에 firestore.rules 붙여넣고 게시 (현재 데이터가 공개 상태입니다)');
  }
  if (by.db && by.db.ok === true && by.auth && by.auth.ok === true) {
    steps.push('콘솔에서 본인 계정 생성 후 Firestore에 admins/{내 UID} 문서 추가');
    steps.push('npm run verify:seed 통과 확인 후 firebase/seed.html 실행하여 데이터 업로드');
  }

  if (!steps.length) {
    console.log('\n✅ 콘솔 설정이 모두 완료된 것으로 보입니다.');
    return;
  }
  console.log('\n다음 할 일:');
  steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
}

async function main() {
  const { cfg } = loadConfig();
  if (!cfg.apiKey || !cfg.projectId) {
    console.error('❌ firebase/config.js에서 apiKey/projectId를 읽지 못했습니다.');
    process.exit(1);
  }

  console.log(`🔍 Firebase 설정 점검 — 프로젝트: ${cfg.projectId}\n`);

  const local = checkLocal();
  const auth = await checkAuth(cfg.apiKey);
  const fsRows = await checkFirestore(cfg.projectId);

  console.log('[로컬 준비]');
  render([local]);
  console.log('\n[Firebase 콘솔]');
  render([auth, ...fsRows]);

  nextSteps([local, auth, ...fsRows]);
  console.log('');
}

main().catch((e) => {
  console.error('❌ 점검 중 오류:', e.message);
  process.exit(1);
});
