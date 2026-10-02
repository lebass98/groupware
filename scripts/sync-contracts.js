#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate) 계약서 게시판 전수 크롤러 & 전 디바이스 동기화
 *
 * 원본 게시판: bo_table=contract (계약서, 941건 · 2000년 작업 아카이브 포함)
 * 상세의 '♥ 라벨 : 값' 메타(계약일·계약총액·계약유형·지불방식)와 첨부 목록을 수집한다.
 * 금액: 메타 계약총액(>0) 우선, 없으면 본문의 최대 콤마 숫자(총액≥분할금)를 총액으로 본다.
 *   ※ 2012~2019년 대부분은 금액이 시스템 미입력(첨부 PDF에만 존재) — amount=0으로 남는다.
 *
 * 산출물
 *   data/_legacy/contracts.json            (전수 941건, 금액 포함 마스터)
 *   data/mockData.js 의 "contracts" 블록 2곳 (앱 표시용 — 본문 240자·첨부 2개로 경량화)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

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
  console.log('🚀 [그룹웨어 계약서 전수 크롤링 & 동기화 시작]');
  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const id = env.SITEGATE_ID || 'yellow';
  const pw = env.SITEGATE_PW || '';
  if (!pw) { console.error('❌ SITEGATE_PW(비밀번호)가 없습니다.'); process.exit(1); }

  console.log(`🔑 [1/4] 로그인 중... (아이디: ${id})`);
  const cookie = await login(baseUrl, id, pw);
  const get = async (p) => {
    for (let a = 0; a < 3; a++) {
      try {
        const r = await fetch(baseUrl + p, { headers: { Cookie: cookie, 'User-Agent': 'Mozilla/5.0' } });
        return dec(await r.arrayBuffer());
      } catch (e) { if (a === 2) throw e; await new Promise((s) => setTimeout(s, 800)); }
    }
  };
  console.log('✅ [1/4] 로그인 성공');

  console.log('📥 [2/4] 목록 전 페이지 수집 중...');
  const ids = [];
  const seen = new Set();
  let page = 1;
  while (page <= 120) {
    const h = await get(`/html/board/bbs/board.php?bo_table=contract&page=${page}`);
    const found = [...new Set([...h.matchAll(/[?&]wr_id=(\d+)/g)].map((m) => m[1]))];
    const fresh = found.filter((x) => !seen.has(x));
    if (!fresh.length) break;
    fresh.forEach((x) => seen.add(x));
    ids.push(...fresh);
    page++;
  }
  console.log(`✅ [2/4] 총 ${ids.length}건 발견`);

  console.log('📄 [3/4] 상세 파싱 중 (동시 8)...');
  const results = [];
  let done = 0;
  async function fetchOne(wrId) {
    const h = await get(`/html/board/bbs/board.php?bo_table=contract&wr_id=${wrId}`);
    const $ = cheerio.load(h);
    const subject = ($('title').text().split('>').pop() || '').trim();
    const body = $('body').text().replace(/[ \t]+/g, ' ');
    const author = (body.match(/글쓴이\s*[:：]\s*([^\n]+?)\s*\n/) || [])[1] || '';
    const date = (body.match(/날짜\s*[:：]\s*([0-9]{2}-[0-9]{2}-[0-9]{2}[^\n]*)/) || [])[1] || '';

    // '♥ 라벨 : 값' 메타
    const meta = {};
    for (const m of body.matchAll(/[♥●■]\s*([가-힣0-9차 ]{2,14}?)\s*[:：]\s*([^\n♥●■]*)/g)) {
      const key = m[1].replace(/\s+/g, ' ').trim();
      const val = m[2].replace(/\s+/g, ' ').trim();
      if (key && val && !meta[key]) meta[key] = val;
    }

    // 첨부: download.php 링크와 링크 텍스트
    const files = [];
    $('a[href*="download.php"]').each((_, a) => {
      const name = $(a).text().replace(/\s+/g, ' ').trim();
      const href = $(a).attr('href') || '';
      if (name && files.length < 2) files.push({ name, url: href.startsWith('http') ? href : baseUrl + href });
    });

    // 금액: 메타 우선, 0이면 본문 최대 콤마 숫자
    let amount = Number((meta['계약총액'] || '').replace(/[^0-9]/g, '')) || 0;
    let amountSource = amount > 0 ? 'meta' : '';
    if (!amount) {
      const nums = [...body.matchAll(/([0-9]{1,3}(?:,[0-9]{3}){1,4})/g)]
        .map((m) => Number(m[1].replace(/,/g, '')))
        .filter((n) => n >= 100000 && n < 10000000000);
      if (nums.length) { amount = Math.max(...nums); amountSource = 'body'; }
    }

    let content = $('#bo_v_con, .view_content, .bo_v_con, td.board_view').text().trim();
    if (!content) {
      const parts = body.split(/트랙백 주소[^\n]*\n/);
      content = (parts.pop() || '')
        .replace(/function\s+clipboard[\s\S]*$/, '')
        .replace(/alert\([^\n]*\n/g, '')
        .replace(/\n{3,}/g, '\n\n').trim().slice(0, 600);
    }

    results.push({
      wr_id: wrId,
      subject,
      author: author.trim(),
      date: date.trim(),
      contractDate: meta['계약일'] || '',
      contractType: meta['계약유형'] || '',
      payMethod: meta['지불방식'] || '',
      totalAmount: amount,
      amountSource,
      meta,
      files,
      content: content.slice(0, 600)
    });
    done++;
    if (done % 100 === 0) console.log(`   ${done}/${ids.length}...`);
  }
  const queue = [...ids];
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (queue.length) { const wid = queue.shift(); try { await fetchOne(wid); } catch (e) { console.error('   ERR', wid, e.message); } }
  }));
  results.sort((a, b) => Number(b.wr_id) - Number(a.wr_id));
  const withAmt = results.filter((r) => r.totalAmount > 0);
  console.log(`✅ [3/4] ${results.length}건 파싱 (금액 확보 ${withAmt.length}건, 합계 ${(withAmt.reduce((s, r) => s + r.totalAmount, 0) / 1e8).toFixed(1)}억)`);

  console.log('💾 [4/4] 파일 동기화 중...');
  const master = {
    updatedAt: new Date().toISOString().slice(0, 10),
    total: results.length,
    withAmount: withAmt.length,
    amountNote: '2012~2019년 다수는 계약총액 시스템 미입력(첨부 PDF에만 존재)으로 totalAmount=0',
    contracts: results
  };
  fs.writeFileSync(path.join(ROOT, 'data', '_legacy', 'contracts.json'), JSON.stringify(master, null, 1) + '\n', 'utf8');

  // 앱 표시용 경량 레코드 (기존 mockData "contracts" 항목과 필드 호환)
  const lite = results.map((r) => ({
    wr_id: r.wr_id,
    category: '',
    subject: r.subject,
    author: r.author,
    date: r.date.slice(0, 8),
    hit: '',
    commentCount: 0,
    content: r.content.slice(0, 240),
    files: r.files,
    meta: r.meta,
    comments: [],
    contractDate: r.contractDate,
    totalAmount: r.totalAmount ? r.totalAmount.toLocaleString('en-US') : '',
    contractType: r.contractType
  }));

  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let mock = fs.readFileSync(mockPath, 'utf8');
  const arr = JSON.stringify(lite, null, 2).split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join('\n');
  const re = /("contracts":\s*)\[[\s\S]*?\n {2}\]/g;
  const matches = mock.match(re);
  if (!matches) throw new Error('mockData.js의 "contracts" 배열을 찾지 못했습니다.');
  mock = mock.replace(re, `$1${arr}`);
  console.log(`   (extendedData.contracts ${matches.length}개 블록 → ${lite.length}건 갱신)`);
  fs.writeFileSync(mockPath, mock, 'utf8');

  execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n🎉 [성공] 계약서 전수 크롤링 및 동기화 완료!');
}

main().catch((err) => { console.error('\n❌ 계약서 크롤링 오류:', err); process.exit(1); });
