/**
 * GitHub Actions 실행 클라이언트 (window.WncActions)
 *
 * 왜 필요한가
 *   GitHub Pages는 정적 호스팅이라 서버가 없다. 그래서 배포본에서는
 *   sitegate 크롤링·출퇴근 등록을 직접 할 수 없다(중계 서버 부재).
 *
 *   하지만 크롤링을 실제로 수행하는 주체는 이미 GitHub Actions에 있다.
 *   버튼이 할 일은 "그 워크플로를 지금 실행시켜라" 하고 방아쇠를 당기는 것뿐이고,
 *   GitHub REST API는 브라우저에서 직접 호출할 수 있다(CORS 허용).
 *
 *   앱 버튼 → api.github.com(dispatch) → Actions가 크롤링 → 커밋 → Pages 재배포
 *
 * 토큰 보관 원칙
 *   - 토큰은 오직 이 브라우저의 localStorage에만 둔다. 저장소에는 절대 커밋하지 않는다.
 *   - Fine-grained PAT로, 이 저장소 하나에 'Actions: Read and write' 권한만 주어 발급한다.
 *     그러면 토큰이 새어도 할 수 있는 일은 이 저장소의 워크플로 실행이 전부다.
 *   - 토큰이 없는 방문자에게는 버튼이 비활성으로 보인다(관리자 전용 기능).
 */
(function () {
  'use strict';

  const OWNER = 'lebass98';
  const REPO = 'groupware';
  const API = 'https://api.github.com';
  const TOKEN_KEY = 'wnc_github_actions_token';

  const WORKFLOWS = {
    sync: 'sync-attendance.yml',      // 근태일지 크롤링
    attendance: 'attendance.yml'      // 출퇴근 등록
  };

  /** 저장된 토큰을 읽는다. 없으면 빈 문자열. */
  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch (_) {
      return '';
    }
  }

  /** 토큰을 저장한다. 빈 값을 주면 삭제한다. */
  function setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, String(token).trim());
      else localStorage.removeItem(TOKEN_KEY);
      return true;
    } catch (_) {
      return false;
    }
  }

  function hasToken() {
    return !!getToken();
  }

  function headers() {
    return {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    };
  }

  /**
   * 토큰이 유효하고 워크플로를 볼 수 있는지 확인한다.
   * @returns {Promise<{ok:boolean, message:string}>}
   */
  async function verifyToken() {
    if (!hasToken()) return { ok: false, message: '토큰이 등록되지 않았습니다.' };
    try {
      const res = await fetch(`${API}/repos/${OWNER}/${REPO}/actions/workflows`, { headers: headers() });
      if (res.status === 401) return { ok: false, message: '토큰이 유효하지 않습니다. 다시 발급해 주세요.' };
      if (res.status === 403 || res.status === 404) {
        return { ok: false, message: '토큰에 이 저장소의 Actions 권한이 없습니다.' };
      }
      if (!res.ok) return { ok: false, message: `GitHub 응답 오류 (HTTP ${res.status})` };
      return { ok: true, message: '토큰이 정상 등록되었습니다.' };
    } catch (err) {
      return { ok: false, message: `GitHub에 연결하지 못했습니다: ${err.message}` };
    }
  }

  /**
   * 워크플로를 실행시키고, 방금 만들어진 실행 건을 찾아 돌려준다.
   *
   * dispatch API는 실행 ID를 주지 않는다(204 No Content).
   * 그래서 요청 직전 시각을 기록해 두고, 그 이후에 생성된 실행을 찾아 추적한다.
   *
   * @param {'sync'|'attendance'} kind
   * @param {object} inputs 워크플로 입력값
   * @returns {Promise<{ok:boolean, runId?:number, htmlUrl?:string, message:string}>}
   */
  async function dispatch(kind, inputs) {
    const file = WORKFLOWS[kind];
    if (!file) return { ok: false, message: `알 수 없는 워크플로: ${kind}` };
    if (!hasToken()) return { ok: false, needsToken: true, message: 'GitHub 토큰이 등록되지 않았습니다.' };

    const since = Date.now();
    try {
      const res = await fetch(`${API}/repos/${OWNER}/${REPO}/actions/workflows/${file}/dispatches`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ ref: 'main', inputs: inputs || {} })
      });

      if (res.status === 401) return { ok: false, message: '토큰이 유효하지 않습니다.' };
      if (res.status === 403) return { ok: false, message: '토큰에 워크플로 실행 권한이 없습니다.' };
      if (res.status === 404) return { ok: false, message: '워크플로를 찾을 수 없습니다. main 브랜치에 배포되었는지 확인해 주세요.' };
      if (res.status !== 204) {
        let detail = '';
        try { detail = (await res.json()).message || ''; } catch (_) { /* 본문이 없을 수 있다 */ }
        return { ok: false, message: `실행 요청 실패 (HTTP ${res.status}) ${detail}`.trim() };
      }

      const run = await findRecentRun(file, since);
      return { ok: true, runId: run && run.id, htmlUrl: run && run.html_url, message: '워크플로 실행을 요청했습니다.' };
    } catch (err) {
      return { ok: false, message: `GitHub에 연결하지 못했습니다: ${err.message}` };
    }
  }

  /** dispatch 직후 생성된 실행 건을 찾는다. 등록에 몇 초 걸리므로 잠깐 재시도한다. */
  async function findRecentRun(file, since) {
    for (let i = 0; i < 8; i++) {
      await sleep(1500);
      try {
        const res = await fetch(`${API}/repos/${OWNER}/${REPO}/actions/workflows/${file}/runs?per_page=5`, { headers: headers() });
        if (!res.ok) continue;
        const data = await res.json();
        const hit = (data.workflow_runs || []).find((r) => new Date(r.created_at).getTime() >= since - 60000);
        if (hit) return hit;
      } catch (_) { /* 일시적 실패는 무시하고 재시도 */ }
    }
    return null;
  }

  /**
   * 실행이 끝날 때까지 기다린다.
   *
   * @param {number} runId
   * @param {(status:string)=>void} onProgress 진행 상태 콜백('queued'|'in_progress')
   * @param {number} timeoutMs
   * @returns {Promise<{ok:boolean, conclusion?:string, message:string}>}
   */
  async function waitForRun(runId, onProgress, timeoutMs) {
    const limit = timeoutMs || 300000;
    const started = Date.now();

    while (Date.now() - started < limit) {
      await sleep(5000);
      try {
        const res = await fetch(`${API}/repos/${OWNER}/${REPO}/actions/runs/${runId}`, { headers: headers() });
        if (!res.ok) continue;
        const run = await res.json();

        if (run.status !== 'completed') {
          if (typeof onProgress === 'function') onProgress(run.status);
          continue;
        }

        if (run.conclusion === 'success') return { ok: true, conclusion: run.conclusion, message: '워크플로가 성공했습니다.' };
        return { ok: false, conclusion: run.conclusion, message: `워크플로가 ${run.conclusion} 상태로 끝났습니다.` };
      } catch (_) { /* 네트워크 일시 오류는 무시하고 재시도 */ }
    }

    return { ok: false, message: '시간이 초과되었습니다. GitHub Actions 화면에서 진행 상태를 확인해 주세요.' };
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function actionsUrl(kind) {
    const file = WORKFLOWS[kind] || WORKFLOWS.sync;
    return `https://github.com/${OWNER}/${REPO}/actions/workflows/${file}`;
  }

  window.WncActions = {
    getToken, setToken, hasToken, verifyToken,
    dispatch, waitForRun, actionsUrl
  };
})();
