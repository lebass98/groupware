const { member, credentials, serviceToken, DOCUMENTS } = require('../server/sitegate-user');
const { login } = require('../scripts/sitegate-attendance');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ ok: false });
  try {
    const user = await member(req);
    if (!user) return res.status(401).json({ ok: false, message: '직원 계정으로 로그인해 주세요.' });
    const token = await serviceToken();
    if (req.method === 'GET') return res.status(200).json({ ok: true, connected: !!await credentials(user, token), account: user.email.split('@')[0] });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (typeof body.password !== 'string' || !body.password || body.password.length > 256) return res.status(400).json({ ok: false });
    const id = user.email.split('@')[0];
    await login({ baseUrl: process.env.SITEGATE_URL.replace(/\/$/, ''), id, pw: body.password });
    const saved = await fetch(`${DOCUMENTS}/sitegate_credentials/${user.localId}`, {
      method: 'PATCH', signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { id: { stringValue: id }, password: { stringValue: body.password } } })
    });
    if (!saved.ok) throw new Error('저장 실패');
    return res.status(200).json({ ok: true, connected: true, account: id });
  } catch (error) {
    console.error('[sitegate account]', error.name);
    return res.status(502).json({ ok: false, message: '기존 그룹웨어 계정 연결에 실패했습니다. 비밀번호를 확인해 주세요.' });
  }
};
