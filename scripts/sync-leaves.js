#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate) 휴가 관리 크롤러 & 전 디바이스 동기화 스크립트
 *
 * 원본 화면
 *   http://sitegate.co.kr/html/board/skin/board/daily_report/holyW/index.php
 *
 * 이 화면은 HTML에 데이터가 없고 indexAjax.php가 JSON을 돌려주는 구조다.
 * 그래서 HTML을 긁지 않고 그 JSON 엔드포인트를 그대로 호출한다(파싱이 훨씬 안정적이다).
 *
 * 응답 배열의 의미 (원본 fn_listAjax.js에서 확인)
 *   j[0] 전체 건수      j[1] 휴가 신청 목록
 *   j[2] 이월 연차      j[4] 입사일
 *   j[5] 대체 휴가      j[8] 올해 부여된 연차     j[9] 연차 메모
 *
 * 차감 규칙도 원본 화면의 계산 로직을 그대로 따른다.
 *   연차 1.0 / 반차 0.5 / 반반차 0.25
 *   공가·병가·경조사·생일휴가·지각은 연차를 차감하지 않는다.
 *
 * 산출물
 *   data/_legacy/leaves.json
 *   data/mockData.js 의 leaves 블록
 *   (이후 build:seed / verify:seed 로 Firestore 시드까지 갱신)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HOLY_DIR = '/html/board/skin/board/daily_report/holyW';

// 사용자 요청에 따라 전사 데이터에서 항상 제외한다(근태일지 크롤러와 동일 규칙).
const EXCLUDED_NAMES = ['윤성호'];

/** 연차에서 차감되는 일수. 원본 화면의 판정 순서를 그대로 옮긴 것이다. */
function deductionOf(subject) {
  const s = String(subject || '');
  if (s.includes('생일')) return 0;                       // 생일휴가는 차감하지 않는다
  if (s.includes('반반차')) return 0.25;
  if (s.includes('반차')) return 0.5;
  if (s.includes('연차') || s.includes('휴가')) return 1;
  return 0;                                                // 공가·병가·경조사·지각 등
}

function loadEnv() {
  const env = {};
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return;
      const i = t.indexOf('=');
      if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    });
  }
  // CI(GitHub Actions)에는 .env가 없고 Secrets가 환경변수로 들어온다.
  ['SITEGATE_URL', 'SITEGATE_ID', 'SITEGATE_PW'].forEach((key) => {
    if (!env[key] && process.env[key]) env[key] = process.env[key];
  });
  return env;
}

function loadEmployees() {
  const src = fs.readFileSync(path.join(ROOT, 'data', 'mockData.js'), 'utf8');
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'mockData.js' });
  return (sandbox.window.MockData && sandbox.window.MockData.employees) || [];
}

async function login(baseUrl, mb_id, mb_password) {
  const res = await fetch(`${baseUrl}/html/board/bbs/login_check.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    body: new URLSearchParams({ url: '/', mb_id, mb_password }).toString(),
    redirect: 'manual'
  });

  const cookies = (res.headers.getSetCookie ? res.headers.getSetCookie() : [])
    .filter((c) => !c.includes('deleted'))
    .map((c) => c.split(';')[0]);

  if (!cookies.length) throw new Error('로그인 실패: 세션 쿠키를 받지 못했습니다. 계정 정보를 확인하십시오.');
  return cookies.join('; ');
}

/** 휴가 관리 AJAX 호출. 이 화면은 euc-kr이 아니라 UTF-8로 응답한다. */
async function fetchHoly(baseUrl, cookie, params) {
  const res = await fetch(`${baseUrl}${HOLY_DIR}/indexAjax.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookie,
      'User-Agent': 'Mozilla/5.0',
      Referer: `${baseUrl}${HOLY_DIR}/index.php`
    },
    body: new URLSearchParams(params).toString()
  });

  const text = new TextDecoder('utf-8').decode(await res.arrayBuffer());
  if (!res.ok) throw new Error(`휴가 관리 응답 오류 (HTTP ${res.status})`);

  try {
    return JSON.parse(text);
  } catch (_) {
    throw new Error('휴가 관리 응답이 JSON이 아닙니다. 세션이 만료되었을 수 있습니다.');
  }
}

function toDateStr(ymd) {
  const s = String(ymd || '');
  if (s.length !== 8) return s;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function num(v) {
  const n = Number(String(v || '').trim());
  return Number.isFinite(n) ? n : 0;
}

async function main() {
  console.log('🚀 [그룹웨어 휴가 관리 크롤링 & 동기화 시작]');

  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const mb_id = env.SITEGATE_ID || 'yellow';
  const mb_password = env.SITEGATE_PW || '';

  if (!mb_password) {
    console.error('❌ SITEGATE_PW(비밀번호)가 없습니다. .env 또는 환경변수를 확인하십시오.');
    process.exit(1);
  }

  console.log(`🔑 [1/4] sitegate.co.kr 로그인 중... (아이디: ${mb_id})`);
  const cookie = await login(baseUrl, mb_id, mb_password);
  console.log('✅ [1/4] 로그인 성공');

  const employees = loadEmployees();
  const names = [];
  employees.forEach((e) => {
    const name = String(e.name || '').trim();
    if (!name || EXCLUDED_NAMES.includes(name) || names.includes(name)) return;
    names.push(name);
  });
  console.log(`📥 [2/4] 임직원 ${names.length}명의 휴가 내역 조회 중... ('${EXCLUDED_NAMES.join(', ')}' 제외)`);

  const members = {};
  let totalItems = 0;

  for (const name of names) {
    // 개인별 조회: sfl=wr_name, stx=이름. 원본 화면이 쓰는 방식 그대로다.
    const j = await fetchHoly(baseUrl, cookie, {
      mode: 'list',
      startIndex: '0',
      pageIndex: '1',
      pageSize: '500',
      orderBy: 'wr_link1 DESC',
      sfl: 'wr_name',
      stx: encodeURIComponent(name)
    });

    const rows = Array.isArray(j[1]) ? j[1] : [];
    const items = rows.map((r) => ({
      date: toDateStr(r.wr_link1),
      type: String(r.wr_subject || '').trim(),
      reason: String(r.wr_content || '').trim(),
      startTime: String(r.wr_4 || '').trim(),
      endTime: String(r.wr_5 || '').trim(),
      deduct: deductionOf(r.wr_subject),
      appliedAt: String(r.wr_datetime || '').trim()
    })).sort((a, b) => String(b.date).localeCompare(String(a.date)));

    const counts = {};
    let used = 0;
    items.forEach((it) => {
      counts[it.type] = (counts[it.type] || 0) + 1;
      used += it.deduct;
    });

    const carriedOver = num(j[2]);
    const substitute = num(j[5]);
    const granted = num(j[8]);
    const total = carriedOver + granted + substitute;

    members[name] = {
      name,
      joinDate: String(j[4] || '').slice(0, 10),
      granted,
      carriedOver,
      substitute,
      total: Number(total.toFixed(2)),
      used: Number(used.toFixed(2)),
      remaining: Number((total - used).toFixed(2)),
      memo: String(j[9] || '').trim(),
      counts,
      items
    };

    totalItems += items.length;
    console.log(`   · ${name}: ${items.length}건 · 부여 ${total}일 / 사용 ${used}일 / 잔여 ${(total - used).toFixed(2)}일`);
  }

  console.log(`✅ [2/4] 휴가 내역 크롤링 완료: 총 ${totalItems}건 / ${names.length}명`);

  const leaves = {
    updatedAt: new Date().toISOString().slice(0, 10),
    year: new Date().getFullYear(),
    // 차감 규칙을 데이터에 함께 남긴다. 화면에서 다시 계산할 때 기준이 갈리지 않게 하기 위함이다.
    policy: { 연차: 1, '반차(오전)': 0.5, '반차(오후)': 0.5, 반반차: 0.25, 생일휴가: 0, 공가: 0, 병가: 0, 경조사: 0 },
    members
  };

  console.log('💾 [3/4] data/_legacy/leaves.json 및 data/mockData.js 동기화 중...');

  fs.writeFileSync(
    path.join(ROOT, 'data', '_legacy', 'leaves.json'),
    JSON.stringify(leaves, null, 2) + '\n',
    'utf8'
  );

  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let mock = fs.readFileSync(mockPath, 'utf8');

  const block = '  leaves: ' + JSON.stringify(leaves, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '  ' + line))
    .join('\n') + ',';

  if (/\n {2}leaves: \{[\s\S]*?\n {2}\},/.test(mock)) {
    mock = mock.replace(/\n {2}leaves: \{[\s\S]*?\n {2}\},/, '\n' + block);
  } else {
    // 최초 1회: finance 블록 앞에 새로 끼워 넣는다.
    const anchor = '\n  finance: {';
    if (!mock.includes(anchor)) throw new Error('mockData.js에서 삽입 위치(finance)를 찾지 못했습니다.');
    mock = mock.replace(anchor, '\n' + block + anchor);
  }

  fs.writeFileSync(mockPath, mock, 'utf8');
  console.log('✅ [3/4] mockData.js leaves 블록 동기화 완료');

  console.log('🔨 [4/4] Firestore 시드 재생성 및 무결성 검증 중...');
  execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });

  console.log('\n🎉 [성공] 휴가 관리 크롤링 및 전 디바이스 동기화가 완료되었습니다!');
}

main().catch((err) => {
  console.error('\n❌ 휴가 관리 크롤링 중 오류 발생:', err);
  process.exit(1);
});
