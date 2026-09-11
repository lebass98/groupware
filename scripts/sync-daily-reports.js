#!/usr/bin/env node
/**
 * 기존 그룹웨어(sitegate.co.kr) 근태 및 출퇴근 데이터 크롤러 & 전 디바이스 동기화 스크립트
 *
 * 지원 기능:
 *  1. 전사 근태일지 크롤링 (bo_table=daily_report&skin=diary):
 *     - 8월, 9월, 10월 등 전사 외근, 연차, 반차, 반반차, 생일휴가, 공가 일정 파싱
 *     - '윤성호' 자동 제외 필터링 (사용자 명시적 요청 반영)
 *     - MockData.employees 21명 마스터와 매핑하여 author, avatar, badge, type 자동 설정
 *  2. 개인 출퇴근 기록 크롤링 (bo_table=attendance):
 *     - 이재광 팀장의 일자별 출근, 퇴근, 지각, 근무시간 파싱
 *     - 오늘(9월 11일) 실시간 출근 상태(10:18) 및 근무중 자동 판별
 *  3. 전 디바이스 단일 데이터 소스 자동 반영:
 *     - data/_legacy/schedules.json 동기화
 *     - data/_legacy/attendance_logs.json 동기화
 *     - data/mockData.js (schedules, attendance.logs) 자동 업데이트
 *     - data/build-seed.js 실행 -> data/firebase-seed.json 자동 갱신
 *     - data/verify-seed.js 실행 -> 시드 데이터 무결성 검증
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const vm = require('vm');
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

// 2. 임직원 마스터 로드
function loadEmployees() {
  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  const src = fs.readFileSync(mockPath, 'utf8');
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.MockData.employees || [];
}

// 3. Sitegate 세션 로그인
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

function parseTimeRange(text) {
  if (text.includes('오전')) return '09:00 ~ 12:00';
  if (text.includes('오후')) return '13:00 ~ 18:00';
  if (text.includes('종일')) return '09:00 ~ 18:00';
  return '09:00 ~ 18:00';
}

function formatKoreanTime(timeStr) {
  if (!timeStr || timeStr === '없음' || timeStr === '-') return '-';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1].padStart(2, '0');
  if (h < 12) return `오전 ${String(h).padStart(2, '0')}:${m}`;
  if (h === 12) return `오후 12:${m}`;
  return `오후 ${String(h - 12).padStart(2, '0')}:${m}`;
}

function calcDuration(inStr, outStr) {
  if (!inStr || !outStr || inStr === '없음' || outStr === '없음') return { sec: 0, text: '-' };
  const inParts = inStr.split(':').map(Number);
  const outParts = outStr.split(':').map(Number);
  const diffSec = Math.max(0, (outParts[0] * 3600 + outParts[1] * 60) - (inParts[0] * 3600 + inParts[1] * 60));
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  return { sec: diffSec, text: `${h}시간 ${m}분` };
}

async function main() {
  console.log('🚀 [그룹웨어 근태 및 출퇴근 데이터 크롤링 & 동기화 시작]');

  const env = loadEnv();
  const baseUrl = env.SITEGATE_URL || 'http://sitegate.co.kr';
  const mb_id = env.SITEGATE_ID || 'yellow';
  const mb_password = env.SITEGATE_PW || '';

  if (!mb_password) {
    console.error('❌ .env 파일에 SITEGATE_PW(비밀번호)가 없습니다.');
    process.exit(1);
  }

  console.log(`🔑 [1/5] sitegate.co.kr 로그인 중... (아이디: ${mb_id})`);
  const cookieHeader = await login(baseUrl, mb_id, mb_password);
  console.log('✅ [1/5] 로그인 성공! 세션 쿠키 획득 완료');

  const employees = loadEmployees();
  const empMap = new Map();
  employees.forEach(e => {
    if (!empMap.has(e.name)) empMap.set(e.name, e);
  });

  // -------------------------------------------------------------
  // 1. 근태일지 캘린더 (bo_table=daily_report&skin=diary) 크롤링
  // -------------------------------------------------------------
  console.log('📥 [2/5] 전사 근태일지(8월, 9월, 10월) 캘린더 데이터 크롤링 중...');
  const months = [8, 9, 10];
  const allSchedules = {};
  let excludedCount = 0;

  for (const m of months) {
    const url = `${baseUrl}/html/board/bbs/board.php?bo_table=daily_report&skin=diary&year=2026&month=${m}&id=${mb_id}`;
    const res = await fetch(url, {
      headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const buf = await res.arrayBuffer();
    const html = new TextDecoder('euc-kr').decode(buf);
    const $ = cheerio.load(html);
    const t3 = $('table').eq(3);

    t3.find('td').each((_, td) => {
      if ($(td).find('table').length > 0 || !$(td).text().includes('●')) return;
      const dayA = $(td).find('a').filter((__, a) => /^\d+$/.test($(a).text().trim()));
      if (dayA.length === 0) return;
      const day = parseInt(dayA.first().text().trim(), 10);
      if (isNaN(day)) return;

      const rawText = $(td).text().replace(/\s+/g, ' ');
      const parts = rawText.split('●').map(p => p.trim()).filter(Boolean);
      const dayItems = [];

      parts.forEach((part, idx) => {
        let text = part;
        if (idx === 0) text = text.replace(/^\d+/, '').trim();
        if (!text) return;

        const nameMatch = text.match(/^\[([^\]]+)\]\s*(.*)$/);
        if (!nameMatch) return;
        const name = nameMatch[1].trim();
        const rest = nameMatch[2].trim();

        // ⚠️ 사용자 명시적 요구: '윤성호'는 제외
        if (name === '윤성호') {
          excludedCount++;
          return;
        }

        const emp = empMap.get(name);
        const author = emp ? `${emp.name} ${emp.role}` : name;
        const avatar = emp ? emp.avatar : './resource/image/profile_default.png';
        const isSelf = (name === '이재광');

        let badge = '일정';
        let type = 'primary';
        let time = '09:00 ~ 18:00';
        let location = '';
        let title = rest;

        if (rest.startsWith('연차')) {
          badge = '연차';
          type = isSelf ? 'error' : 'secondary';
          time = '종일';
          title = '연차';
        } else if (rest.startsWith('생일휴가')) {
          badge = '휴가';
          type = isSelf ? 'error' : 'secondary';
          time = '종일';
          title = '생일휴가';
        } else if (rest.startsWith('공가')) {
          badge = '공가';
          type = 'secondary';
          time = '종일';
          title = '공가';
        } else if (rest.startsWith('반차')) {
          badge = '반차';
          type = isSelf ? 'error' : 'warning';
          if (rest.includes('오전')) {
            time = '09:00 ~ 14:00';
            title = '반차(오전)';
          } else {
            time = '13:00 ~ 18:00';
            title = '반차(오후)';
          }
        } else if (rest.startsWith('반반차')) {
          badge = '반반차';
          type = isSelf ? 'error' : 'warning';
          const timeMatch = rest.match(/\[(\d{1,2}:\d{2}\s*~\s*\d{1,2}:\d{2})\]/);
          time = timeMatch ? timeMatch[1] : '16:00 ~ 18:00';
          title = timeMatch ? `반반차 [${timeMatch[1].replace(/\s+/g, '')}]` : '반반차';
        } else if (rest.startsWith('외근')) {
          badge = '외근';
          type = 'primary';
          time = parseTimeRange(rest);

          const locMatch = rest.match(/\[([^\]]+)\]\s*(.*)$/);
          if (locMatch) {
            location = locMatch[1].trim();
            const desc = locMatch[2].trim();
            const prefix = rest.split('[')[0].trim();
            title = desc ? `${prefix} ${desc}` : prefix;
          } else {
            title = rest;
          }
        }

        dayItems.push({
          title,
          location,
          time,
          type,
          badge,
          author,
          avatar
        });
      });

      if (dayItems.length > 0) {
        allSchedules[`2026-${m}-${day}`] = dayItems;
      }
    });
  }
  console.log(`✅ [2/5] 근태일지 크롤링 완료: 총 ${Object.keys(allSchedules).length}개 일자 일정 등록 ('윤성호' 제외: ${excludedCount}건)`);

  // -------------------------------------------------------------
  // 2. 출퇴근 기록 (bo_table=attendance) 크롤링
  // -------------------------------------------------------------
  console.log('📥 [3/5] 개인 출퇴근 기록(bo_table=attendance) 크롤링 중...');
  const allLogs = [];
  let logId = 1;

  for (const m of [8, 9]) {
    const url = `${baseUrl}/html/board/bbs/board.php?bo_table=attendance&year=2026&month=${m}&id=`;
    const res = await fetch(url, {
      headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const buf = await res.arrayBuffer();
    const html = new TextDecoder('euc-kr').decode(buf);
    const $ = cheerio.load(html);
    const t39 = $('table').eq(39);

    t39.find('tr').each((_, tr) => {
      const cols = [];
      $(tr).find('td').each((__, td) => cols.push($(td).text().replace(/\s+/g, ' ').trim()));
      if (cols.length < 3 || !/^\d{4}-\d{2}-\d{2}/.test(cols[0])) return;

      const [dateStr, inTime, outTime] = cols;
      const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s*\(([^)]+)\)/);
      if (!match) return;

      const [, yyyy, mm, dd, dayChar] = match;
      const rawDate = `${yyyy}-${mm}-${dd}`;

      // 오늘(2026-09-11) 이후 미래 날짜 및 출퇴근 기록 없는 날짜 제외
      if (rawDate > '2026-09-11') return;
      if ((!inTime || inTime === '없음') && (!outTime || outTime === '없음')) return;

      const duration = calcDuration(inTime, outTime);
      let statusText = '출근';
      let statusType = 'normal';

      if (inTime && inTime !== '없음') {
        if (outTime && outTime !== '없음') {
          statusText = `출근 • ${duration.text}`;
        } else {
          statusText = '출근 • 근무중';
        }
      }

      allLogs.push({
        id: logId++,
        monthStr: `${parseInt(mm, 10)}월`,
        dayNum: String(parseInt(dd, 10)),
        dayName: `${dayChar}요일`,
        statusText,
        statusType,
        checkInTimeStr: formatKoreanTime(inTime),
        checkOutTimeStr: formatKoreanTime(outTime),
        durationSec: duration.sec,
        rawDate
      });
    });
  }

  // 최신 일자 우선 정렬 및 id 재부여
  allLogs.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  allLogs.forEach((item, idx) => {
    item.id = idx + 1;
    delete item.rawDate;
  });
  console.log(`✅ [3/5] 출퇴근 기록 크롤링 완료: 총 ${allLogs.length}건 수집 (최신: ${allLogs[0] ? `${allLogs[0].monthStr} ${allLogs[0].dayNum}일 ${allLogs[0].checkInTimeStr}` : '없음'})`);

  // -------------------------------------------------------------
  // 3. 파일 저장 및 mockData.js 동기화
  // -------------------------------------------------------------
  console.log('💾 [4/5] data/_legacy 및 data/mockData.js 파일 동기화 중...');

  // 3-1. data/_legacy/schedules.json 저장
  const legacySchedPath = path.join(ROOT, 'data', '_legacy', 'schedules.json');
  fs.writeFileSync(legacySchedPath, JSON.stringify(allSchedules, null, 2) + '\n', 'utf8');

  // 3-2. data/_legacy/attendance_logs.json 저장
  const legacyAttPath = path.join(ROOT, 'data', '_legacy', 'attendance_logs.json');
  const legacyAttData = {
    officeLocation: {
      name: '서울 금천구 벚꽃로 298',
      address: '서울특별시 금천구 벚꽃로 298 (가산동)',
      lat: 37.48120,
      lng: 126.88370,
      allowedRadiusMeters: 500
    },
    logs: allLogs
  };
  fs.writeFileSync(legacyAttPath, JSON.stringify(legacyAttData, null, 2) + '\n', 'utf8');

  // 3-3. data/mockData.js 치환
  const mockPath = path.join(ROOT, 'data', 'mockData.js');
  let mockContent = fs.readFileSync(mockPath, 'utf8');

  // 일정 블록 치환
  const schedJsonString = JSON.stringify(allSchedules, null, 2)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : '  ' + line))
    .join('\n');

  mockContent = mockContent.replace(
    /(  \/\/ 4\. 일정 데이터맵[\s\S]*?schedules:\s*\{)[\s\S]*?(\n  \},)/,
    `$1\n${schedJsonString.slice(2, -2)}\n  },`
  );

  // 근태 로그 블록 치환
  const attLogsJsonString = JSON.stringify(allLogs, null, 2)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : '    ' + line))
    .join('\n');

  mockContent = mockContent.replace(
    /(logs:\s*\[)[\s\S]*?(\n    \])/,
    `$1\n${attLogsJsonString.slice(4, -2)}\n    ]`
  );

  fs.writeFileSync(mockPath, mockContent, 'utf8');
  console.log('✅ [4/5] mockData.js 및 legacy JSON 동기화 완료');

  // -------------------------------------------------------------
  // 4. Firestore 시드 재생성 및 무결성 검증
  // -------------------------------------------------------------
  console.log('🔨 [5/5] Firestore 시드 자동 빌드 및 무결성 검증 중...');
  execSync('npm run build:seed', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run verify:seed', { cwd: ROOT, stdio: 'inherit' });

  console.log('\n🎉 [성공] 그룹웨어 근태 및 출퇴근 데이터 크롤링 & 전 디바이스 동기화가 완벽히 완료되었습니다!');
}

main().catch(err => {
  console.error('\n❌ 크롤링 중 오류 발생:', err);
  process.exit(1);
});
