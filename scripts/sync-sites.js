#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate.co.kr) 전체 사이트(wc_site) 크롤러 & 동기화 스크립트
 *
 * 기능:
 *  1. 사이트 게시판(bo_table=wc_site) 1~28페이지 전체 목록 수집 (총 410건)
 *  2. 각 사이트별 상세 페이지 병렬 배치 수집 및 정밀 파싱:
 *     - 사이트명, 사이트코드, 고객사(발주처), 고객ID
 *     - 글쓴이, 등록일, 조회수
 *     - 담당자 목록(contacts: 성명, 직급, 전화번호, 팩스, 휴대폰, 이메일, 부서 등)
 *     - URL 목록(urls: 구분, 타이틀, 링크URL, 아이디, 비밀번호)
 *  3. data/_legacy/sites.json 및 data/mockData.js (MockData.sites) 반영
 *  4. data/build-seed.js 실행 -> data/firebase-seed.json 자동 갱신
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

  const rawCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const validCookies = rawCookies
    .filter(c => !c.includes('deleted'))
    .map(c => c.split(';')[0]);

  const buf = await res.arrayBuffer();
  const html = iconv.decode(Buffer.from(buf), 'euc-kr');
  if (html.includes('alert(')) {
    const m = html.match(/alert\(['"]([^'"]+)['"]\)/);
    throw new Error(m ? m[1] : '로그인에 실패했습니다.');
  }

  const cookieHeader = validCookies.join('; ');
  return cookieHeader;
}

// 3. 사이트 목록 페이지 수집
async function fetchSitesList(baseUrl, cookieHeader) {
  const items = [];
  const seenWrIds = new Set();
  let page = 1;

  while (true) {
    const pageUrl = `${baseUrl}/html/board/bbs/board.php?bo_table=wc_site&page=${page}`;
    const res = await fetch(pageUrl, {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    });

    const buf = await res.arrayBuffer();
    const html = iconv.decode(Buffer.from(buf), 'euc-kr');
    const $ = cheerio.load(html);

    let pageCount = 0;
    $('table tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length >= 7) {
        const link = $(tr).find('a[href*="wr_id"]').first();
        const href = link.attr('href') || '';
        const wrMatch = href.match(/wr_id=(\d+)/);
        if (!wrMatch) return;

        const wr_id = wrMatch[1];
        if (seenWrIds.has(wr_id)) return;
        seenWrIds.add(wr_id);

        const colNo = $(tds[0]).text().trim();
        const colCategory = $(tds[1]).text().trim();
        const rawSite = $(tds[2]).text().replace(/\s+/g, ' ').trim();
        const rawClient = $(tds[3]).text().replace(/\s+/g, ' ').trim();
        const colAuthor = $(tds[4]).text().trim();
        const colDate = $(tds[5]).text().trim();
        const colViews = $(tds[6]).text().trim();

        // 사이트명과 사이트코드 분리
        const siteTokens = rawSite.split(/\s+/);
        let siteCode = '';
        let siteTitle = rawSite;
        if (siteTokens.length > 1 && siteTokens[siteTokens.length - 1].startsWith('s_')) {
          siteCode = siteTokens.pop();
          siteTitle = siteTokens.join(' ');
        }

        // 고객사와 고객코드 분리
        const clientTokens = rawClient.split(/\s+/);
        let clientId = '';
        let clientName = rawClient;
        if (clientTokens.length > 1) {
          clientId = clientTokens.pop();
          clientName = clientTokens.join(' ');
        }

        items.push({
          wr_id,
          rawNo: colNo,
          category: colCategory || '일반',
          title: siteTitle,
          siteCode,
          client: clientName,
          clientId,
          author: colAuthor,
          date: colDate,
          views: parseInt(colViews, 10) || 0,
          href
        });
        pageCount++;
      }
    });

    if (pageCount === 0 || page > 30) {
      break;
    }

    process.stdout.write(`  - 페이지 ${page}: ${pageCount}건 수집 완료 (누적 ${items.length}건)\r`);
    page++;
  }

  console.log(`\n  총 ${items.length}건 사이트 목록 수집 완료`);
  return items;
}

// 4. 사이트 상세 페이지 파싱
async function fetchSiteDetail(baseUrl, cookieHeader, item, seqId) {
  const detailUrl = `${baseUrl}/html/board/bbs/board.php?bo_table=wc_site&wr_id=${item.wr_id}`;
  const res = await fetch(detailUrl, {
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
  });

  const buf = await res.arrayBuffer();
  const html = iconv.decode(Buffer.from(buf), 'euc-kr');
  const $ = cheerio.load(html);

  const bodyText = $('body').text();
  const bullets = bodyText.split('●').map(b => b.trim()).filter(Boolean);

  const contacts = [];
  const urls = [];

  bullets.forEach(b => {
    // 담당자 파싱
    if (b.startsWith('담당자') && b.includes(':')) {
      const dateMatch = b.match(/\[([\d-]+)\]/);
      const contactDate = dateMatch ? dateMatch[1] : '';
      const content = b.split(':')[1] || '';
      const tokens = content.split('|').map(t => t.trim());
      if (tokens.length >= 2 && tokens[0]) {
        contacts.push({
          name: tokens[0] || '',
          position: tokens[1] || '',
          tel: (tokens[2] || '').replace('전화', '').trim(),
          fax: (tokens[3] || '').replace('팩스', '').trim() || '-',
          mobile: tokens[4] || '-',
          email: tokens[5] || '',
          department: tokens[7] || tokens[6] || '',
          date: contactDate
        });
      }
    }
    // URL 파싱
    else if (b.startsWith('URL') && b.includes(':')) {
      const dateMatch = b.match(/\[([\d-]+)\]/);
      const urlDate = dateMatch ? dateMatch[1] : '';
      const content = b.split(':')[1] || '';
      const tokens = content.split('|').map(t => t.trim());
      if (tokens.length >= 3) {
        const rawUrl = tokens[2] || '';
        let cleanUrl = rawUrl;
        if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        urls.push({
          type: tokens[0] || '일반',
          title: tokens[1] || item.title,
          url: cleanUrl,
          username: tokens[3] || '',
          password: tokens[4] || '',
          date: urlDate
        });
      }
    }
  });

  // 첨부파일 파싱
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
          date: item.date || '',
          type: ext
        });
      }
    }
  });

  // 댓글 파싱
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

  return {
    id: seqId,
    wr_id: item.wr_id,
    title: item.title,
    siteCode: item.siteCode || '-',
    category: item.category || '기타',
    client: item.client || '-',
    clientId: item.clientId || '-',
    author: item.author || '-',
    date: item.date || '-',
    views: item.views || 0,
    contacts,
    urls,
    attachments,
    comments,
    primaryUrl: (urls.length > 0 && urls[0].url) ? urls[0].url : ''
  };
}

// 5. 배치 병렬 수집
async function fetchAllSitesInBatches(baseUrl, cookieHeader, listItems, concurrency = 8) {
  const results = [];
  const total = listItems.length;

  for (let i = 0; i < total; i += concurrency) {
    const chunk = listItems.slice(i, i + concurrency);
    const chunkPromises = chunk.map((item, idx) => {
      const seqId = total - (i + idx);
      return fetchSiteDetail(baseUrl, cookieHeader, item, seqId);
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    const progress = Math.min(i + concurrency, total);
    process.stdout.write(`  - 사이트 상세 정보 수집 진행 중: ${progress}/${total}건 (${Math.round((progress / total) * 100)}%)\r`);
  }
  console.log('');
  return results;
}

// 6. 메인 실행 함수
async function main() {
  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const siteId = env.SITEGATE_ID || 'yellow';
  const sitePw = env.SITEGATE_PW || '00000000';

  console.log('🚀 [전사 사이트(wc_site) 410건 전수 크롤링 및 동기화 시작]');
  console.log(`📡 대상 URL: ${baseUrl}, 계정: ${siteId}`);

  // 1. 로그인
  console.log('🔑 [1/4] Sitegate 로그인 중...');
  const cookieHeader = await login(baseUrl, siteId, sitePw);
  console.log('✅ [1/4] 로그인 성공');

  // 2. 목록 수집
  console.log('📥 [2/4] 사이트 목록 1~28페이지 수집 중...');
  const listItems = await fetchSitesList(baseUrl, cookieHeader);
  console.log(`✅ [2/4] 전체 사이트 목록 ${listItems.length}건 수집 완료`);

  // 3. 상세 수집
  console.log(`📥 [3/4] ${listItems.length}개 사이트 상세 정보 병렬 수집 중 (동시 8건씩 처리)...`);
  const startTime = Date.now();
  const allSites = await fetchAllSitesInBatches(baseUrl, cookieHeader, listItems, 8);
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ [3/4] ${allSites.length}개 사이트 상세 정보 수집 완료 (소요 시간: ${durationSec}초)`);

  // 4. 파일 저장
  console.log('💾 [4/4] 로컬 데이터 파일 및 MockData 반영 중...');

  // 4-1. data/_legacy/sites.json
  const legacyPath = path.join(ROOT, 'data', '_legacy', 'sites.json');
  fs.writeFileSync(legacyPath, JSON.stringify(allSites, null, 2), 'utf8');
  console.log(`  - ${legacyPath} (${allSites.length}건 저장 완료)`);

  // 4-2. data/mockData.js 내 MockData.sites 치환 또는 추가
  const mockDataPath = path.join(ROOT, 'data', 'mockData.js');
  let mockContent = fs.readFileSync(mockDataPath, 'utf8');

  const sitesJsonString = JSON.stringify(allSites, null, 4);

  if (mockContent.includes('sites: [')) {
    // 기존 sites 교체
    mockContent = mockContent.replace(
      /(  sites:\s*\[)[\s\S]*?(\n  \],)/,
      `$1\n${sitesJsonString.slice(1, -1)}\n  ],`
    );
  } else {
    // projects 뒤에 sites 추가
    mockContent = mockContent.replace(
      /(  \/\/ 7\. 전사 프로젝트 관리 데이터[\s\S]*?projects:\s*\[[\s\S]*?\n  \],)/,
      `$1\n\n  // 7-1. 전사 사이트 관리 데이터 (기존 sitegate wc_site 410건 전수 동기화)\n  sites: ${sitesJsonString},`
    );
  }

  fs.writeFileSync(mockDataPath, mockContent, 'utf8');
  console.log(`  - ${mockDataPath} (MockData.sites ${allSites.length}건 동기화 완료)`);

  // 4-3. Firestore 시드 빌드 실행
  try {
    console.log('🔄 Firestore 시드 데이터(data/firebase-seed.json) 재생성 중...');
    execSync('node data/build-seed.js', { cwd: ROOT, stdio: 'inherit' });
    console.log('✅ Firestore 시드 빌드 완료');
  } catch (err) {
    console.warn('⚠️ Firestore 시드 빌드 중 경고 발생:', err.message);
  }

  console.log(`\n🎉 [성공] 전사 ${allSites.length}개 사이트 전체가 성공적으로 크롤링 및 동기화되었습니다!`);
}

main().catch(err => {
  console.error('❌ 사이트 크롤링 중 오류 발생:', err);
  process.exit(1);
});
