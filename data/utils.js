/**
 * WnC 그룹웨어 공용 유틸리티 (window.WncUtils)
 *
 * script.js(모바일)와 pc.js(PC)가 함께 쓰는 순수 함수 모음이다.
 * 두 파일에 같은 로직을 복사하면 한쪽만 고쳐져 동작이 갈라지므로 여기에 한 번만 둔다.
 *
 * 로드 순서: 이 파일은 script.js / pc.js 보다 먼저 로드되어야 한다.
 */
(function () {
  'use strict';

  /**
   * HTML 특수문자를 이스케이프한다.
   *
   * 이 앱은 화면 대부분을 템플릿 문자열 + innerHTML로 그린다.
   * 사용자가 입력한 값(할 일 제목, 메모, 사유 등)을 그대로 끼워 넣으면
   * 입력에 포함된 태그가 마크업으로 해석되어 실행된다.
   *
   * 지금은 데이터가 LocalStorage에 갇혀 있어 자기 자신에게만 영향이 있지만,
   * Firestore 동기화와 관리자 화면이 붙으면 한 사람의 입력이 다른 직원 화면에서
   * 실행되는 저장형 XSS가 된다. 그래서 데이터를 공유하기 전에 미리 막아 둔다.
   *
   * 주의: 공지 본문처럼 '의도적으로 HTML을 담는 값'에는 쓰지 않는다.
   *       그런 값은 신뢰할 수 있는 작성자만 만들 수 있어야 한다.
   *
   * @param {*} value 아무 값이나 받는다(null/undefined/숫자 포함).
   * @returns {string} 안전하게 innerHTML에 넣을 수 있는 문자열.
   */
  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')   // & 를 가장 먼저 치환해야 뒤 치환 결과가 다시 망가지지 않는다.
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * HTML 속성값 안에 넣을 문자열을 이스케이프한다.
   * 예: title="${attr(user.name)}" / onclick="fn('${attr(id)}')"
   * 백틱까지 막아 템플릿 문자열 주입도 함께 차단한다.
   */
  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  /**
   * '오전 08:47' / '오후 06:00' 같은 시간 문자열을 24시간제 'HH:MM'으로 줄인다.
   *
   * 모바일 근태 위젯은 숫자를 크게 보여주는 자리라 '오전/오후'까지 넣으면 폭이 모자란다.
   * 단순히 접두어만 떼면 '오후 06:00'이 '06:00'이 되어 아침과 구분되지 않으므로 24시간제로 바꾼다.
   *
   * @param {string} value 시간 문자열. '-' 이나 '--:--' 같은 값은 그대로 돌려준다.
   * @returns {string} 'HH:MM'
   */
  function toShortTime(value) {
    if (!value) return '--:--';
    const str = String(value).trim();
    const m = str.match(/(\d{1,2}):(\d{2})/);
    if (!m) return str; // '승인 대기', '-' 처럼 시간이 아닌 값은 건드리지 않는다.

    let hours = parseInt(m[1], 10);
    if (str.includes('오후') && hours < 12) hours += 12;
    if (str.includes('오전') && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${m[2]}`;
  }

  // 한글 상호명의 초성 그룹(ㄱ~ㅎ, A-Z, 0-9, 기타) 판별 — 주소록 거래처 초성 필터용
  var HANGUL_CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  // 쌍자음은 대표 자음으로 묶는다 (ㄲ→ㄱ, ㄸ→ㄷ, ㅃ→ㅂ, ㅆ→ㅅ, ㅉ→ㅈ).
  var CHO_GROUP = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };

  // 상호명에서 초성 판별에 쓸 첫 유의미 글자 (괄호·법인격 접두어 제거)
  function firstMeaningfulChar(name) {
    var s = String(name || '')
      .replace(/\([^)]*\)/g, '')
      .replace(/^(주식회사|사단법인|재단법인|의료법인|사)\s*/, '')
      .replace(/^[\s\-_.,·:;'"!?()\[\]{}#*&/\\]+/, '')
      .trim();
    return s.charAt(0);
  }

  // 첫 글자 → 초성 그룹 키 ('ㄱ'..'ㅎ' | 'A-Z' | '0-9' | '기타')
  function choseongGroup(name) {
    var ch = firstMeaningfulChar(name);
    if (!ch) return '기타';
    var code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      var cho = HANGUL_CHO[Math.floor((code - 0xAC00) / 588)];
      return CHO_GROUP[cho] || cho;
    }
    if (code >= 0x3131 && code <= 0x314E) { // 조합되지 않은 낱자음
      return CHO_GROUP[ch] || ch;
    }
    if (/[A-Za-z]/.test(ch)) return 'A-Z';
    if (/[0-9]/.test(ch)) return '0-9';
    return '기타';
  }

  // ---------------------------------------------------------------------------
  // 임직원 실시간 근무 상태 판정 (근무중 / 외근중 / 휴가중 / 퇴근)
  //
  // 임직원 데이터의 status·statusText는 시드 시점에 고정된 값이라 시간이 지나도
  // 바뀌지 않는다. 그래서 그 값은 쓰지 않고, 크롤링된 '오늘 일정'의 시간대와
  // 현재 시각, 본인의 실제 출퇴근 기록으로 매번 다시 계산한다.
  // PC와 모바일이 같은 결과를 내도록 판정 규칙은 이 함수 하나에만 둔다.
  // ---------------------------------------------------------------------------
  var WORK_START = 9 * 60;   // 09:00
  var WORK_END = 18 * 60;    // 18:00
  var RANK_WORDS = ['대표', '본부장', '팀장', '차장', '과장', '대리', '주임', '사원', '수습'];

  /** "13:00", "오후 1:30", "PM 1", "AM 9:30" 등을 자정 기준 분으로 바꾼다. (모바일은 일정 시간을 'PM 1' 형식으로 가공한다) */
  function toMinutes(text) {
    var str = String(text || '');
    var m = str.match(/(\d{1,2})(?::(\d{2}))?/);
    if (!m) return null;
    var h = Number(m[1]);
    var min = m[2] ? Number(m[2]) : 0;
    if (!m[2] && !/AM|PM|오전|오후/i.test(str)) return null;
    if (/PM|오후/i.test(str) && h < 12) h += 12;
    if (/AM|오전/i.test(str) && h === 12) h = 0;
    return h * 60 + min;
  }

  /** "13:00 ~ 18:00" → {start, end}. 시간이 없거나 '종일'이면 근무시간 전체로 본다. */
  function scheduleWindow(s) {
    var parts = String((s && s.time) || '').split('~');
    var start = toMinutes(parts[0]);
    var end = toMinutes(parts[1]);
    if (start === null) start = WORK_START;
    if (end === null) end = WORK_END;
    return { start: start, end: end };
  }

  /** 일정 작성자 문자열이 이 임직원을 가리키는지 (동명이인은 직책·부서로 구분) */
  function scheduleBelongsTo(s, emp) {
    if (!s || !s.author || !emp || !emp.name) return false;
    if (s.author.indexOf(emp.name) === -1) return false;
    var hasRank = RANK_WORDS.some(function (w) { return s.author.indexOf(w) !== -1; });
    if (hasRank && emp.role) {
      return s.author.indexOf(emp.role) !== -1 || (!!emp.dept && s.author.indexOf(emp.dept) !== -1);
    }
    return true;
  }

  function isHolidayEntry(s) {
    return !!s && (s.badge === '공휴일' || s.author === '공휴일' || s.author === '대한민국 공휴일');
  }

  function scheduleKind(s) {
    var t = String((s && (s.badge || '')) + ' ' + ((s && s.title) || ''));
    if (/외근|출장|미팅/.test(t)) return 'business';
    if (/연차|반차|반반차|휴가|공가|병가|경조/.test(t)) return 'vacation';
    return '';
  }

  /**
   * @param {object} emp 임직원 {name, role, dept}
   * @param {Array} todaySchedules 오늘 날짜의 일정 목록(공휴일 포함)
   * @param {object} [opts]
   *   now: Date (기본: 현재), self: {isCheckedIn, isCheckedOut} — 로그인 본인일 때만 전달
   * @returns {{type:string, text:string, schedule:object|null}}
   */
  function resolveEmployeeStatus(emp, todaySchedules, opts) {
    opts = opts || {};
    var now = opts.now || new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var list = Array.isArray(todaySchedules) ? todaySchedules : [];
    var OFF = { type: 'offwork', text: '퇴근', schedule: null };

    // 1) 주말·공휴일은 휴무
    var day = now.getDay();
    if (day === 0 || day === 6 || list.some(isHolidayEntry)) return OFF;

    // 2) 지금 시각에 걸쳐 있는 본인 외근·휴가 일정
    var mine = list.filter(function (s) { return scheduleBelongsTo(s, emp) && scheduleKind(s); });
    var active = mine.filter(function (s) {
      var w = scheduleWindow(s);
      return nowMin >= w.start && nowMin < w.end;
    });
    // 휴가가 외근보다 우선 (같은 시간대에 둘 다 있으면 자리에 없는 것이 확실하다)
    active.sort(function (a, b) { return scheduleKind(a) === 'vacation' ? -1 : scheduleKind(b) === 'vacation' ? 1 : 0; });
    if (active.length) {
      var kind = scheduleKind(active[0]);
      return kind === 'vacation'
        ? { type: 'vacation', text: '휴가중', schedule: active[0] }
        : { type: 'business', text: '외근중', schedule: active[0] };
    }

    // 3) 로그인 본인은 실제 출퇴근 기록이 가장 정확하다
    if (opts.self) {
      if (opts.self.isCheckedOut) return OFF;
      if (opts.self.isCheckedIn) return { type: 'work', text: '근무중', schedule: null };
    }

    // 4) 그 외에는 근무시간 기준
    return (nowMin >= WORK_START && nowMin < WORK_END)
      ? { type: 'work', text: '근무중', schedule: null }
      : OFF;
  }

  window.WncUtils = { escapeHtml, escapeAttr, toShortTime, choseongGroup, firstMeaningfulChar, resolveEmployeeStatus, scheduleBelongsTo };

  // 템플릿 안에서 짧게 쓰기 위한 전역 별칭.
  window.esc = escapeHtml;
  window.shortTime = toShortTime;
  window.choseongGroup = choseongGroup;
  window.escAttr = escapeAttr;
})();
