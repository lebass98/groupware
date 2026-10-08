const { serviceToken } = require('./firebase');
const DOCUMENTS = 'https://firestore.googleapis.com/v1/projects/wnc-groupware/databases/(default)/documents';
const API_KEY = 'AIzaSyDlJlejygCf0BAzyiXtWApjZB3pq_zC1cY';
async function member(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!token) return null;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }), signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) return null;
  const user = (await response.json()).users?.[0];
  if (!user?.email || !user.localId) return null;
  const exists = await fetch(`${DOCUMENTS}/members/${encodeURIComponent(user.email.toLowerCase())}`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000)
  });
  return exists.ok ? user : null;
}
async function credentials(user, token) {
  const id = user.email.split('@')[0];
  if (id === process.env.SITEGATE_ID) return { id, pw: process.env.SITEGATE_PW, baseUrl: process.env.SITEGATE_URL.replace(/\/$/, '') };
  const response = await fetch(`${DOCUMENTS}/sitegate_credentials/${user.localId}`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000)
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('계정 설정 조회 실패');
  const fields = (await response.json()).fields;
  if (fields.id.stringValue !== id) throw new Error('계정 불일치');
  return { id, pw: fields.password.stringValue, baseUrl: process.env.SITEGATE_URL.replace(/\/$/, '') };
}
module.exports = { member, credentials, serviceToken, DOCUMENTS };
