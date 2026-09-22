#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate) 경비지출내역 크롤러 & 전 디바이스 동기화
 *
 * 원본 게시판: bo_table=cardncash (경비지출내역, 3,223건)
 *
 * 제약: 상세 글은 '작성자만 열람 가능' 권한이 걸려 있어 금액 상세는 크롤링할 수 없다.
 *       따라서 목록에서 얻을 수 있는 정보(제목·분류·결제수단·작성자·지출일)만 수집한다.
 *       금액이 필요하면 각 담당자 계정으로 열람해야 하므로 여기서는 amount=null로 둔다.
 *
 * 산출물
 *   data/_legacy/expenses.json
 *   data/mockData.js 의 expenseRecords 블록  (기존 finance.expenses 목데이터와 별개 슬롯)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RECENT_PAGES = Number((process.argv.find((a) => a.startsWith('--pages=')) || '').split('=')[1]) || 40;

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
  ['SITEGATE_URL', 'SITEGATE_ID', 'SITEGATE_PW'].forEach((k) => {
    if (!env[k] && process.env[k]) env[k] = process.env[k];
  });
  return env;
}

function dec(buf) {
  let u = new TextDecoder('utf-8').decode(buf);
  if ((u.match(/�/g) || []).length > 5) u = new TextDecoder('euc-kr').decode(buf);
  return u;
}

async function login(baseUrl, id, pw) {
  const res = await fetch(`${baseUrl}/html/board/bbs/login_check.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
    body: new URLSearchParams({ url: '/', mb_id: id, mb_password: pw }).toString(),
    redirect: 'manual'
  });
  const cookies = (res.headers.getSetCookie ? res.headers.getSetCookie() : [])
    .filter((c) => !c.includes('deleted')).map((c) => c.split(';')[0]);
  if (!cookies.length) throw new Error('로그인 실패: 세션 쿠키를 받지 못했습니다.');
  return cookies.join('; ');
}

async function main() {
  console.log('🚀 [그룹웨어 경비지출내역 크롤링 & 동기화 시작]');
  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const id = env.SITEGATE_ID || 'yellow';
  const pw = env.SITEGATE_PW || '';
  if (!pw) { console.error('❌ SITEGATE_PW(비밀번호)가 없습니다.'); process.exit(1); }

  console.log(`🔑 [1/3] 로그인 중... (아이디: ${id})`);
  const cookie = await login(baseUrl, id, pw);
  const get = async (p) => dec(await (await fetch(baseUrl + p, { headers: { Cookie: cookie, 'User-Agent': 'Mozilla/5.0' } })).arrayBuffer());
  console.log('✅ [1/3] 로그인 성공');

  console.log(`📥 [2/3] 경비 목록 크롤링 중 (최근 ${RECENT_PAGES}페이지)...`);
  const records = [];
  const seen = new Set();
  for (let page = 1; page <= RECENT_PAGES; page++) {
    const h = await get(`/html/board/bbs/board.php?bo_table=cardncash&page=${page}`);
    const $ = cheerio.load(h);
    let addedThisPage = 0;
    $('tr').each((_, tr) => {
      const tds = $(tr).find('td').map((j, td) => $(td).text().replace(/\s+/g, ' ').trim()).get().filter((x) => x);
      // 유효 행: 첫 셀이 숫자(글번호)
      if (tds.length < 5 || !/^\d+$/.test(tds[0])) return;
      const no = tds[0];
      if (seen.has(no)) return;
      seen.add(no);

      // 컬럼은 [번호, (분류), 제목, 결제수단, 글쓴이, 지출일(등록일), 조회, ...] 순이다.
      // 분류 셀이 선택적이라 위치가 밀리므로, 고정 형식인 지출일(YYYY-MM-DD)을 기준으로 역산한다.
      const dateIdx = tds.findIndex((c) => /\d{4}-\d{2}-\d{2}/.test(c));
      if (dateIdx < 3) return; // 정상 행이 아니면 건너뛴다.
      const spendDate = (tds[dateIdx].match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || '';
      const author = tds[dateIdx - 1] || '';
      const payment = tds[dateIdx - 2] || '';
      const title = tds[dateIdx - 3] || '';

      records.push({
        no,
        title: title.trim(),
        payment: payment.trim(),
        author: author.trim(),
        date: spendDate,
        amount: null // 상세 열람 권한 제한으로 금액은 수집 불가
      });
      addedThisPage++;
    });
    if (addedThisPage === 0) break;
  }
  console.log(`✅ [2/3] ${records.length}건 수집 (금액은 권한 제한으로 제외)`);

  console.log('💾 [3/3] 파일 동기화 중...');
  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    total: records.length,
    note: '금액은 sitegate 상세 열람 권한(작성자 전용) 제한으로 수집되지 않습니다.',
    records
  };
  fs.writeFileSync(path.join(ROOT, 'data', '_legacy', 'expenses.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');

  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let mock = fs.readFileSync(mockPath, 'utf8');
  const block = '  expenseRecords: ' + JSON.stringify(payload, null, 2)
    .split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join('\n') + ',';
  if (/\n {2}expenseRecords: \{[\s\S]*?\n {2}\},/.test(mock)) {
    mock = mock.replace(/\n {2}expenseRecords: \{[\s\S]*?\n {2}\},/, '\n' + block);
  } else {
    const anchor = '\n  finance: {';
    mock = mock.replace(anchor, '\n' + block + anchor);
  }
  fs.writeFileSync(mockPath, mock, 'utf8');

  execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n🎉 [성공] 경비지출내역 크롤링 및 동기화 완료!');
}

main().catch((err) => { console.error('\n❌ 경비 크롤링 오류:', err); process.exit(1); });
