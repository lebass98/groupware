const { collect, save } = require('../../server/business');
const { syncAttendanceLogs } = require('../../server/attendance-sync');
const { member, serviceToken, DOCUMENTS } = require('../../server/sitegate-user');
const { syncMonth } = require('./daily-reports');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  try {
    const user = await member(req);
    if (!user) return res.status(401).json({ ok: false });
    const token = await serviceToken();
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric' }).formatToParts(new Date());
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const force = body.force === true && body.confirm === true;
    const year = force ? Number(body.year) : Number(parts.find(p => p.type === 'year').value);
    const month = force ? Number(body.month) : Number(parts.find(p => p.type === 'month').value);
    if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) return res.status(400).json({ ok: false });
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const personal = await syncAttendanceLogs(user, token, { year, month });
    const leavesMeta = await fetch(`${DOCUMENTS}/meta/business-leaves`, { headers, signal: AbortSignal.timeout(20000) });
    if (force || !leavesMeta.ok || Date.now() - Date.parse((await leavesMeta.json()).fields.updatedAt.timestampValue) > 600000) await save('leaves', await collect('leaves'), token);
    const personalMessage = personal.connected ? '출퇴근·연차·휴가·외근·근태 정보를 반영했습니다.' : '연차·휴가·외근·근태 정보를 반영했습니다. 개인 출퇴근 시간은 설정에서 본인 그룹웨어 계정을 연결해 주세요.';
    const meta = await fetch(`${DOCUMENTS}/meta/sitegate-sync-${year}-${month}`, { headers, signal: AbortSignal.timeout(20000) });
    if (meta.ok) {
      const updatedAt = (await meta.json()).fields.updatedAt.stringValue;
      if (!force && Date.now() - Date.parse(updatedAt) < 600000) return res.status(200).json({ ok: true, cached: true, message: personalMessage });
    } else if (meta.status !== 404) throw new Error('수집 상태 조회 실패');
    const lockPath = `sync_locks/login-${year}-${month}`;
    const lockResponse = await fetch(`${DOCUMENTS}/${lockPath}`, { headers, signal: AbortSignal.timeout(20000) });
    const lock = lockResponse.ok ? await lockResponse.json() : null;
    if (!lockResponse.ok && lockResponse.status !== 404) throw new Error('수집 잠금 조회 실패');
    if (lock && Date.now() - Date.parse(lock.fields.startedAt.timestampValue) < 300000) return res.status(200).json({ ok: true, pending: true, message: '다른 로그인에서 수집 중이며 완료되면 자동 반영됩니다.' });
    const acquire = await fetch(`${DOCUMENTS}:commit`, {
      method: 'POST', headers, signal: AbortSignal.timeout(20000), body: JSON.stringify({ writes: [{
        update: { name: `projects/wnc-groupware/databases/(default)/documents/${lockPath}`, fields: { startedAt: { timestampValue: new Date().toISOString() } } },
        currentDocument: lock ? { updateTime: lock.updateTime } : { exists: false }
      }] })
    });
    if (acquire.status === 409 || acquire.status === 412) return res.status(200).json({ ok: true, pending: true });
    if (!acquire.ok) throw new Error('수집 잠금 생성 실패');
    try {
      const result = await syncMonth({ year, month, token, actor: user.localId });
      return res.status(200).json({ ...result, personal, message: personalMessage });
    } finally {
      await fetch(`${DOCUMENTS}/${lockPath}`, { method: 'DELETE', headers, signal: AbortSignal.timeout(20000) }).catch(() => {});
    }
  } catch (error) {
    console.error('[login sync]', error.name);
    return res.status(502).json({ ok: false, message: '로그인은 완료됐지만 자동 수집에 실패했습니다. 설정에서 다시 수집할 수 있습니다.' });
  }
};
