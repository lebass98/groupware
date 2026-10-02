#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate) 업무지원 요청/이슈 크롤러 & 전 디바이스 동기화
 *
 * 원본 게시판: bo_table=todo (작업요청게시판)
 * 상세 열람이 가능해 제목·작성자·날짜·본문·댓글수까지 수집한다.
 *
 * 산출물
 *   data/_legacy/issues.json
 *   data/mockData.js 의 extendedData.issues 블록 (앱이 이미 참조하는 슬롯)
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
  console.log('🚀 [그룹웨어 업무지원 요청/이슈 크롤링 & 동기화 시작]');
  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const id = env.SITEGATE_ID || 'yellow';
  const pw = env.SITEGATE_PW || '';
  if (!pw) { console.error('❌ SITEGATE_PW(비밀번호)가 없습니다.'); process.exit(1); }

  console.log(`🔑 [1/3] 로그인 중... (아이디: ${id})`);
  const cookie = await login(baseUrl, id, pw);
  const get = async (p) => dec(await (await fetch(baseUrl + p, { headers: { Cookie: cookie, 'User-Agent': 'Mozilla/5.0' } })).arrayBuffer());
  console.log('✅ [1/3] 로그인 성공');

  console.log('📥 [2/3] 목록 수집 및 상세 파싱 중...');
  const ids = [];
  let page = 1;
  while (page <= 20) {
    const h = await get(`/html/board/bbs/board.php?bo_table=todo&page=${page}`);
    const found = [...new Set([...h.matchAll(/[?&]wr_id=(\d+)/g)].map((m) => m[1]))];
    const fresh = found.filter((x) => !ids.includes(x));
    if (fresh.length === 0) break;
    ids.push(...fresh);
    page++;
  }

  const issues = [];
  for (const wrId of ids) {
    const h = await get(`/html/board/bbs/board.php?bo_table=todo&wr_id=${wrId}`);
    // 권한 제한 글은 건너뛴다.
    if (/읽기 권한이 없습니다|열람할 수 없|로그인/.test(h) && !/글쓴이/.test(h)) continue;
    const $ = cheerio.load(h);
    const subject = ($('title').text().split('>').pop() || '').trim();
    const body = $('body').text().replace(/[ \t]+/g, ' ');
    const author = (body.match(/글쓴이\s*[:：]\s*([^\n]+?)\s*\n/) || [])[1] || '';
    const date = (body.match(/날짜\s*[:：]\s*([0-9]{2}-[0-9]{2}-[0-9]{2}[^\n]*)/) || [])[1] || '';
    const hit = (body.match(/조회\s*[:：]\s*(\d+)/) || [])[1] || '';

    // 본문: 그누보드 기본 본문 영역 추정. 없으면 라벨 이후 텍스트에서 머리말 제거.
    let content = $('#bo_v_con, .view_content, .bo_v_con, td.board_view').text().replace(/\s+\n/g, '\n').trim();
    if (!content) {
      let after = body.split(/트랙백 주소[^\n]*\n/).pop() || '';
      // 트랙백/클립보드 관련 인라인 스크립트 잔여물 제거
      after = after
        .replace(/function\s+clipboard_trackback[\s\S]*?\n\s*\}\s*\n?/g, '')
        .replace(/if\s*\(g4_is_[\s\S]*?\}\s*/g, '')
        .replace(/window\.clipboardData[^\n]*\n/g, '')
        .replace(/prompt\([^\n]*\n/g, '')
        .replace(/alert\([^\n]*\n/g, '')
        .replace(/^[\s})]+/,'')
        .replace(/\n{2,}/g, '\n');
      content = after.trim().slice(0, 1000);
    }

    issues.push({
      wr_id: wrId,
      subject,
      author: author.trim(),
      date: date.trim(),
      hit,
      content: content.slice(0, 2000)
    });
  }
  console.log(`✅ [2/3] ${issues.length}건 수집`);

  console.log('💾 [3/3] 파일 동기화 중...');
  fs.writeFileSync(path.join(ROOT, 'data', '_legacy', 'issues.json'),
    JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), total: issues.length, issues }, null, 2) + '\n', 'utf8');

  // extendedData.issues 블록 치환
  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let mock = fs.readFileSync(mockPath, 'utf8');
  // extendedData 블록이 둘(window.MockData.extendedData, m.extendedData) 있고 키가 JSON 따옴표
  // 형식("issues": [...])이므로, 두 블록 모두 동일하게 치환한다.
  const arr = JSON.stringify(issues, null, 2).split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join('\n');
  const re = /("issues":\s*)\[[\s\S]*?\n {2}\]/g;
  const matches = mock.match(re);
  if (!matches) throw new Error('mockData.js의 "issues" 배열을 찾지 못했습니다.');
  mock = mock.replace(re, `$1${arr}`);
  console.log(`   (extendedData.issues ${matches.length}개 블록 갱신)`);
  fs.writeFileSync(mockPath, mock, 'utf8');

  execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n🎉 [성공] 업무지원 요청/이슈 크롤링 및 동기화 완료!');
}

main().catch((err) => { console.error('\n❌ 이슈 크롤링 오류:', err); process.exit(1); });
