const { createSign, timingSafeEqual } = require('node:crypto');
const { syncMonth } = require('./daily-reports');

function authorized(header) {
  const expected = process.env.CRON_SECRET;
  if (!expected || typeof header !== 'string') return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function serviceToken() {
  const key = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const jwt = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: key.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const signature = createSign('RSA-SHA256').update(jwt).sign(key.private_key, 'base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', signal: AbortSignal.timeout(20000),
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${jwt}.${signature}` })
  });
  if (!response.ok) throw new Error('서비스 계정 인증 실패');
  return (await response.json()).access_token;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!authorized(req.headers.authorization)) return res.status(401).json({ ok: false });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT || !['SITEGATE_URL', 'SITEGATE_ID', 'SITEGATE_PW'].every(k => process.env[k])) {
    return res.status(503).json({ ok: false, message: '자동 수집 서버 설정이 필요합니다.' });
  }
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric' }).formatToParts(new Date());
    const year = Number(parts.find(p => p.type === 'year').value);
    const month = Number(parts.find(p => p.type === 'month').value);
    const result = await syncMonth({ year, month, token: await serviceToken(), actor: 'scheduled-crawler' });
    return res.status(200).json({ ...result, year, month });
  } catch (error) {
    console.error('[scheduled sync]', error.name);
    return res.status(502).json({ ok: false, message: '자동 수집 또는 저장에 실패했습니다.' });
  }
};
