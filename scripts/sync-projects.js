#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate.co.kr) 전체 프로젝트 크롤러 & 동기화 스크립트
 *
 * 지원 기능:
 *  1. 프로젝트 게시판(bo_table=wc_project) 1~13페이지 전체 목록 수집 (총 370건)
 *  2. 각 프로젝트별 상세 페이지 병렬 배치 수집 및 정밀 파싱:
 *     - 프로젝트명, 프로젝트ID, URL, 발주처(클라이언트), 사이트명
 *     - PM, 기획, 디자인, 퍼블리싱, 개발 담당자
 *     - 기간(시작일/종료일), 진행상태(진행 중, 완료, 대기, 유지보수)
 *     - 담당자 연락처(clientContacts), 첨부파일(attachments), 댓글(comments)
 *  3. data/_legacy/projects.json 및 data/mockData.js 자동 치환
 *  4. data/build-seed.js 실행 -> data/firebase-seed.json 갱신 및 검증
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
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

  const rawCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const validCookies = rawCookies
    .filter(c => !c.includes('deleted'))
    .map(c => c.split(';')[0]);

  const buf = await res.arrayBuffer();
  const html = new TextDecoder('euc-kr').decode(buf);
  if (html.includes('alert(')) {
    const m = html.match(/alert\(['"]([^'"]+)['"]\)/);
    throw new Error(m ? m[1] : '로그인에 실패했습니다.');
  }

  return validCookies.join('; ');
}

// 3. 카테고리 추론 헬퍼
function inferCategory(title, clientName) {
  const combined = `${title} ${clientName}`;
  if (/문화|예술|메세나|작가|축제|영화|이음|예술인|박물관|미술관/i.test(combined)) return '문화/예술';
  if (/수소|에너지|전력|가스|환경|태양광|원자력/i.test(combined)) return '에너지/공공';
  if (/취업|고용|노동|인재|직업|고용정보/i.test(combined)) return '취업/고용';
  if (/가족|건강가정|복지|사회복지|아동|청소년|여성/i.test(combined)) return '사회/복지';
  if (/재단|진흥원|협회|공단|공사|시청|구청|정부|공공|교육원|연구원|개발원|관세/i.test(combined)) return '공공/행정';
  if (/플랫폼|포털|시스템|앱|웹|모바일|솔루션|소프트|솔루션/i.test(combined)) return 'IT/플랫폼';
  return '일반/기타';
}

// 4. 상세 페이지 파싱
function parseProjectDetail(html, wr_id, no, listItem) {
  const $ = cheerio.load(html);

  let rawTitle = listItem ? listItem.title : '';
  let author = listItem ? listItem.author : '';
  let dateFull = listItem ? listItem.date : '';
  let views = listItem ? listItem.views : 0;

  // Header parsing
  $('td').each((_, td) => {
    const t = $(td).text().replace(/\s+/g, ' ').trim();
    if (t.includes('글쓴이') && t.includes('날짜') && t.includes('조회')) {
      const m = t.match(/^(.*?)\s*글쓴이\s*:\s*(\S+)\s*날짜\s*:\s*([\d-]+\s*[\d:]+)\s*조회\s*:\s*(\d+)/);
      if (m) {
        if (m[1].trim()) rawTitle = m[1].trim();
        if (m[2].trim()) author = m[2].trim();
        if (m[3].trim()) dateFull = m[3].trim();
        if (m[4].trim()) views = parseInt(m[4], 10) || views;
      }
    }
  });

  // Extract projectId and clean title
  let projectId = '';
  let title = rawTitle;
  const pMatch = rawTitle.match(/^(.*?)\s*\((p_[a-zA-Z0-9_-]+)\)/);
  if (pMatch) {
    title = pMatch[1].trim();
    projectId = pMatch[2].trim();
  }

  // Body bullet parsing
  let clientName = '';
  let clientId = '';
  let siteName = listItem ? listItem.siteName : '';
  let siteId = '';
  let pm = (listItem && listItem.pm && listItem.pm !== '.') ? listItem.pm : '-';
  let planner = '-';
  let designer = '-';
  let publisher = '-';
  let developer = '-';
  let period = listItem ? listItem.period : '-';
  let periodStart = '';
  let periodEnd = '';
  let statusText = '완료';
  let status = 'completed';
  const clientContacts = [];
  const urls = [];

  const bodyText = $('body').text();
  const bullets = bodyText.split('●').map(b => b.trim()).filter(Boolean);

  bullets.forEach(b => {
    if (b.startsWith('클라이언트')) {
      const val = b.replace(/^클라이언트\s*:\s*/, '').split('●')[0].trim();
      const parts = val.split(/\s+/);
      clientName = parts[0] || '';
      clientId = parts[1] || '';
    } else if (b.startsWith('사이트')) {
      const val = b.replace(/^사이트\s*:\s*/, '').split('●')[0].trim();
      const parts = val.split(/\s+/);
      siteName = parts[0] || siteName;
      siteId = parts[1] || '';
    } else if (b.startsWith('PM')) {
      const val = b.replace(/^PM\s*:\s*/, '').split('●')[0].trim();
      if (val && val !== '.') pm = val;
    } else if (b.includes('담당자(기획)')) {
      const val = b.replace(/.*담당자\(기획\)\s*:\s*/, '').split('●')[0].trim();
      if (val && val !== '.') planner = val;
    } else if (b.includes('담당자(디자인)')) {
      const val = b.replace(/.*담당자\(디자인\)\s*:\s*/, '').split('●')[0].trim();
      if (val && val !== '.') designer = val;
    } else if (b.includes('담당자(코딩)')) {
      const val = b.replace(/.*담당자\(코딩\)\s*:\s*/, '').split('●')[0].trim();
      if (val && val !== '.') publisher = val;
    } else if (b.includes('담당자(개발)')) {
      const val = b.replace(/.*담당자\(개발\)\s*:\s*/, '').split('●')[0].trim();
      if (val && val !== '.') developer = val;
    } else if (b.includes('프로젝트 기간')) {
      period = b.replace(/.*프로젝트 기간\s*:\s*/, '').split('●')[0].trim();
    } else if (b.includes('진행상태')) {
      const rawStatus = b.replace(/.*진행상태\s*:\s*/, '').split(/\s+/)[0].trim();
      if (rawStatus.includes('진행중') || rawStatus.includes('진행 중')) {
        status = 'in_progress';
        statusText = '진행 중';
      } else if (rawStatus.includes('유지보수')) {
        status = 'maintenance';
        statusText = '유지보수';
      } else if (rawStatus.includes('대기')) {
        status = 'planned';
        statusText = '대기';
      } else {
        status = 'completed';
        statusText = '완료';
      }
    } else if (b.startsWith('담당자') && b.includes(':')) {
      const dateMatch = b.match(/\[([\d-]+)\]/);
      const contactDate = dateMatch ? dateMatch[1] : '';
      const content = b.split(':')[1] || '';
      const tokens = content.split('|').map(t => t.trim());
      if (tokens.length >= 2 && tokens[0]) {
        clientContacts.push({
          label: b.split('[')[0].trim(),
          date: contactDate,
          name: tokens[0] || '',
          position: tokens[1] || '',
          tel: (tokens[2] || '').replace('전화', '').trim(),
          fax: (tokens[3] || '').replace('팩스', '').trim() || '-',
          mobile: tokens[4] || '-',
          email: tokens[5] || ''
        });
      }
    }
  });

  if (period && period.includes('~')) {
    const pParts = period.split('~').map(s => s.trim());
    periodStart = pParts[0] || '';
    periodEnd = pParts[1] || '';
  }

  // Attachments
  const attachments = [];
  $('a').each((_, a) => {
    const h = $(a).attr('href') || '';
    if (h.includes('download.php') || h.includes('file=')) {
      const name = $(a).text().trim();
      if (name) {
        const ext = name.split('.').pop().toLowerCase();
        attachments.push({
          name,
          size: '-',
          downloads: 0,
          date: dateFull ? dateFull.slice(0, 10) : '',
          type: ext
        });
      }
    }
  });

  // Comments
  const comments = [];
  $('div[id^=comment_], tr[id^=comment_]').each((cIdx, el) => {
    const cAuthor = $(el).find('b, .member').first().text().trim();
    const cDate = $(el).find('.datetime, font[color]').first().text().trim();
    const cText = $(el).text().replace(/\s+/g, ' ').trim();
    if (cAuthor) {
      comments.push({
        id: cIdx + 1,
        author: cAuthor,
        date: cDate,
        content: cText
      });
    }
  });

  const category = inferCategory(title, clientName);

  return {
    id: no,
    no,
    title: title || `프로젝트 #${no}`,
    projectId: projectId || `p_${wr_id}`,
    projectUrl: `http://sitegate.co.kr/html/board/bbs/tb.php/wc_project/${wr_id}`,
    clientName: clientName || siteName || '-',
    clientId: clientId || '-',
    siteName: siteName || title,
    siteId: siteId || '-',
    bidCount: 0,
    pm,
    planner,
    designer,
    publisher,
    developer,
    period,
    periodStart: periodStart || (dateFull ? dateFull.slice(0, 10) : '-'),
    periodEnd: periodEnd || '-',
    devLang: '-',
    author: author || '관리자',
    authorDept: '수행본부',
    authorRole: '담당',
    date: dateFull ? dateFull.slice(0, 10) : '-',
    dateFull: dateFull || '-',
    views: views || 0,
    status,
    statusText,
    category,
    clientContacts,
    attachments,
    content: '.',
    comments
  };
}

// 5. 메인 크롤링 실행
async function main() {
  console.log('🚀 [전사 370개 프로젝트 데이터 일괄 크롤링 시작]');

  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const mb_id = env.SITEGATE_ID || 'yellow';
  const mb_password = env.SITEGATE_PW || '';

  if (!mb_password) {
    console.error('❌ .env 파일에 SITEGATE_PW가 입력되지 않았습니다.');
    process.exit(1);
  }

  console.log(`🔑 [1/4] sitegate.co.kr 로그인 시도 중... (아이디: ${mb_id})`);
  const cookieHeader = await login(baseUrl, mb_id, mb_password);
  console.log('✅ [1/4] 로그인 성공!');

  // Step 1: 1~13 목록 페이지 수집
  console.log('📥 [2/4] 프로젝트 목록 1~13페이지 수집 중...');
  const listItems = [];
  const seenIds = new Set();

  for (let page = 1; page <= 13; page++) {
    const listUrl = `${baseUrl}/html/board/bbs/board.php?bo_table=wc_project&page=${page}`;
    const res = await fetch(listUrl, {
      headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const buf = await res.arrayBuffer();
    const html = new TextDecoder('euc-kr').decode(buf);
    const $ = cheerio.load(html);

    $('table').each((_, tbl) => {
      $(tbl).find('tr').each((__, tr) => {
        const link = $(tr).find('a[href*=wr_id]').first();
        if (link.length > 0) {
          const href = link.attr('href') || '';
          const match = href.match(/wr_id=(\d+)/);
          if (match) {
            const wr_id = match[1];
            if (!seenIds.has(wr_id)) {
              seenIds.add(wr_id);
              const cols = [];
              $(tr).find('td').each((___, td) => cols.push($(td).text().replace(/\s+/g, ' ').trim()));

              listItems.push({
                wr_id,
                no: cols[0] ? parseInt(cols[0], 10) || listItems.length + 1 : listItems.length + 1,
                title: link.text().trim(),
                siteName: cols[2] ? cols[2].split('(')[0].trim() : '',
                pm: cols[3] || '-',
                period: cols[4] || '-',
                author: cols[6] || '',
                date: cols[7] || '',
                views: cols[8] ? parseInt(cols[8], 10) || 0 : 0
              });
            }
          }
        }
      });
    });
  }

  console.log(`✅ [2/4] 전체 프로젝트 목록 ${listItems.length}건 수집 완료`);

  // Step 2: 370개 상세 페이지 병렬 배치 수집
  console.log('📥 [3/4] 370개 프로젝트 상세 정보 병렬 수집 중 (동시 6건씩 처리)...');
  const allProjects = [];
  const BATCH_SIZE = 6;
  const startTime = Date.now();

  for (let i = 0; i < listItems.length; i += BATCH_SIZE) {
    const batch = listItems.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async item => {
        const detailUrl = `${baseUrl}/html/board/bbs/board.php?bo_table=wc_project&wr_id=${item.wr_id}`;
        try {
          const res = await fetch(detailUrl, {
            headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
          });
          const buf = await res.arrayBuffer();
          const html = new TextDecoder('euc-kr').decode(buf);
          return parseProjectDetail(html, item.wr_id, item.no, item);
        } catch (err) {
          console.warn(`[경고] wr_id=${item.wr_id} 상세 수집 실패, 기본 목록 데이터 사용:`, err.message);
          return parseProjectDetail('<html><body></body></html>', item.wr_id, item.no, item);
        }
      })
    );

    allProjects.push(...batchResults);
    const percent = Math.round((allProjects.length / listItems.length) * 100);
    process.stdout.write(`\r  진행률: ${percent}% (${allProjects.length}/${listItems.length})`);

    // 서버 부하 완화를 위한 미세 딜레이 (40ms)
    await new Promise(r => setTimeout(r, 40));
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ [3/4] 370개 프로젝트 상세 정보 수집 완료 (소요 시간: ${durationSec}초)`);

  // 최신 등록 순으로 고유 ID 및 No 순차 부여 (370 ~ 1)
  allProjects.forEach((item, idx) => {
    item.id = allProjects.length - idx;
    item.no = allProjects.length - idx;
  });

  // Step 3: 파일 저장 및 mockData.js 동기화
  console.log('💾 [4/4] data/_legacy/projects.json 및 data/mockData.js 동기화 중...');

  // 3-1. projects.json 저장
  const legacyProjPath = path.join(ROOT, 'data', '_legacy', 'projects.json');
  fs.writeFileSync(legacyProjPath, JSON.stringify(allProjects, null, 2) + '\n', 'utf8');

  // 3-2. mockData.js 치환
  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let mockContent = fs.readFileSync(mockPath, 'utf8');

  const projectsJsonString = JSON.stringify(allProjects, null, 2)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : '  ' + line))
    .join('\n');

  mockContent = mockContent.replace(
    /(  \/\/ 7\. 전사 프로젝트 관리 데이터[\s\S]*?projects:\s*\[)[\s\S]*?(\n  \],)/,
    `$1\n${projectsJsonString.slice(2, -2)}\n  ],`
  );

  fs.writeFileSync(mockPath, mockContent, 'utf8');
  console.log('✅ [4/4] mockData.js 및 legacy projects.json 업데이트 완료');

  // Step 4: 시드 빌드 및 검증
  console.log('🔨 Firestore 시드 자동 빌드 및 무결성 검증 중...');
  execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('node data/verify-consistency.js', { cwd: ROOT, stdio: 'inherit' });

  console.log(`\n🎉 [성공] 전사 ${allProjects.length}개 프로젝트 전체가 성공적으로 크롤링 및 동기화되었습니다!`);
}

main().catch(err => {
  console.error('❌ 프로젝트 크롤링 중 오류 발생:', err);
  process.exit(1);
});
