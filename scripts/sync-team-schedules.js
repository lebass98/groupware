#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate.co.kr) 팀별 업무보고(wc_team_skedule) 크롤러 & 동기화 스크립트
 *
 * 기능:
 *  1. 팀별 업무보고 게시판(bo_table=wc_team_skedule) 최신 10페이지(약 150건 포스트) 수집
 *  2. 각 포스트별 코멘트(각 팀원별 프로젝트 및 작업내용) 병렬 수집 및 구조화
 *  3. data/_legacy/team_schedules.json 및 data/mockData.js (MockData.teamWorkReportsData) 반영
 *  4. 일자별 및 부서별 필터링이 가능하도록 정규화
 *  5. data/build-seed.js 실행 -> data/firebase-seed.json 자동 갱신
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// 1. .env 환경변수 파싱
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  });
  return env;
}

// 2. Sitegate 로그인
async function login(baseUrl, mb_id, mb_password) {
  const loginUrl = `${baseUrl}/html/board/bbs/login_check.php`;
  const bodyParams = new URLSearchParams({
    url: '/',
    mb_id,
    mb_password
  });

  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    body: bodyParams.toString(),
    redirect: 'manual'
  });

  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('로그인 실패: 세션 쿠키를 받지 못했습니다. 계정 정보를 확인해주세요.');
  }

  return setCookie
    .split(',')
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

// 3. 단일 상세 포스트 파싱
async function crawlSinglePost(baseUrl, cookieHeader, wr_id) {
  const viewUrl = `${baseUrl}/html/board/bbs/board.php?bo_table=wc_team_skedule&wr_id=${wr_id}`;
  const viewRes = await fetch(viewUrl, {
    headers: {
      Cookie: cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
  });

  const buf = Buffer.from(await viewRes.arrayBuffer());
  const html = iconv.decode(buf, 'euc-kr');
  const $ = cheerio.load(html);

  const entries = [];
  $('a[href*="comment_box"]').each((i, el) => {
    const href = $(el).attr('href');
    const m = href.match(/comment_box\s*\(\s*['"](\d+)['"]/);
    if (!m) return;
    const commentId = m[1];

    const tr = $(el).closest('tr');
    const projectSpan = tr.find('span[style*="color:#0066CC"], span[style*="color: #0066CC"]');
    const project = projectSpan.text().trim();
    const member = tr.find('.member').text().trim();
    const dateText = tr.find('td:nth-child(2)').text().trim();
    const timeMatch = dateText.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
    const createdAt = timeMatch ? timeMatch[1] : '';

    const containerTd = tr.closest('table').parent();
    const contentSpan = containerTd.find('span.ct, span.lh, td[style*="line-height:150%"]').first();
    const content = contentSpan.text().trim();

    entries.push({
      commentId,
      project: project || '일반 업무',
      member,
      createdAt,
      content
    });
  });

  return entries;
}

// 4. 메인 실행 함수
async function main() {
  console.log('🚀 [시작] 기존 그룹웨어 팀별 업무보고(wc_team_skedule) 크롤링 & 동기화');

  const env = loadEnv();
  const baseUrl = env.SITEGATE_BASE_URL || 'http://sitegate.co.kr';
  const mb_id = env.SITEGATE_ID;
  const mb_password = env.SITEGATE_PW;

  if (!mb_id || !mb_password) {
    console.error('❌ .env 파일에 SITEGATE_ID 또는 SITEGATE_PW가 설정되어 있지 않습니다.');
    process.exit(1);
  }

  console.log(`🔑 [1/4] Sitegate 로그인 시도 (${mb_id})...`);
  const cookieHeader = await login(baseUrl, mb_id, mb_password);
  console.log('✅ [1/4] 로그인 성공! 세션 획득 완료');

  console.log('📥 [2/4] 최근 10페이지(약 150건) 목록 수집 중...');
  const posts = [];
  for (let page = 1; page <= 10; page++) {
    const listRes = await fetch(`${baseUrl}/html/board/bbs/board.php?bo_table=wc_team_skedule&page=${page}`, {
      headers: { Cookie: cookieHeader }
    });
    const buf = Buffer.from(await listRes.arrayBuffer());
    const html = iconv.decode(buf, 'euc-kr');
    const $ = cheerio.load(html);

    $('table tr').each((i, el) => {
      const a = $(el).find('a[href*="wr_id"]').first();
      if (a.length) {
        const href = a.attr('href');
        const wr_id = href.match(/wr_id=(\d+)/)?.[1];
        const rawTitle = a.text().trim();
        const date = $(el).find('.datetime, td:nth-child(5)').first().text().trim();
        if (wr_id && rawTitle && !rawTitle.includes('게시물') && !posts.find(p => p.wr_id === wr_id)) {
          const teamMatch = rawTitle.match(/\[(.*?)\]/);
          const dateMatch = rawTitle.match(/(\d{4}-\d{2}-\d{2})/);
          posts.push({
            wr_id,
            rawTitle,
            team: teamMatch ? teamMatch[1] : '공통',
            targetDate: dateMatch ? dateMatch[1] : '',
            createdDate: date
          });
        }
      }
    });
  }
  console.log(`✅ [2/4] 목록 ${posts.length}건 수집 완료`);

  console.log(`📥 [3/4] ${posts.length}개 업무보고 상세 엔트리 병렬 수집 중 (동시 10건씩)...`);
  const startTime = Date.now();
  const batchSize = 10;
  for (let i = 0; i < posts.length; i += batchSize) {
    const slice = posts.slice(i, i + batchSize);
    await Promise.all(slice.map(async p => {
      p.entries = await crawlSinglePost(baseUrl, cookieHeader, p.wr_id);
    }));
    process.stdout.write(`  - 진행률: ${Math.min(i + batchSize, posts.length)}/${posts.length}\r`);
  }
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ [3/4] ${posts.length}개 업무보고 상세 수집 완료 (소요 시간: ${durationSec}초)`);

  console.log('💾 [4/4] 로컬 데이터 파일 및 MockData 반영 중...');

  // 4-1. data/_legacy/team_schedules.json
  const legacyPath = path.join(ROOT, 'data', '_legacy', 'team_schedules.json');
  fs.writeFileSync(legacyPath, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`  - ${legacyPath} (${posts.length}건 저장 완료)`);

  // 4-2. data/mockData.js 내 MockData.teamWorkReportsData 저장
  const mockDataPath = path.join(ROOT, 'data', 'mockData.js');
  let mockContent = fs.readFileSync(mockDataPath, 'utf8');
  const jsonString = JSON.stringify(posts, null, 2);

  if (mockContent.includes('teamWorkReportsData: [')) {
    mockContent = mockContent.replace(
      /(  teamWorkReportsData:\s*\[)[\s\S]*?(\n  \],)/,
      `$1\n${jsonString.slice(1, -1)}\n  ],`
    );
  } else {
    mockContent = mockContent.replace(
      /(  \/\/ 9-3\. 팀별 업무보고[\s\S]*?teamWorkReports:\s*\[[\s\S]*?\n  \],)/,
      `$1\n\n  // 9-4. 사이트게이트 실제 팀별 업무보고 일지 데이터 (wc_team_skedule 연동)\n  teamWorkReportsData: ${jsonString},`
    );
  }

  fs.writeFileSync(mockDataPath, mockContent, 'utf8');
  console.log(`  - ${mockDataPath} (MockData.teamWorkReportsData ${posts.length}건 동기화 완료)`);

  // 4-3. Firestore 시드 빌드 실행
  try {
    console.log('🔄 Firestore 시드 데이터(data/firebase-seed.json) 재생성 중...');
    execSync('node data/build-seed.js', { cwd: ROOT, stdio: 'inherit' });
    console.log('✅ Firestore 시드 빌드 완료');
  } catch (err) {
    console.warn('⚠️ Firestore 시드 빌드 중 경고 발생:', err.message);
  }

  console.log(`\n🎉 [성공] 팀별 업무보고 ${posts.length}건이 성공적으로 크롤링 및 동기화되었습니다!`);
}

main().catch(err => {
  console.error('❌ 팀별 업무보고 크롤링 중 오류 발생:', err);
  process.exit(1);
});
