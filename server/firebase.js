const { createSign } = require('node:crypto');
/**
 * 서비스 계정으로 구글 API 액세스 토큰을 발급받는다.
 *
 * @param {string} [scope] 요청할 OAuth 스코프. 기본값은 Firestore(datastore)이며,
 *                         푸시 발송(FCM HTTP v1)은 firebase.messaging 스코프를 넘겨야 한다.
 */
async function serviceToken(scope = 'https://www.googleapis.com/auth/datastore') {
  const key = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const jwt = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: key.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const signature = createSign('RSA-SHA256').update(jwt).sign(key.private_key, 'base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', signal: AbortSignal.timeout(20000),
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${jwt}.${signature}` })
  });
  if (!response.ok) throw new Error('서비스 계정 인증 실패');
  return (await response.json()).access_token;
}

module.exports = { serviceToken };
