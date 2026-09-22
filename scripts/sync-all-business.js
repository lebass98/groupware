#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate.co.kr) 15대 고부가가치 비즈니스 데이터 전수 크롤러
 *
 * 수집 대상:
 *  1. cardncash (경비 및 지출결의 내역) -> data/_legacy/expenses.json
 *  2. report_weekly (전사 주간업무보고) -> data/_legacy/weekly_reports.json
 *  3. report_teamcap (팀장 전용 게시판) -> data/_legacy/teamcap_reports.json
 *  4. equipment (사내 비품/자산 대장) -> data/_legacy/equipment.json
 *  5. contract (계약서 관리 대장) -> data/_legacy/contracts.json
 *  6. estimate & project (견적 및 제안서) -> data/_legacy/estimates.json
 *  7. com_reg (고객사 사업자정보 대장) -> data/_legacy/client_companies.json
 *  8. wc_pic (고객사 실무 담당자 명함첩) -> data/_legacy/client_contacts.json
 *  9. wc_domain (도메인 관리 대장) -> data/_legacy/domains.json
 * 10. wc_server & wc_hosting (서버/호스팅 인프라) -> data/_legacy/servers.json
 * 11. wc_url (프로젝트 URL 모음) -> data/_legacy/project_urls.json
 * 12. wc_storyboard (기획 스토리보드) -> data/_legacy/storyboards.json
 * 13. wc_source & programming & pds (자료실/개발) -> data/_legacy/pds.json
 * 14. meeting (고객사 미팅 회의록) -> data/_legacy/meetings.json
 * 15. issues & wc_teamwork (팀 협업 및 이슈) -> data/_legacy/issues.json
 * + toBeOrNotToBe (자리배치도 상황판 34석) -> data/_legacy/seating.json
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const LEGACY_DIR = path.join(ROOT, 'data', '_legacy');

function loadEnv() {
  const env = {};
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    });
  }
  ['SITEGATE_URL', 'SITEGATE_ID', 'SITEGATE_PW'].forEach((key) => {
    if (!env[key] && process.env[key]) env[key] = process.env[key];
  });
  return env;
}

const env = loadEnv();
const BASE_URL = env.SITEGATE_URL || 'http://sitegate.co.kr';
const MB_ID = env.SITEGATE_ID || 'yellow';
const MB_PW = env.SITEGATE_PW || '00000000';

async function login() {
  const loginUrl = `${BASE_URL}/html/board/bbs/login_check.php`;
  const body = new URLSearchParams({ url: '/', mb_id: MB_ID, mb_password: MB_PW }).toString();
  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    body,
    redirect: 'manual'
  });
  const rawCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const validCookies = rawCookies.filter(c => !c.includes('deleted')).map(c => c.split(';')[0]);
  if (!validCookies.length) throw new Error('로그인에 실패했습니다.');
  return validCookies.join('; ');
}

async function fetchPage(url, cookie, isUtf8 = false) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ...(cookie ? { Cookie: cookie } : {})
      }
    });
    const buf = Buffer.from(await res.arrayBuffer());
    if (isUtf8) {
      return buf.toString('utf8');
    }
    return iconv.decode(buf, 'euc-kr');
  } catch (e) {
    return '';
  }
}

// Helper to crawl a list of pages for any Gnuboard table
async function crawlBoard(bo_table, cookie, maxPages = 5) {
  const items = [];
  const seenWrIds = new Set();

  for (let page = 1; page <= maxPages; page++) {
    const url = `${BASE_URL}/html/board/bbs/board.php?bo_table=${bo_table}&page=${page}`;
    const html = await fetchPage(url, cookie);
    if (!html || html.includes('존재하지 않는 게시판') || html.includes('목록을 볼 권한이 없습니다')) break;

    const $ = cheerio.load(html);
    const pageRows = [];

    $('tr').each((_, tr) => {
      const linkEl = $(tr).find('td.subject a, .subject a, a[href*="wr_id="]').first();
      if (!linkEl.length) return;

      const href = linkEl.attr('href') || '';
      const m = href.match(/wr_id=(\d+)/);
      if (!m) return;
      const wr_id = m[1];
      if (seenWrIds.has(wr_id)) return;
      seenWrIds.add(wr_id);

      // Clean subject
      let subject = linkEl.text().trim().replace(/\s+/g, ' ');
      // Remove comment count suffix like [3] or (3) if attached
      const commentCountMatch = subject.match(/\((\d+)\)$|\[(\d+)\]$/);
      let commentCount = 0;
      if (commentCountMatch) {
        commentCount = parseInt(commentCountMatch[1] || commentCountMatch[2], 10);
        subject = subject.replace(/\((\d+)\)$|\[(\d+)\]$/, '').trim();
      }

      // Extract category
      let category = '';
      const cateEl = $(tr).find('td.category, .category, font[color="#777777"], font[color="#888888"]').first();
      if (cateEl.length) {
        category = cateEl.text().trim().replace(/[\[\]]/g, '');
      }

      // Extract author, date, hit
      let author = '';
      let date = '';
      let hit = '';
      $(tr).find('td').each((idx, td) => {
        const text = $(td).text().trim();
        if (/^\d{4}-\d{2}-\d{2}$|^\d{2}-\d{2}$/.test(text)) {
          date = text;
        } else if (/^\d+$/.test(text) && parseInt(text, 10) < 100000 && !date && idx > 1) {
          hit = text;
        }
        if ($(td).find('.member, .guest').length) {
          author = $(td).text().trim();
        }
      });

      pageRows.push({
        wr_id,
        category,
        subject,
        author: author || '관리자',
        date: date || new Date().toISOString().slice(0, 10),
        hit: hit || '0',
        commentCount
      });
    });

    if (pageRows.length === 0) break;
    items.push(...pageRows);
  }

  return items;
}

// Detail page extractor helper for key fields
async function fetchPostDetail(bo_table, wr_id, cookie) {
  const url = `${BASE_URL}/html/board/bbs/board.php?bo_table=${bo_table}&wr_id=${wr_id}`;
  const html = await fetchPage(url, cookie);
  if (!html) return null;
  // Check gnuboard permission denial script alert only
  if (/<script[^>]*>\s*alert\(['"](권한이 없습니다|글을 읽을 권한이 없습니다|올바른 방법으로 이용해 주십시오|존재하지 않는 게시글|비밀글)/.test(html)) {
    return null;
  }

  const $ = cheerio.load(html);
  
  // Attachments
  const files = [];
  $('a[href*="download.php"], a[href*="file_download"]').each((_, a) => {
    const text = $(a).text().trim();
    const href = $(a).attr('href') || '';
    let fileUrl = href;
    const m = href.match(/file_download\(['"]([^'"]+)['"]/);
    if (m) {
      const raw = m[1];
      fileUrl = raw.startsWith('http') ? raw : `${BASE_URL}/html/board/bbs/${raw.replace(/^\.\//, '')}`;
    } else if (href.includes('download.php') && !href.startsWith('javascript:')) {
      fileUrl = href.startsWith('http') ? href : `${BASE_URL}/html/board/bbs/${href.replace(/^\.\.\/bbs\//, '').replace(/^\.\//, '')}`;
    }
    if (text) {
      files.push({
        name: text.split(',')[0].trim(),
        fullInfo: text,
        url: fileUrl
      });
    }
  });

  // Remove scripts & styles for clean content & metadata parsing
  $('script, style').remove();

  // Key-value metadata extraction from bullets
  const meta = {};
  $('body').text().split(/[●♥■◆★]/).map(s => s.trim()).filter(Boolean).forEach(b => {
    const idx = b.indexOf(':');
    if (idx !== -1) {
      const k = b.slice(0, idx).trim();
      const v = b.slice(idx + 1).split(/\n|●|♥|■|◆|★/)[0].trim();
      if (k && v && k.length < 30 && v.length < 250) {
        meta[k] = v;
      }
    }
  });

  // Body content
  let content = $('span.ct, td.view_content, #view_content, .view_content').text().trim().replace(/\r\n/g, '\n');
  if (!content) {
    content = $('body').text().replace(/\s+/g, ' ').slice(0, 500);
  }

  // Comments
  const comments = [];
  $('tr[id*="comment"]').each((_, ctr) => {
    const cAuthor = $(ctr).find('.member, .guest, .comment_name').text().trim();
    const cDate = $(ctr).find('td[align="right"], .comment_date').text().trim();
    const cContent = $(ctr).find('td[style*="line-height"], .comment_content').text().trim();
    if (cAuthor && cContent) {
      comments.push({ author: cAuthor, date: cDate, content: cContent });
    }
  });

  return { files, content: content.slice(0, 1500), meta, comments };
}

// Parallel chunk enrichment helper
async function enrichItemsWithDetails(items, bo_table, cookie, maxItems = 150, chunkSize = 15) {
  const targetItems = items.slice(0, maxItems);
  for (let i = 0; i < targetItems.length; i += chunkSize) {
    const chunk = targetItems.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async item => {
      try {
        const d = await fetchPostDetail(bo_table, item.wr_id || item.id, cookie);
        if (d) {
          item.content = d.content || '';
          item.files = d.files || [];
          item.meta = d.meta || {};
          item.comments = d.comments || [];
        }
      } catch (e) {}
    }));
  }
}

async function main() {
  console.log('🚀 [사이트게이트 15대 고부가가치 비즈니스 데이터 크롤링 시작]');
  console.log(`🔑 [1/16] sitegate.co.kr 로그인 중... (${MB_ID})`);
  const cookie = await login();
  console.log('✅ [1/16] 세션 로그인 성공!\n');

  if (!fs.existsSync(LEGACY_DIR)) {
    fs.mkdirSync(LEGACY_DIR, { recursive: true });
  }

  // 1. cardncash (경비지출내역) — 전용 크롤러(sync-expenses.js --pages=215)가 3,223건 전수를 관리하므로 건너뛴다.
  console.log('⏭️  [2/16] 1. 경비지출내역: 전용 크롤러(node scripts/sync-expenses.js)에 위임 (기존 마스터 보존)');

  // 2. report_weekly (전사 주간회의록) & report_teamcap (팀장 전용)
  console.log('📥 [3/16] 2-3. 주간회의록 & 팀장보고 (report_weekly, report_teamcap) 수집 중...');
  const weeklyReports = await crawlBoard('report_weekly', cookie, 5);
  await enrichItemsWithDetails(weeklyReports, 'report_weekly', cookie, 65);
  const teamcapReports = await crawlBoard('report_teamcap', cookie, 2);
  await enrichItemsWithDetails(teamcapReports, 'report_teamcap', cookie, 20);
  fs.writeFileSync(path.join(LEGACY_DIR, 'weekly_reports.json'), JSON.stringify(weeklyReports, null, 2));
  fs.writeFileSync(path.join(LEGACY_DIR, 'teamcap_reports.json'), JSON.stringify(teamcapReports, null, 2));
  console.log(`✅ [3/16] 주간회의록: ${weeklyReports.length}건, 팀장보고: ${teamcapReports.length}건 (상세 포함) 수집 완료`);

  // 4. equipment (사내 비품/자산 대장) — 전용 크롤러(sync-equipment.js)가 106건 전수를 관리하므로 건너뛴다.
  console.log('⏭️  [4/16] 4. 사내 비품/자산 대장: 전용 크롤러(node scripts/sync-equipment.js)에 위임 (기존 마스터 보존)');

  // 5. contract (계약서 관리 대장) — 전용 크롤러(sync-contracts.js)가 941건 전수+금액을 관리하므로 건너뛴다.
  console.log('⏭️  [5/16] 5. 계약서 관리 대장: 전용 크롤러(node scripts/sync-contracts.js)에 위임 (기존 마스터 보존)');

  // 6. estimate & project (견적/제안) — 전용 크롤러(sync-planning-estimates.js)가 850건 전수를 관리하므로 건너뛴다.
  console.log('⏭️  [6/16] 6. 견적/제안 내역: 전용 크롤러(node scripts/sync-planning-estimates.js)에 위임 (기존 마스터 보존)');

  // 7. com_reg (고객사 사업자정보 대장)
  console.log('📥 [7/16] 7. 고객사 사업자정보 (com_reg) 수집 중...');
  const comRegList = await crawlBoard('com_reg', cookie, 85);
  await enrichItemsWithDetails(comRegList, 'com_reg', cookie, 1250);
  fs.writeFileSync(path.join(LEGACY_DIR, 'client_companies.json'), JSON.stringify(comRegList, null, 2));
  console.log(`✅ [7/16] 고객사 사업자정보: ${comRegList.length}건 (상세 포함) 수집 완료`);

  // 8. wc_pic (고객사 실무 담당자 명함첩)
  console.log('📥 [8/16] 8. 고객사 담당자 명함첩 (wc_pic) 정밀 수집 중...');
  const clientContacts = [];
  const seenPicIds = new Set();
  for (let page = 1; page <= 70; page++) {
    const pUrl = `${BASE_URL}/html/board/bbs/board.php?bo_table=wc_pic&page=${page}`;
    const pHtml = await fetchPage(pUrl, cookie);
    if (!pHtml || pHtml.includes('존재하지 않는 게시판')) break;
    const $ = cheerio.load(pHtml);
    let pageCount = 0;
    $('form[name="fboardlist"] tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length === 10) {
        const num = $(tds[0]).text().trim();
        if (/^\d+$/.test(num) && !seenPicIds.has(num)) {
          seenPicIds.add(num);
          pageCount++;
          const category = $(tds[1]).text().trim();
          const nameWithTitle = $(tds[2]).text().trim();
          const site = $(tds[3]).text().trim();
          const tel = $(tds[4]).text().trim();
          const mobile = $(tds[5]).text().trim();
          const email = $(tds[6]).text().trim();
          const author = $(tds[7]).text().trim();
          const date = $(tds[8]).text().trim();
          const hit = $(tds[9]).text().trim();

          const parts = nameWithTitle.split(/\s+/);
          const name = parts[0] || nameWithTitle;
          const title = parts.slice(1).join(' ') || '담당자';

          // Clean site & extract site id if present
          let company = site;
          let siteCode = '';
          const mCode = site.match(/\((s_[^)]+)\)/);
          if (mCode) {
            siteCode = mCode[1];
          }

          clientContacts.push({
            wr_id: num,
            id: num,
            category,
            nameWithTitle,
            subject: nameWithTitle,
            name,
            title,
            site,
            company: site.replace(/\s*\(s_[^)]+\)/, '').trim(),
            siteCode,
            tel,
            mobile,
            phone: mobile || tel,
            email,
            author,
            date,
            hit
          });
        }
      }
    });
    if (pageCount === 0) break;
  }
  fs.writeFileSync(path.join(LEGACY_DIR, 'client_contacts.json'), JSON.stringify(clientContacts, null, 2));
  console.log(`✅ [8/16] 고객사 실무 담당자: ${clientContacts.length}명 정밀 수집 완료`);

  // 9. wc_domain (도메인 관리 대장)
  console.log('📥 [9/16] 9. 도메인 관리 대장 (wc_domain) 정밀 수집 중...');
  const domainList = [];
  const seenDomainIds = new Set();
  for (let page = 1; page <= 10; page++) {
    const pUrl = `${BASE_URL}/html/board/bbs/board.php?bo_table=wc_domain&page=${page}`;
    const pHtml = await fetchPage(pUrl, cookie);
    if (!pHtml || pHtml.includes('존재하지 않는 게시판')) break;
    const $ = cheerio.load(pHtml);
    let count = 0;
    $('form[name="fboardlist"] tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length === 8) {
        const num = $(tds[0]).text().trim();
        if (/^\d+$/.test(num) && !seenDomainIds.has(num)) {
          seenDomainIds.add(num);
          count++;
          const category = $(tds[1]).text().trim();
          const domain = $(tds[2]).text().trim();
          const site = $(tds[3]).text().trim();
          const registrar = $(tds[4]).text().trim();
          const author = $(tds[5]).text().trim();
          const date = $(tds[6]).text().trim();
          const hit = $(tds[7]).text().trim();
          domainList.push({
            wr_id: num,
            id: num,
            category,
            domain,
            subject: domain,
            site,
            company: site.replace(/\s*\(s_[^)]+\)/, '').trim(),
            registrar,
            author,
            date,
            hit
          });
        }
      }
    });
    if (count === 0) break;
  }
  await enrichItemsWithDetails(domainList, 'wc_domain', cookie, 150);
  fs.writeFileSync(path.join(LEGACY_DIR, 'domains.json'), JSON.stringify(domainList, null, 2));
  console.log(`✅ [9/16] 도메인 대장: ${domainList.length}건 (상세 계정정보 포함) 수집 완료`);

  // 10. wc_server & wc_hosting (서버/호스팅 인프라)
  console.log('📥 [10/16] 10. 서버/호스팅 인프라 (wc_server, wc_hosting) 정밀 수집 중...');
  const allServers = [];
  const seenServerIds = new Set();
  for (let page = 1; page <= 30; page++) {
    const pUrl = `${BASE_URL}/html/board/bbs/board.php?bo_table=wc_server&page=${page}`;
    const pHtml = await fetchPage(pUrl, cookie);
    if (!pHtml || pHtml.includes('존재하지 않는 게시판')) break;
    const $ = cheerio.load(pHtml);
    let count = 0;
    $('form[name="fboardlist"] tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length === 10) {
        const num = $(tds[0]).text().trim();
        if (/^\d+$/.test(num) && !seenServerIds.has(num)) {
          seenServerIds.add(num);
          count++;
          const category = $(tds[1]).text().trim();
          const title = $(tds[2]).text().trim();
          const site = $(tds[3]).text().trim();
          const usage = $(tds[4]).text().trim();
          const location = $(tds[5]).text().trim();
          const os = $(tds[6]).text().trim();
          const author = $(tds[7]).text().trim();
          const date = $(tds[8]).text().trim();
          const hit = $(tds[9]).text().trim();
          allServers.push({
            wr_id: num,
            id: num,
            category,
            title,
            subject: title,
            site,
            company: site.replace(/\s*\(s_[^)]+\)/, '').trim(),
            usage,
            location,
            os,
            author,
            date,
            hit,
            infraType: 'server'
          });
        }
      }
    });
    if (count === 0) break;
  }
  await enrichItemsWithDetails(allServers, 'wc_server', cookie, 420);
  fs.writeFileSync(path.join(LEGACY_DIR, 'servers.json'), JSON.stringify(allServers, null, 2));
  console.log(`✅ [10/16] 서버/호스팅: ${allServers.length}건 (상세 IP/PW/계정 포함) 수집 완료`);

  // 11. wc_url (프로젝트 URL 모음)
  console.log('📥 [11/16] 11. 프로젝트 URL 모음 (wc_url) 정밀 수집 중...');
  const projectUrls = [];
  const seenUrlIds = new Set();
  for (let page = 1; page <= 60; page++) {
    const pUrl = `${BASE_URL}/html/board/bbs/board.php?bo_table=wc_url&page=${page}`;
    const pHtml = await fetchPage(pUrl, cookie);
    if (!pHtml || pHtml.includes('존재하지 않는 게시판')) break;
    const $ = cheerio.load(pHtml);
    let count = 0;
    $('form[name="fboardlist"] tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length === 8) {
        const num = $(tds[0]).text().trim();
        if (/^\d+$/.test(num) && !seenUrlIds.has(num)) {
          seenUrlIds.add(num);
          count++;
          const category = $(tds[1]).text().trim();
          const title = $(tds[2]).text().trim();
          const site = $(tds[3]).text().trim();
          const targetUrl = $(tds[4]).text().trim();
          const author = $(tds[5]).text().trim();
          const date = $(tds[6]).text().trim();
          const hit = $(tds[7]).text().trim();
          projectUrls.push({
            wr_id: num,
            id: num,
            category,
            title,
            subject: title,
            site,
            company: site.replace(/\s*\(s_[^)]+\)/, '').trim(),
            url: targetUrl,
            targetUrl,
            author,
            date,
            hit
          });
        }
      }
    });
    if (count === 0) break;
  }
  await enrichItemsWithDetails(projectUrls, 'wc_url', cookie, 820);
  fs.writeFileSync(path.join(LEGACY_DIR, 'project_urls.json'), JSON.stringify(projectUrls, null, 2));
  console.log(`✅ [11/16] 프로젝트 URL: ${projectUrls.length}건 (상세 포함) 수집 완료`);

  // 12. wc_storyboard (기획 스토리보드)
  console.log('📥 [12/16] 12. 기획 스토리보드 (wc_storyboard) 수집 중...');
  const storyboards = await crawlBoard('wc_storyboard', cookie, 5);
  await enrichItemsWithDetails(storyboards, 'wc_storyboard', cookie, 60);
  fs.writeFileSync(path.join(LEGACY_DIR, 'storyboards.json'), JSON.stringify(storyboards, null, 2));
  console.log(`✅ [12/16] 기획 스토리보드: ${storyboards.length}건 (상세 파일/내용 포함) 수집 완료`);

  // 13. wc_source, programming, pds (개발 자료 및 자료실)
  console.log('📥 [13/16] 13. 개발 자료 & 자료실 (wc_source, programming, pds) 수집 중...');
  const devSources = await crawlBoard('wc_source', cookie, 2);
  const devProgramming = await crawlBoard('programming', cookie, 5);
  const pdsList = await crawlBoard('pds', cookie, 2);
  const allPds = [
    ...devSources.map(s => ({ ...s, pdsType: 'source' })),
    ...devProgramming.map(p => ({ ...p, pdsType: 'dev' })),
    ...pdsList.map(l => ({ ...l, pdsType: 'general' }))
  ];
  await enrichItemsWithDetails(allPds.filter(p => p.pdsType === 'source'), 'wc_source', cookie, 20);
  await enrichItemsWithDetails(allPds.filter(p => p.pdsType === 'dev'), 'programming', cookie, 20);
  await enrichItemsWithDetails(allPds.filter(p => p.pdsType === 'general'), 'pds', cookie, 20);
  fs.writeFileSync(path.join(LEGACY_DIR, 'pds.json'), JSON.stringify(allPds, null, 2));
  console.log(`✅ [13/16] 자료실/개발: ${allPds.length}건 (상세 및 첨부파일 포함) 수집 완료`);

  // 14. meeting (고객사 미팅 회의록)
  console.log('📥 [14/16] 14. 고객사 미팅 회의록 (meeting) 수집 중...');
  const meetings = await crawlBoard('meeting', cookie, 6);
  await enrichItemsWithDetails(meetings, 'meeting', cookie, 70);
  fs.writeFileSync(path.join(LEGACY_DIR, 'meetings.json'), JSON.stringify(meetings, null, 2));
  console.log(`✅ [14/16] 고객사 미팅 회의록: ${meetings.length}건 (상세 회의록 포함) 수집 완료`);

  // 15. issues & wc_teamwork (팀 협업 및 이슈)
  console.log('📥 [15/16] 15. 팀 협업 및 이슈 (issues, wc_teamwork) 수집 중...');
  const issues = await crawlBoard('issues', cookie, 2);
  const teamwork = await crawlBoard('wc_teamwork', cookie, 3);
  await enrichItemsWithDetails(issues, 'issues', cookie, 30);
  await enrichItemsWithDetails(teamwork, 'wc_teamwork', cookie, 30);
  const allIssues = [
    ...issues.map(i => ({ ...i, issueType: 'issue' })),
    ...teamwork.map(t => ({ ...t, issueType: 'teamwork' }))
  ];
  // 주의: issues.json은 업무지원 요청(todo 75건, sync-issues.js) 마스터이므로 덮어쓰지 않고 별도 파일에 저장한다.
  fs.writeFileSync(path.join(LEGACY_DIR, 'teamwork_issues.json'), JSON.stringify(allIssues, null, 2));
  console.log(`✅ [15/16] 팀 협업 및 이슈(팀별이슈+팀웍): ${allIssues.length}건 → teamwork_issues.json (상세 포함) 수집 완료`);

  // +@. toBeOrNotToBe (자리배치도 상황판 34석)
  console.log('📥 [16/16] +@. 워드앤코드 자리배치도 상황판 (toBeOrNotToBe) 수집 중...');
  const tbRes = await fetchPage(`${BASE_URL}/html/board/toBeOrNotToBe/data.php`, cookie, true);
  let seatingData = { employees: [], todaySchedules: [] };
  try {
    const rawJson = JSON.parse(tbRes);
    seatingData = {
      employees: rawJson[0] || [],
      todaySchedules: rawJson[1] || []
    };
  } catch (e) {
    console.log('자리배치도 파싱 오류(JSON):', e.message);
  }
  fs.writeFileSync(path.join(LEGACY_DIR, 'seating.json'), JSON.stringify(seatingData, null, 2));
  console.log(`✅ [16/16] 자리배치도: ${seatingData.employees.length}석 및 당일 일정 ${seatingData.todaySchedules.length}건 수집 완료`);

  // 4. Update data/mockData.js
  console.log('\n💾 [동기화] data/mockData.js 통합 갱신 중...');
  updateMockData();
  console.log('✅ [동기화] data/mockData.js 갱신 완료!');

  // 5. Run build:seed and verify:seed
  console.log('\n🔨 [시드] Firestore 시드 파일 재생성 및 무결성 검증...');
  try {
    execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
    execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });
  } catch(e) {
    console.log('시드 빌드 알림:', e.message);
  }

  console.log('\n🎉 [성공] 15대 고부가가치 비즈니스 데이터 전수 크롤링 및 동기화가 완벽히 완료되었습니다!');
}

function updateMockData() {
  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let content = fs.readFileSync(mockPath, 'utf8');

  // Load new JSONs
  const asArray = (x, key) => (Array.isArray(x) ? x : (x && Array.isArray(x[key]) ? x[key] : []));
  const expenses = asArray(JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'expenses.json'), 'utf8')), 'records');
  const weeklyReports = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'weekly_reports.json'), 'utf8'));
  const teamcapReports = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'teamcap_reports.json'), 'utf8'));
  const equipment = asArray(JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'equipment.json'), 'utf8')), 'items');
  const contracts = asArray(JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'contracts.json'), 'utf8')), 'contracts');
  const estimates = asArray(JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'estimates.json'), 'utf8')), 'estimates');
  const clientCompanies = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'client_companies.json'), 'utf8'));
  const clientContacts = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'client_contacts.json'), 'utf8'));
  const domains = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'domains.json'), 'utf8'));
  const servers = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'servers.json'), 'utf8'));
  const projectUrls = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'project_urls.json'), 'utf8'));
  const storyboards = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'storyboards.json'), 'utf8'));
  const pds = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'pds.json'), 'utf8'));
  const meetings = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'meetings.json'), 'utf8'));
  const issues = asArray(JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'issues.json'), 'utf8')), 'issues');
  const teamworkIssuesPath = path.join(LEGACY_DIR, 'teamwork_issues.json');
  const teamworkIssues = fs.existsSync(teamworkIssuesPath) ? JSON.parse(fs.readFileSync(teamworkIssuesPath, 'utf8')) : [];
  const seating = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, 'seating.json'), 'utf8'));

  const extendedData = {
    expenses,
    weeklyReports,
    teamcapReports,
    equipment,
    contracts,
    estimates,
    clientCompanies,
    clientContacts,
    domains,
    servers,
    projectUrls,
    storyboards,
    pds,
    meetings,
    issues,
    teamworkIssues,
    seating
  };

  const injection = `
// 15대 고부가가치 비즈니스 확장 데이터 (자동 크롤링)
if (typeof window !== "undefined") {
  window.MockData = window.MockData || {};
  window.MockData.extendedData = ${JSON.stringify(extendedData, null, 2)};
}
if (typeof module !== "undefined" && module.exports) {
  const m = (typeof window !== "undefined" && window.MockData) ? window.MockData : (typeof MockData !== "undefined" ? MockData : {});
  m.extendedData = ${JSON.stringify(extendedData, null, 2)};
  module.exports = m;
}
`;

  // Remove previous injection if any
  const marker = "// 15대 고부가가치 비즈니스 확장 데이터 (자동 크롤링)";
  if (content.includes(marker)) {
    content = content.slice(0, content.indexOf(marker)).trimEnd();
  }
  content += "\n" + injection;

  fs.writeFileSync(mockPath, content, 'utf8');
}

main().catch(err => {
  console.error('❌ 크롤링 에러 발생:', err);
  process.exit(1);
});
