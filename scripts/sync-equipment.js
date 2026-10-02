#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate) 비품/자산 대장 크롤러 & 전 디바이스 동기화
 *
 * 원본 게시판: bo_table=equipment (비품관리)
 * 상세 본문에 사용팀·사용자·비품코드·취득일·사용여부 등 자산 속성이 '● 라벨 : 값' 형태로 들어 있다.
 *
 * 산출물
 *   data/_legacy/equipment.json
 *   data/mockData.js 의 equipment 블록
 *   (이후 build:seed / verify:seed 로 Firestore 시드까지 갱신)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
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

/** 본문 텍스트에서 '● 라벨 : 값' 형태의 자산 속성을 뽑는다. */
function parseAttrs(text) {
  const attrs = {};
  text.split('\n').forEach((line) => {
    const m = line.match(/●\s*([^:：]+)[:：]\s*(.*)$/);
    if (m) {
      const key = m[1].replace(/\s+/g, ' ').trim();
      const val = m[2].replace(/\s+/g, ' ').trim();
      if (key) attrs[key] = val;
    }
  });
  return attrs;
}

async function main() {
  console.log('🚀 [그룹웨어 비품/자산 대장 크롤링 & 동기화 시작]');
  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const id = env.SITEGATE_ID || 'yellow';
  const pw = env.SITEGATE_PW || '';
  if (!pw) { console.error('❌ SITEGATE_PW(비밀번호)가 없습니다.'); process.exit(1); }

  console.log(`🔑 [1/4] 로그인 중... (아이디: ${id})`);
  const cookie = await login(baseUrl, id, pw);
  const get = async (p) => dec(await (await fetch(baseUrl + p, { headers: { Cookie: cookie, 'User-Agent': 'Mozilla/5.0' } })).arrayBuffer());
  console.log('✅ [1/4] 로그인 성공');

  // 1. 목록 전 페이지에서 글 id 수집
  console.log('📥 [2/4] 비품 목록 수집 중...');
  const ids = [];
  let page = 1;
  while (page <= 30) {
    const h = await get(`/html/board/bbs/board.php?bo_table=equipment&page=${page}`);
    const found = [...new Set([...h.matchAll(/[?&]wr_id=(\d+)/g)].map((m) => m[1]))];
    const fresh = found.filter((x) => !ids.includes(x));
    if (fresh.length === 0) break;
    ids.push(...fresh);
    page++;
  }
  console.log(`✅ [2/4] 총 ${ids.length}건 발견`);

  // 2. 각 글 상세 파싱
  console.log('📄 [3/4] 상세 정보 파싱 중...');
  const items = [];
  for (const wrId of ids) {
    const h = await get(`/html/board/bbs/board.php?bo_table=equipment&wr_id=${wrId}`);
    const $ = cheerio.load(h);
    const rawTitle = ($('title').text().split('>').pop() || '').trim();
    const body = $('body').text().replace(/[ \t]+/g, ' ');

    // 글쓴이 / 날짜 / 조회
    const author = (body.match(/글쓴이\s*[:：]\s*([^\n]+?)\s*\n/) || [])[1] || '';
    const dateRaw = (body.match(/날짜\s*[:：]\s*([0-9]{2}-[0-9]{2}-[0-9]{2}[^\n]*)/) || [])[1] || '';

    const attrs = parseAttrs(body);

    // 제목 앞 날짜(YYYY.MM.DD) 분리
    const dm = rawTitle.match(/^(\d{4}[.\-]\d{1,2}[.\-]\d{1,2})\s*[-·]?\s*(.*)$/);
    const acquireDate = attrs['취득일'] || (dm ? dm[1].replace(/\./g, '-') : '');
    const name = dm ? dm[2].trim() : rawTitle;

    items.push({
      wr_id: wrId,
      title: name || rawTitle,
      author: author.trim(),
      date: dateRaw.trim(),
      team: attrs['사용팀'] || '',
      user: attrs['사용자'] || '',
      // 비품코드에 한글이 섞이면 라벨 값이 비어 본문이 잘못 잡힌 것이므로 무효 처리한다.
      code: (/[가-힣]/.test(attrs['비품코드'] || '') ? '' : (attrs['비품코드'] || '')),
      category: attrs['비품종류'] || '',
      location: attrs['위치 (비품)'] || attrs['위치'] || '',
      status: attrs['현재 사용여부'] || '',
      acquireDate,
      disposeDate: attrs['처분일'] || ''
    });
  }

  const inUse = items.filter((i) => /사용/.test(i.status)).length;
  console.log(`✅ [3/4] 파싱 완료: ${items.length}건 (사용중 ${inUse}건)`);

  // 3. 저장
  console.log('💾 [4/4] 파일 동기화 중...');
  const equipment = { updatedAt: new Date().toISOString().slice(0, 10), total: items.length, items };

  fs.writeFileSync(path.join(ROOT, 'data', '_legacy', 'equipment.json'), JSON.stringify(equipment, null, 2) + '\n', 'utf8');

  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let mock = fs.readFileSync(mockPath, 'utf8');
  const block = '  equipment: ' + JSON.stringify(equipment, null, 2)
    .split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join('\n') + ',';

  if (/\n {2}equipment: \{[\s\S]*?\n {2}\},/.test(mock)) {
    mock = mock.replace(/\n {2}equipment: \{[\s\S]*?\n {2}\},/, '\n' + block);
  } else {
    const anchor = '\n  finance: {';
    if (!mock.includes(anchor)) throw new Error('mockData.js에서 삽입 위치(finance)를 찾지 못했습니다.');
    mock = mock.replace(anchor, '\n' + block + anchor);
  }
  fs.writeFileSync(mockPath, mock, 'utf8');

  execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n🎉 [성공] 비품/자산 대장 크롤링 및 전 디바이스 동기화 완료!');
}

main().catch((err) => { console.error('\n❌ 비품 크롤링 오류:', err); process.exit(1); });
