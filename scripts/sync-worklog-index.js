#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate) 업무일지 아카이브 인덱스 크롤러
 *
 * 원본 게시판: bo_table=daily_report (업무일지_신규, 약 46,700건 · 2013~)
 * 전 건 상세 수집은 비현실적이므로 목록 인덱스(번호·제목·작성자·일자)만 전수 수집한다.
 * 상세 본문이 필요하면 후속 스크립트에서 연도 단위로 나눠 수집한다.
 *
 * 산출물
 *   data/_legacy/worklog_index.json  (전수 인덱스 + 연도별/작성자별 통계)
 *   ※ 용량 보호를 위해 mockData에는 주입하지 않는다(마스터 전용).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

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
  console.log('🚀 [그룹웨어 업무일지 인덱스 전수 크롤링 시작]');
  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const pw = env.SITEGATE_PW || '';
  if (!pw) { console.error('❌ SITEGATE_PW(비밀번호)가 없습니다.'); process.exit(1); }

  const cookie = await login(baseUrl, env.SITEGATE_ID || 'yellow', pw);
  const get = async (p) => {
    for (let a = 0; a < 3; a++) {
      try {
        const r = await fetch(baseUrl + p, { headers: { Cookie: cookie, 'User-Agent': 'Mozilla/5.0' } });
        return dec(await r.arrayBuffer());
      } catch (e) { if (a === 2) throw e; await new Promise((s) => setTimeout(s, 1000)); }
    }
  };
  console.log('✅ 로그인 성공 — 목록 인덱스 수집 중 (16페이지 배치)...');

  function parsePage(h) {
    const $ = cheerio.load(h);
    const rows = [];
    $('tr').each((_, tr) => {
      const a = $(tr).find('a[href*="wr_id="]').first();
      const wr = ((a.attr('href') || '').match(/wr_id=(\d+)/) || [])[1] || '';
      const tds = $(tr).find('td').map((j, td) => $(td).text().replace(/\s+/g, ' ').trim()).get().filter((x) => x);
      if (!wr || tds.length < 4 || !/^\d+$/.test(tds[0])) return;
      const dateCell = tds.find((c) => /^\d{4}-\d{2}-\d{2}$/.test(c)) || '';
      rows.push({
        wr_id: wr,
        subject: tds[1] || '',
        author: (tds[1].match(/^\(([^)]+)\)/) || [])[1] || tds[2] || '',
        date: dateCell
      });
    });
    return rows;
  }

  const items = [];
  const seen = new Set();
  let page = 1;
  let stop = false;
  while (!stop && page <= 4000) {
    const batch = Array.from({ length: 16 }, (_, i) => page + i);
    const htmls = await Promise.all(batch.map((p) => get(`/html/board/bbs/board.php?bo_table=daily_report&page=${p}`)));
    let any = false;
    for (const h of htmls) {
      const rows = parsePage(h).filter((r) => !seen.has(r.wr_id));
      rows.forEach((r) => seen.add(r.wr_id));
      if (rows.length) { items.push(...rows); any = true; }
    }
    if (!any) stop = true;
    page += 16;
    if ((page - 1) % 320 < 16) console.log(`   ${page - 1}페이지 부근, 누적 ${items.length}건...`);
  }
  items.sort((a, b) => Number(b.wr_id) - Number(a.wr_id));
  console.log(`✅ 인덱스 ${items.length}건 수집 완료`);

  // 통계
  const byYear = {};
  const byAuthor = {};
  items.forEach((r) => {
    const y = (r.date || '').slice(0, 4);
    if (y) byYear[y] = (byYear[y] || 0) + 1;
    if (r.author) byAuthor[r.author] = (byAuthor[r.author] || 0) + 1;
  });

  const out = {
    updatedAt: new Date().toISOString().slice(0, 10),
    source: 'bo_table=daily_report (업무일지_신규) 목록 인덱스',
    total: items.length,
    byYear,
    byAuthor,
    items
  };
  fs.writeFileSync(path.join(ROOT, 'data', '_legacy', 'worklog_index.json'), JSON.stringify(out, null, 1) + '\n', 'utf8');
  console.log('📊 연도별:', Object.keys(byYear).sort().map((y) => `${y}:${byYear[y]}`).join(' '));
  console.log('🎉 [성공] 업무일지 인덱스 저장 완료 → data/_legacy/worklog_index.json');
}

main().catch((err) => { console.error('\n❌ 업무일지 인덱스 오류:', err); process.exit(1); });
