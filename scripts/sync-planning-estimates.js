#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate) 기획팀 견적·제안서 대장 전수 크롤러 & 전 디바이스 동기화
 *
 * 원본 게시판: bo_table=project (기획팀, 850건 · 2007~2009년대 견적서/제안서/기타)
 *  - 목록 2번째 칸: '견적서 [작업완료]' 형태의 분류+진행상태
 *  - 상세 본문: 항목별 금액 테이블(금액/부가세/합계) — 합계 열을 합산해 totalAmount 산출
 *
 * 산출물
 *   data/_legacy/estimates.json          (850건 마스터 — 기존 estimate 게시판 테스트 글 43건 대체)
 *   data/mockData.js 의 "estimates" 블록 2곳 (앱 '견적·제안서 목록' 탭이 참조하는 슬롯)
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
  console.log('🚀 [그룹웨어 기획팀 견적·제안서 전수 크롤링 & 동기화 시작]');
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

  // 1) 목록: wr_id + 분류/상태/작성일시 수집
  console.log('📥 [2/4] 목록 전 페이지 수집 중...');
  const listInfo = new Map(); // wr_id → {category,status,listDate}
  const ids = [];
  let page = 1;
  while (page <= 80) {
    const h = await get(`/html/board/bbs/board.php?bo_table=project&page=${page}`);
    const $ = cheerio.load(h);
    let fresh = 0;
    $('tr').each((_, tr) => {
      const a = $(tr).find('a[href*="wr_id="]').first();
      const href = a.attr('href') || '';
      const m = href.match(/wr_id=(\d+)/);
      if (!m) return;
      const wrId = m[1];
      if (listInfo.has(wrId)) return;
      const tds = $(tr).find('td').map((j, td) => $(td).text().replace(/\s+/g, ' ').trim()).get().filter((x) => x);
      if (tds.length < 4 || !/^\d+$/.test(tds[0])) return;
      // 예: '견적서 [작업완료]' / '기타 [기타] [세금계산서 발급예정]'
      const cat = (tds[1].match(/^(견적서|제안서|기타|계약서|기획서)/) || [])[1] || '기타';
      const status = (tds[1].match(/\[([^\]]+)\]\s*$/) || [])[1] || '';
      const listDate = (tds.find((c) => /^\d{4}-\d{2}-\d{2}/.test(c)) || '').slice(0, 10);
      listInfo.set(wrId, { category: cat, status, listDate });
      ids.push(wrId);
      fresh++;
    });
    if (fresh === 0) break;
    page++;
  }
  console.log(`✅ [2/4] 총 ${ids.length}건 발견`);

  // 2) 상세: 항목 테이블에서 합계 합산
  console.log('📄 [3/4] 상세 파싱 중 (동시 8)...');
  const results = [];
  let done = 0;
  async function fetchOne(wrId) {
    const h = await get(`/html/board/bbs/board.php?bo_table=project&wr_id=${wrId}`);
    const $ = cheerio.load(h);
    const subject = ($('title').text().split('>').pop() || '').trim();
    const body = $('body').text().replace(/[ \t]+/g, ' ');
    const author = (body.match(/글쓴이\s*[:：]\s*([^\n]+?)\s*\n/) || [])[1] || '';
    const date = (body.match(/날짜\s*[:：]\s*([0-9]{2}-[0-9]{2}-[0-9]{2}[^\n]*)/) || [])[1] || '';

    // 항목 테이블: [항목명, 금액, 부가세, 합계] 형태의 행에서 합계 열 합산
    // 항목 행 합산 — '전체/합계/총계/소계' 요약 행이 있으면 그 값을 총액으로 쓰고, 없으면 개별 항목 합산
    let itemSum = 0;
    let grandRow = 0;
    const items = [];
    $('tr').each((_, tr) => {
      const tds = $(tr).find('td').map((j, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
      if (tds.length < 4) return;
      const nums = tds.slice(-3).map((c) => (/^[0-9,]+$/.test(c) ? Number(c.replace(/,/g, '')) : NaN));
      if (nums.some(isNaN)) return;
      const [amt, vat, sum] = nums;
      const name = tds.slice(0, tds.length - 3).join(' ').replace(/^항목(_\d+)?\s*/, '').trim();
      if (sum <= 0) return;
      if (/^(전체|합계|총계|소계)$/.test(name)) { grandRow = Math.max(grandRow, sum); return; }
      itemSum += sum;
      if (items.length < 8 && name) items.push({ name: name.slice(0, 60), amount: amt, vat, sum });
    });
    const totalAmount = grandRow || itemSum;

    const files = [];
    $('a[href*="download.php"]').each((_, a) => {
      const name = $(a).text().replace(/\s+/g, ' ').trim();
      const href = $(a).attr('href') || '';
      if (name && files.length < 2) files.push({ name, url: href.startsWith('http') ? href : baseUrl + href });
    });

    let content = $('#bo_v_con, .view_content, .bo_v_con, td.board_view').text().trim();
    if (!content) {
      const parts = body.split(/트랙백 주소[^\n]*\n/);
      content = (parts.pop() || '')
        .replace(/function\s+clipboard[\s\S]*?\n\s*\}\s*\n?/g, '')
        .replace(/if\s*\(g4_is_[\s\S]*?\}\s*/g, '')
        .replace(/window\.clipboardData[^\n]*\n/g, '')
        .replace(/prompt\([^\n]*\n/g, '')
        .replace(/alert\([^\n]*\n/g, '')
        .replace(/^[\s})]+/, '')
        .replace(/\n{3,}/g, '\n\n').trim().slice(0, 400);
    }

    const li = listInfo.get(wrId) || {};
    results.push({
      wr_id: wrId,
      subject,
      category: li.category || '',
      status: li.status || '',
      author: author.trim(),
      date: date.trim(),
      listDate: li.listDate || '',
      totalAmount,
      items,
      files,
      content: content.slice(0, 400)
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
  console.log(`✅ [3/4] ${results.length}건 파싱 (금액 확보 ${withAmt.length}건, 합계 ${(withAmt.reduce((s, r) => s + r.totalAmount, 0) / 1e8).toFixed(2)}억)`);

  console.log('💾 [4/4] 파일 동기화 중...');
  const master = {
    updatedAt: new Date().toISOString().slice(0, 10),
    source: 'bo_table=project (기획팀 견적·제안서 대장)',
    total: results.length,
    withAmount: withAmt.length,
    estimates: results
  };
  fs.writeFileSync(path.join(ROOT, 'data', '_legacy', 'estimates.json'), JSON.stringify(master, null, 1) + '\n', 'utf8');

  // 앱 '견적·제안서 목록' 탭용 경량 레코드 (기존 estimates 항목 필드 호환)
  const lite = results.map((r) => ({
    wr_id: r.wr_id,
    category: r.category,
    status: r.status,
    subject: r.subject,
    author: r.author,
    date: r.date.slice(0, 8),
    hit: '',
    commentCount: 0,
    content: r.content.slice(0, 200),
    files: r.files,
    meta: r.totalAmount ? { '견적총액': r.totalAmount.toLocaleString('en-US'), '진행상태': r.status || '-' } : (r.status ? { '진행상태': r.status } : {}),
    comments: [],
    totalAmount: r.totalAmount ? r.totalAmount.toLocaleString('en-US') : ''
  }));

  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let mock = fs.readFileSync(mockPath, 'utf8');
  const arr = JSON.stringify(lite, null, 2).split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join('\n');
  const re = /("estimates":\s*)\[[\s\S]*?\n {2}\]/g;
  const matches = mock.match(re);
  if (!matches) throw new Error('mockData.js의 "estimates" 배열을 찾지 못했습니다.');
  mock = mock.replace(re, `$1${arr}`);
  console.log(`   (extendedData.estimates ${matches.length}개 블록 → ${lite.length}건 갱신)`);
  fs.writeFileSync(mockPath, mock, 'utf8');

  execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n🎉 [성공] 기획팀 견적·제안서 전수 크롤링 및 동기화 완료!');
}

main().catch((err) => { console.error('\n❌ 기획팀 크롤링 오류:', err); process.exit(1); });
