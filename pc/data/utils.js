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

  window.WncUtils = { escapeHtml, escapeAttr };

  // 템플릿 안에서 짧게 쓰기 위한 전역 별칭.
  window.esc = escapeHtml;
  window.escAttr = escapeAttr;
})();
