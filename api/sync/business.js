const { collect, save, KINDS } = require('../../server/business');
const { member, serviceToken, DOCUMENTS } = require('../../server/sitegate-user');
const { timingSafeEqual } = require('node:crypto');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ ok: false });
  try {
    const body = req.method === 'GET' ? req.query || {} : typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (!KINDS.includes(body.kind)) return res.status(400).json({ ok: false });
    const header = Buffer.from(req.headers.authorization || '');
    const secret = Buffer.from(`Bearer ${process.env.CRON_SECRET || ''}`);
    const scheduled = !!process.env.CRON_SECRET && header.length === secret.length && timingSafeEqual(header, secret);
    if (!scheduled) {
      const user = await member(req);
      if (!user) return res.status(401).json({ ok: false });
      const token = req.headers.authorization.replace(/^Bearer /, '');
      const admin = await fetch(`${DOCUMENTS}/admins/${user.localId}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
      if (!admin.ok) return res.status(403).json({ ok: false });
    }
    return res.status(200).json(await save(body.kind, await collect(body.kind), await serviceToken()));
  } catch (error) {
    let message = String(error.message || '').replace(/https?:\/\/\S+/g, '[source]');
    for (const key of ['SITEGATE_PW', 'CRON_SECRET', 'FIREBASE_SERVICE_ACCOUNT']) {
      if (process.env[key]) message = message.split(process.env[key]).join('[secret]');
    }
    console.error('[business sync]', error.name, message.slice(0, 160));
    return res.status(502).json({ ok: false, message: '업무 데이터 수집 또는 저장에 실패했습니다. 이전 데이터는 유지됩니다.' });
  }
};
