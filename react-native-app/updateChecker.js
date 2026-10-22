/**
 * 앱 업데이트 확인 (안드로이드)
 *
 * 스토어를 거치지 않고 APK를 직접 배포하므로, 앱이 스스로 최신 버전인지 확인해야 한다.
 * 서버의 app-version.json과 현재 설치된 버전을 비교해 결과만 돌려주고,
 * 화면 표시와 다운로드 실행은 호출한 쪽(App.js)이 결정한다.
 */
import appJson from './app.json';

const VERSION_URL = 'https://wnc-groupware.vercel.app/app-version.json';

/** 설치된 앱의 버전. app.json의 값이 빌드에 그대로 들어간다. */
export const CURRENT_VERSION = appJson.expo.version;

/**
 * "1.2.10" 형태의 버전을 숫자 단위로 비교한다.
 * 문자열 비교를 쓰면 "1.2.10" < "1.2.9"로 잘못 판정되므로 직접 자릿수를 맞춘다.
 *
 * @returns {number} a가 크면 1, 작으면 -1, 같으면 0
 */
export function compareVersions(a, b) {
  const pa = String(a || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}

/**
 * 서버에서 최신 버전 정보를 받아 업데이트 필요 여부를 판단한다.
 *
 * 네트워크 실패나 형식 오류는 그냥 '업데이트 없음'으로 처리한다.
 * 업데이트 확인 실패 때문에 앱 사용이 막히면 안 되기 때문이다.
 *
 * @returns {Promise<{available: boolean, required?: boolean, version?: string, downloadUrl?: string, releaseNotes?: string}>}
 */
export async function checkForUpdate() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    // 캐시된 옛 정보를 읽지 않도록 쿼리를 붙인다.
    const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timer);
    if (!response.ok) return { available: false };

    const info = (await response.json()).android || {};
    if (!info.version || !info.downloadUrl) return { available: false };
    if (compareVersions(info.version, CURRENT_VERSION) <= 0) return { available: false };

    return {
      available: true,
      // minimumVersion보다 낮으면 계속 쓰게 둘 수 없는 버전이다(건너뛰기를 막는다).
      required: compareVersions(info.minimumVersion || '0', CURRENT_VERSION) > 0,
      version: info.version,
      downloadUrl: info.downloadUrl,
      releaseNotes: info.releaseNotes || ''
    };
  } catch (_) {
    return { available: false };
  }
}
