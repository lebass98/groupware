#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate.co.kr) 근태일지 크롤러 및 동기화 스크립트
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// .env 파일 파싱
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  });
  return env;
}

async function run() {
  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const mb_id = env.SITEGATE_ID || 'yellow';
  const mb_password = env.SITEGATE_PW || '';

  if (!mb_password) {
    console.error('❌ .env 파일에 SITEGATE_PW(비밀번호)가 입력되지 않았습니다.');
    console.error('👉 .env 파일을 열고 SITEGATE_PW=비밀번호 를 입력해 주세요.');
    process.exit(1);
  }

  console.log(`🔑 [1/3] sitegate.co.kr 로그인 시도 중... (아이디: ${mb_id})`);

  // 1. 로그인 요청 (POST /html/board/bbs/login_check.php)
  const loginUrl = `${baseUrl}/html/board/bbs/login_check.php`;
  const targetBoardPath = `/html/board/bbs/board.php?bo_table=daily_report&skin=diary&id=${mb_id}`;

  const bodyParams = new URLSearchParams();
  bodyParams.append('url', targetBoardPath);
  bodyParams.append('mb_id', mb_id);
  bodyParams.append('mb_password', mb_password);

  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    body: bodyParams.toString(),
    redirect: 'manual'
  });

  // 쿠키 수집
  const rawCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
  const cookieHeader = rawCookies.map(c => c.split(';')[0]).join('; ');

  // 로그인 성공 여부 검사 (EUC-KR 디코딩)
  const loginBuffer = await loginRes.arrayBuffer();
  const loginHtml = new TextDecoder('euc-kr').decode(loginBuffer);

  if (loginHtml.includes('alert(')) {
    const alertMsg = loginHtml.match(/alert\(['"]([^'"]+)['"]\)/);
    const msg = alertMsg ? alertMsg[1] : '로그인 실패';
    console.error(`❌ 로그인 실패: ${msg}`);
    process.exit(1);
  }

  console.log('✅ [1/3] 로그인 성공! 세션 쿠키 획득 완료');
  console.log(`📥 [2/3] 근태일지 페이지 요청 중... (${targetBoardPath})`);

  // 2. 근태일지 페이지 가져오기
  const boardUrl = `${baseUrl}${targetBoardPath}`;
  const boardRes = await fetch(boardUrl, {
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
  });

  const boardBuffer = await boardRes.arrayBuffer();
  const boardHtml = new TextDecoder('euc-kr').decode(boardBuffer);

  console.log('✅ [2/3] 근태일지 HTML 수신 완료 (길이: ' + boardHtml.length + '자)');

  // 임시로 응답 분석을 위해 scratch 폴더에 저장
  const scratchDir = path.resolve(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, 'latest_board.html'), boardHtml, 'utf8');

  console.log('📄 HTML 원본이 scratch/latest_board.html 에 임시 저장되었습니다.');
  console.log('🔍 [3/3] 일정 데이터 파싱 준비 완료.');
}

run().catch(err => {
  console.error('오류 발생:', err);
});
