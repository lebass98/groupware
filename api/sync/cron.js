const { syncAttendanceLogs } = require('../../server/attendance-sync');
const { DOCUMENTS } = require('../../server/sitegate-user');
const { serviceToken } = require('../../server/firebase');
const { timingSafeEqual } = require('node:crypto');
const { syncMonth } = require('./daily-reports');

function authorized(header) {
  const expected = process.env.CRON_SECRET;
  if (!expected || typeof header !== 'string') return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}


module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ ok: false });
  if (!authorized(req.headers.authorization)) return res.status(401).json({ ok: false });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT || !['SITEGATE_URL', 'SITEGATE_ID', 'SITEGATE_PW'].every(k => process.env[k])) {
    return res.status(503).json({ ok: false, message: '자동 수집 서버 설정이 필요합니다.' });
  }
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric' }).formatToParts(new Date());
    const year = Number(parts.find(p => p.type === 'year').value);
    const month = Number(parts.find(p => p.type === 'month').value);
    const token = await serviceToken();
    const result = await syncMonth({ year, month, token, actor: 'scheduled-crawler' });
    const connected = await fetch(`${DOCUMENTS}/sitegate_credentials?pageSize=100`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
    if (!connected.ok) throw new Error('연결 계정 목록 조회 실패');
    const docs = (await connected.json()).documents || [];
    const admins = await fetch(`${DOCUMENTS}/admins?pageSize=100`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
    if (!admins.ok) throw new Error('기본 계정 조회 실패');
    for (const admin of (await admins.json()).documents || []) {
      if (admin.fields.email?.stringValue?.split('@')[0] === process.env.SITEGATE_ID && !docs.some(doc => doc.name.split('/').pop() === admin.name.split('/').pop())) {
        docs.push({ name: admin.name, fields: { id: { stringValue: process.env.SITEGATE_ID } } });
      }
    }
    const failures = [];
    for (const doc of docs) {
      const localId = doc.name.split('/').pop();
      const email = doc.fields.id.stringValue + '@wordncode.com';
      try { await syncAttendanceLogs({ localId, email }, token, { year, month }); } catch { failures.push(email); }
    }
    if (failures.length) return res.status(502).json({ ...result, ok: false, message: '일정은 수집했지만 일부 직원의 출퇴근 조회가 실패했습니다.', failedAccounts: failures.length });
    return res.status(200).json({ ...result, year, month });
  } catch (error) {
    console.error('[scheduled sync]', error.name);
    return res.status(502).json({ ok: false, message: '자동 수집 또는 저장에 실패했습니다.' });
  }
};
