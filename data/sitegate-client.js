/**
 * sitegate 출퇴근 중계 클라이언트 (window.WncSitegate)
 *
 * 앱의 출근/퇴근 버튼을 기존 그룹웨어(sitegate.co.kr)와 연동한다.
 *
 * 브라우저는 sitegate를 직접 호출할 수 없다(HTTP 전용 + CORS 없음 + 자격 증명 노출).
 * 그래서 같은 출처의 중계 엔드포인트 /api/attendance 에 요청하고, 서버가 대신 처리한다.
 * 중계는 로컬 개발 서버(npm start)에만 있으므로, 없으면 조용히 로컬 전용으로 동작한다.
 *
 * 설계 원칙
 *  1. 중계가 없어도 앱은 기존과 100% 동일하게 동작한다. 연동은 '있으면 좋은' 계층이다.
 *  2. 화면을 먼저 갱신하고 중계는 뒤에서 처리한다. 느린 네트워크가 버튼을 막지 않는다.
 *  3. 성공을 단정하지 않는다. 서버가 실제 기록을 다시 읽어 확인한 결과만 성공으로 알린다.
 */
(function () {
  'use strict';

  const ENDPOINT = '/api/attendance';
  const SYNC_ENDPOINT = '/api/sync/daily-reports';
  const TIMEOUT_MS = 20000;
  const SYNC_TIMEOUT_MS = 180000; // 크롤링은 로그인·파싱·시드 재생성까지 포함해 오래 걸린다.

  // 중계 존재 여부는 한 번만 확인하고 재사용한다(매번 확인하면 버튼이 느려진다).
  let availability = null;

  function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('중계 서버 응답이 없습니다.')), ms);
      promise.then(
        (v) => { clearTimeout(timer); resolve(v); },
        (e) => { clearTimeout(timer); reject(e); }
      );
    });
  }

  /** 중계 엔드포인트가 살아 있는지 확인한다. GitHub Pages 등에서는 false. */
  async function isAvailable() {
    if (availability !== null) return availability;
    try {
      // 가용성 확인에는 부작용이 없는 엔드포인트를 쓴다.
      // (GET /api/attendance 는 확인할 때마다 sitegate에 실제 로그인해 느리다.)
      const res = await withTimeout(fetch(SYNC_ENDPOINT, { method: 'GET' }), 5000);
      // 정적 호스팅이면 404/HTML이 돌아온다. JSON 응답일 때만 중계로 인정한다.
      const type = res.headers.get('content-type') || '';
      availability = res.ok && type.includes('application/json');
    } catch (_) {
      availability = false;
    }
    return availability;
  }

  /** 오늘의 sitegate 출퇴근 상태를 조회한다. 중계가 없으면 null. */
  async function getStatus() {
    if (!(await isAvailable())) return null;
    try {
      const res = await withTimeout(fetch(ENDPOINT, { method: 'GET' }), TIMEOUT_MS);
      return await res.json();
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  /**
   * sitegate에 실제로 출근/퇴근을 등록한다.
   *
   * @param {'in'|'out'} mode
   * @returns {Promise<{skipped?:boolean, ok:boolean, message?:string}>}
   *          중계가 없으면 { skipped: true } 를 돌려준다(오류가 아니다).
   */
  async function register(mode) {
    if (!(await isAvailable())) return { skipped: true, ok: false };
    try {
      const res = await withTimeout(fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, confirm: true })
      }), TIMEOUT_MS);
      return await res.json();
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  /**
   * 출퇴근 버튼에서 부르는 진입점.
   * 결과를 토스트로 알리되, 화면 상태는 이미 갱신된 뒤이므로 여기서 건드리지 않는다.
   *
   * @param {'in'|'out'} mode
   * @param {(msg:string)=>void} toast 앱의 showToast 함수
   */
  async function syncAndNotify(mode, toast) {
    const label = mode === 'in' ? '출근' : '퇴근';
    const result = await register(mode);

    // 중계가 없는 환경(정적 호스팅)에서는 아무 말도 하지 않는다. 로컬 기록만으로 정상이다.
    if (result.skipped) return result;

    if (result.ok) {
      toast(`🔗 그룹웨어에도 ${label} 등록되었습니다. (${result.message || ''})`.trim());
    } else {
      toast(`⚠️ 그룹웨어 ${label} 등록 실패: ${result.message || '알 수 없는 오류'}`);
    }
    return result;
  }

  /**
   * 지정한 연·월의 근태일지를 sitegate에서 크롤링해 앱 데이터에 반영한다.
   * 설정 화면의 '근태일지 크롤링' 버튼이 사용한다.
   *
   * 크롤링은 서버가 파일을 고쳐 쓰는 작업이라 수십 초가 걸릴 수 있어 타임아웃을 길게 둔다.
   *
   * @param {number} year
   * @param {number} month 1~12
   * @returns {Promise<{skipped?:boolean, ok:boolean, message?:string}>}
   */
  async function syncDailyReports(year, month) {
    if (!(await isAvailable())) {
      return { skipped: true, ok: false, message: '크롤링 중계 서버가 없는 환경입니다. 로컬 개발 서버(npm start)에서만 동작합니다.' };
    }
    try {
      const res = await withTimeout(fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, confirm: true })
      }), SYNC_TIMEOUT_MS);
      return await res.json();
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  window.WncSitegate = { isAvailable, getStatus, register, syncAndNotify, syncDailyReports };
})();
