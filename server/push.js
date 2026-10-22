/**
 * 웹 푸시 발송 모듈 (FCM HTTP v1)
 *
 * 클라이언트는 users/{uid}/push_tokens/{token} 에 자기 기기 토큰을 등록해 둔다.
 * 여기서는 서비스 계정 권한으로 그 토큰들을 읽어 메시지를 보내고,
 * 더 이상 유효하지 않은 토큰은 즉시 정리한다(정리하지 않으면 실패가 계속 쌓인다).
 */
const { serviceToken } = require('./firebase');

const PROJECT = 'wnc-groupware';
const DOCUMENTS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const SEND = `https://fcm.googleapis.com/v1/projects/${PROJECT}/messages:send`;
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

/** 한 사용자가 등록해 둔 모든 기기 토큰을 가져온다. */
async function tokensOf(uid, dataToken) {
  const response = await fetch(`${DOCUMENTS}/users/${uid}/push_tokens?pageSize=50`, {
    headers: { Authorization: `Bearer ${dataToken}` }, signal: AbortSignal.timeout(20000)
  });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error('푸시 토큰 조회 실패');
  const documents = (await response.json()).documents || [];
  return documents.map(doc => doc.name.split('/').pop());
}

/** 무효해진 토큰을 지운다. 실패해도 발송 결과에는 영향을 주지 않는다. */
async function dropToken(uid, token, dataToken) {
  await fetch(`${DOCUMENTS}/users/${uid}/push_tokens/${encodeURIComponent(token)}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${dataToken}` }, signal: AbortSignal.timeout(20000)
  }).catch(() => { });
}

/**
 * 한 명에게 알림을 보낸다.
 *
 * 메시지는 notification 블록 없이 data 전용으로 보낸다.
 * 그래야 서비스 워커의 onBackgroundMessage가 항상 호출되어
 * 아이콘·클릭 동작을 앱이 일관되게 제어할 수 있다.
 *
 * @param {string} uid 받는 사람의 Firebase UID
 * @param {{title: string, body?: string, link?: string, tag?: string}} message
 * @returns {Promise<{sent: number, failed: number, dropped: number}>}
 */
async function sendToUser(uid, message) {
  const [dataToken, pushToken] = await Promise.all([serviceToken(), serviceToken(MESSAGING_SCOPE)]);
  const tokens = await tokensOf(uid, dataToken);
  if (!tokens.length) return { sent: 0, failed: 0, dropped: 0 };

  const data = {
    title: String(message.title || '새 알림'),
    body: String(message.body || ''),
    link: String(message.link || '/'),
    tag: String(message.tag || 'wnc-groupware')
  };

  let sent = 0, failed = 0, dropped = 0;
  for (const token of tokens) {
    const response = await fetch(SEND, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pushToken}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ message: { token, data, webpush: { headers: { Urgency: 'high' } } } })
    });
    if (response.ok) { sent++; continue; }
    failed++;
    // 404(등록 해제) / 400(토큰 형식 무효)는 되살아나지 않으므로 바로 지운다.
    if (response.status === 404 || response.status === 400) {
      await dropToken(uid, token, dataToken);
      dropped++;
    }
  }
  return { sent, failed, dropped };
}

module.exports = { sendToUser, tokensOf, MESSAGING_SCOPE };
