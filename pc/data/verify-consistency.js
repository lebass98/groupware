#!/usr/bin/env node
/**
 * 디바이스 간 데이터 일치 검증기
 *
 *   node data/verify-consistency.js
 *
 * PC(pc.js)와 모바일(script.js)이 서로 다른 데이터를 보게 만드는 패턴을 정적으로 검사한다.
 * .agents/AGENTS.md의 "디바이스별 Mock 데이터 하드코딩 및 독립 상태 분리 생성 금지" 규칙을
 * 사람이 매번 눈으로 확인하지 않아도 되도록 자동화한 것이다.
 *
 * 종료 코드 0 = 통과, 1 = 위반 발견
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const failures = [];
const passes = [];

function check(label, ok, detail) {
  // detail은 실패 사유 설명이므로 통과 항목에는 표시하지 않는다.
  (ok ? passes : failures).push({ label, detail: ok ? '' : detail });
}

// ---------------------------------------------------------------------------
// 1. 공용 마스터 데이터가 실제로 로드되는지
// ---------------------------------------------------------------------------
const sandbox = { window: {} };
new Function('window', read('data/mockData.js'))(sandbox.window);
const M = sandbox.window.MockData || {};

check('공용 마스터 데이터 로드', !!M.employees && !!M.schedules, '마스터 데이터를 읽지 못했습니다.');
console.log(`대상: 임직원 ${(M.employees || []).length}명 · 일정 ${Object.keys(M.schedules || {}).length}일 · 할일 ${(M.todos || []).length}건`);

// ---------------------------------------------------------------------------
// 2. 두 클라이언트가 같은 소스에서 초기 상태를 시드하는지
// ---------------------------------------------------------------------------
const pc = read('pc.js');
const mo = read('script.js');

const SEEDED = [
  { field: 'todos', source: 'window.MockData.todos' },
  { field: 'trashedTodos', source: 'window.MockData.trashedTodos' },
  { field: 'notifications', source: 'window.MockData.notifications' },
];

for (const { field, source } of SEEDED) {
  const inPc = new RegExp(`${field}:\\s*\\(window\\.MockData`).test(pc);
  const inMo = new RegExp(`${field}:\\s*\\(window\\.MockData`).test(mo);
  check(`초기 상태 '${field}' 공용 데이터 시드`, inPc && inMo,
    `pc.js ${inPc ? 'O' : 'X'} / script.js ${inMo ? 'O' : 'X'}`);
}

// ---------------------------------------------------------------------------
// 3. 화면 코드 안에 업무 데이터 배열을 하드코딩하지 않았는지
// ---------------------------------------------------------------------------
const HARDCODE_PATTERNS = [
  { name: '할일 배열', re: /todos:\s*\[\s*\{/ },
  { name: '근태 로그 배열', re: /const logs\s*=\s*\[\s*\{/ },
  { name: '임직원 배열', re: /employees:\s*\[\s*\{/ },
];

for (const file of ['pc.js', 'script.js']) {
  const src = read(file);
  for (const { name, re } of HARDCODE_PATTERNS) {
    check(`${file}: ${name} 하드코딩 없음`, !re.test(src),
      re.test(src) ? '화면 코드에 데이터가 직접 박혀 있어 다른 디바이스와 갈라집니다.' : '');
  }
}

// ---------------------------------------------------------------------------
// 4. 사용자 등록 일정이 영구 저장 경로를 타는지
// ---------------------------------------------------------------------------
for (const [file, src] of [['pc.js', pc], ['script.js', mo]]) {
  check(`${file}: 신규 일정 공용 저장(addUserSchedule) 사용`, src.includes('addUserSchedule('), '');
  check(`${file}: MockData.schedules 직접 변형 없음`,
    !/MockData\.schedules\[[^\]]+\]\s*(\.push|\.unshift|=\s*\[)/.test(src),
    '메모리에만 남아 새로고침 시 사라지고 다른 기기에 반영되지 않습니다.');
  check(`${file}: userSchedules 상태 저장 포함`, src.includes('userSchedules'), '');
}

// ---------------------------------------------------------------------------
// 5. 일정 날짜 키 형식이 한 가지로 유지되는지
// ---------------------------------------------------------------------------
const padded = Object.keys(M.schedules || {}).filter((k) => /^\d{4}-0\d|-0\d$/.test(k));
check('일정 날짜 키 형식 단일(YYYY-M-D)', padded.length === 0,
  padded.length ? `제로패딩 키 ${padded.length}개: ${padded.slice(0, 3).join(', ')}` : '');

// ---------------------------------------------------------------------------
// 결과 출력
// ---------------------------------------------------------------------------
console.log('\n디바이스 간 데이터 일치 검증\n' + '='.repeat(46));
for (const p of passes) console.log(`  통과  ${p.label}${p.detail ? '  — ' + p.detail : ''}`);
for (const f of failures) console.log(`  실패  ${f.label}${f.detail ? '\n         ' + f.detail : ''}`);
console.log('='.repeat(46));
console.log(`통과 ${passes.length}건 / 실패 ${failures.length}건\n`);

if (failures.length) {
  console.error('디바이스 간 데이터가 갈라질 수 있는 코드가 발견되었습니다. (.agents/AGENTS.md 데이터 동기화 규칙)');
  process.exit(1);
}
