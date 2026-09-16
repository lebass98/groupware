/**
 * sitegate.co.kr 출퇴근 등록 중계 모듈
 *
 * 왜 서버가 필요한가
 *   브라우저에서 sitegate를 직접 호출할 수 없다. 세 가지가 막는다.
 *     1. sitegate는 HTTP 전용인데 이 앱은 HTTPS(GitHub Pages)로 서비스된다.
 *        브라우저가 혼합 콘텐츠(HTTPS -> HTTP)를 원천 차단하므로 우회할 방법이 없다.
 *     2. sitegate가 CORS 헤더를 주지 않아 교차 출처 요청의 응답을 읽을 수 없다.
 *     3. 계정 정보를 클라이언트 JS에 두면 누구나 볼 수 있다.
 *   그래서 서버(Node)가 대신 로그인하고 요청을 보낸다. 자격 증명은 .env에만 둔다.
 *
 * 이 파일은 dev-server에 의존하지 않는 순수 모듈이다.
 * 나중에 클라우드 함수(Cloudflare Workers, Vercel 등)로 옮길 때 그대로 재사용한다.
 *
 * 주의: registerAttendance()는 실제 근태를 기록한다. 되돌리려면 sitegate에서 직접 수정해야 한다.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const AJAX_PATH = '/html/board/skin/board/attendance/attendanceAjax.php';

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const i = t.indexOf('=');
    if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  });
  return env;
}

function config() {
  const env = loadEnv();
  const baseUrl = (env.SITEGATE_URL || 'http://sitegate.co.kr').replace(/\/$/, '');
  const id = env.SITEGATE_ID;
  const pw = env.SITEGATE_PW;
  if (!id || !pw) {
    throw new Error('.env에 SITEGATE_ID / SITEGATE_PW가 없습니다.');
  }
  return { baseUrl, id, pw };
}

/** 세션 로그인. 실패 사유는 sitegate가 alert() 스크립트로 돌려주므로 그 문구를 꺼내 쓴다. */
async function login({ baseUrl, id, pw }) {
  const res = await fetch(`${baseUrl}/html/board/bbs/login_check.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0'
    },
    body: new URLSearchParams({ url: '/', mb_id: id, mb_password: pw }).toString(),
    redirect: 'manual'
  });

  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const cookies = raw.filter((c) => !c.includes('deleted')).map((c) => c.split(';')[0]);

  const html = new TextDecoder('euc-kr').decode(await res.arrayBuffer());
  if (html.includes('alert(')) {
    const m = html.match(/alert\(['"]([^'"]+)['"]\)/);
    throw new Error(m ? m[1] : 'sitegate 로그인에 실패했습니다.');
  }
  if (!cookies.length) throw new Error('세션 쿠키를 받지 못했습니다.');
  return cookies.join('; ');
}

/**
 * 이번 달 근태 달력을 읽어 오늘 상태를 판별한다.
 *
 * 퇴근 등록에는 그날 기록의 wr_id가 필요한데, 이 값은 달력 페이지의
 * 퇴근 버튼(data-wr_id)에만 들어 있다. 그래서 등록 전에 항상 먼저 조회한다.
 *
 * @returns {{checkedIn:boolean, checkedOut:boolean, inTime:string|null,
 *            outTime:string|null, wrId:string|null}}
 */
async function readToday(cfg, cookie, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const url = `${cfg.baseUrl}/html/board/bbs/board.php?bo_table=attendance&year=${year}&month=${month}&id=`;
  const res = await fetch(url, { headers: { Cookie: cookie, 'User-Agent': 'Mozilla/5.0' } });
  const html = new TextDecoder('euc-kr').decode(await res.arrayBuffer());

  const $ = cheerio.load(html);
  let found = null;

  // 달력 각 칸은 날짜 숫자(.b_day)와 그 아래 출퇴근 표시로 이루어진다.
  $('td').each((_, td) => {
    const $td = $(td);
    const dayText = $td.find('.b_day').first().text().replace(/\D/g, '');
    if (!dayText || parseInt(dayText, 10) !== day) return;

    const text = $td.text().replace(/\s+/g, ' ');
    const inM = text.match(/출근\s*:\s*(\d{1,2}:\d{2})/);
    const outM = text.match(/퇴근\s*:\s*(\d{1,2}:\d{2})/);
    const btn = $td.find('.registerBtn').first();

    found = {
      checkedIn: !!inM,
      checkedOut: !!outM,
      inTime: inM ? inM[1] : null,
      outTime: outM ? outM[1] : null,
      wrId: btn.length ? String(btn.attr('data-wr_id') || '') || null : null,
      buttonMode: btn.length ? String(btn.attr('data-mode') || '') : null
    };
  });

  if (!found) {
    return { checkedIn: false, checkedOut: false, inTime: null, outTime: null, wrId: null, buttonMode: null };
  }
  return found;
}

/** 로그인한 계정의 표시 이름. 등록 시 wr_name으로 함께 보낸다. */
async function readDisplayName(cfg, cookie) {
  const url = `${cfg.baseUrl}/html/board/bbs/board.php?bo_table=attendance&id=`;
  const res = await fetch(url, { headers: { Cookie: cookie, 'User-Agent': 'Mozilla/5.0' } });
  const html = new TextDecoder('euc-kr').decode(await res.arrayBuffer());
  // 페이지 스크립트에 var wr_name = "이재광"; 형태로 들어 있다.
  const m = html.match(/var\s+wr_name\s*=\s*"([^"]*)"/);
  return m ? m[1] : '';
}

/** 오늘 상태만 조회한다(등록하지 않음). */
async function getStatus() {
  const cfg = config();
  const cookie = await login(cfg);
  const today = await readToday(cfg, cookie);
  return { ok: true, account: cfg.id, ...today };
}

/**
 * 출근/퇴근을 실제로 등록한다.
 *
 * 안전장치: 이미 등록된 상태면 요청을 보내지 않고 거절한다.
 * sitegate는 중복 요청을 막아 주지 않아 기록이 덮어써질 수 있기 때문이다.
 *
 * @param {'in'|'out'} mode
 */
async function registerAttendance(mode) {
  if (mode !== 'in' && mode !== 'out') {
    throw new Error("mode는 'in' 또는 'out'이어야 합니다.");
  }

  const cfg = config();
  const cookie = await login(cfg);
  const before = await readToday(cfg, cookie);

  if (mode === 'in' && before.checkedIn) {
    return { ok: false, reason: 'already-checked-in',
      message: `이미 출근 등록되어 있습니다 (${before.inTime}).`, status: before };
  }
  if (mode === 'out') {
    if (!before.checkedIn) {
      return { ok: false, reason: 'not-checked-in',
        message: '출근 기록이 없어 퇴근할 수 없습니다.', status: before };
    }
    if (before.checkedOut) {
      return { ok: false, reason: 'already-checked-out',
        message: `이미 퇴근 등록되어 있습니다 (${before.outTime}).`, status: before };
    }
    if (!before.wrId) {
      return { ok: false, reason: 'no-wr-id',
        message: '퇴근에 필요한 기록 ID를 찾지 못했습니다.', status: before };
    }
  }

  const wrName = await readDisplayName(cfg, cookie);
  const body = new URLSearchParams({
    mb_id: cfg.id,
    wr_id: mode === 'out' ? before.wrId : '',
    wr_name: wrName,
    mode
  });

  const res = await fetch(`${cfg.baseUrl}${AJAX_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookie,
      'User-Agent': 'Mozilla/5.0',
      Referer: `${cfg.baseUrl}/html/board/bbs/board.php?bo_table=attendance&id=`
    },
    body: body.toString()
  });

  const reply = new TextDecoder('euc-kr').decode(await res.arrayBuffer()).trim();
  if (!res.ok) {
    throw new Error(`sitegate 응답 오류 (HTTP ${res.status})`);
  }

  // 등록 결과를 말로만 믿지 않고 달력을 다시 읽어 확인한다.
  const after = await readToday(cfg, cookie);
  const applied = mode === 'in' ? after.checkedIn : after.checkedOut;

  return {
    ok: applied,
    mode,
    reply,
    message: applied
      ? (mode === 'in' ? `출근 등록 완료 (${after.inTime})` : `퇴근 등록 완료 (${after.outTime})`)
      : '요청은 보냈으나 기록이 확인되지 않았습니다. sitegate에서 직접 확인하십시오.',
    status: after
  };
}

module.exports = { getStatus, registerAttendance, readToday, login, config };
