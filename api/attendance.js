const sitegate = require('../scripts/sitegate-attendance');
const { member, credentials, serviceToken, DOCUMENTS } = require('../server/sitegate-user');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ ok: false });
  try {
    const user = await member(req);
    if (!user) return res.status(401).json({ ok: false, message: '등록된 직원 계정으로 로그인해 주세요.' });
    const token = await serviceToken();
    const cfg = await credentials(user, token);
    if (!cfg) return res.status(409).json({ ok: false, message: '설정에서 본인의 기존 그룹웨어 비밀번호를 연결해 주세요.' });
    if (req.method === 'GET') return res.status(200).json(await sitegate.getStatus(cfg));
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (!['in', 'out'].includes(body.mode) || body.confirm !== true) return res.status(400).json({ ok: false });
    const result = await sitegate.registerAttendance(body.mode, cfg);
    if (result.ok) {
      const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      const saved = await fetch(`${DOCUMENTS}/users/${user.localId}/attendance/${date}`, {
        method: 'PATCH', signal: AbortSignal.timeout(20000),
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { date: { stringValue: date }, email: { stringValue: user.email },
          checkedIn: { booleanValue: !!result.status.checkedIn }, checkedOut: { booleanValue: !!result.status.checkedOut },
          inTime: { stringValue: result.status.inTime || '' }, outTime: { stringValue: result.status.outTime || '' },
          updatedAt: { timestampValue: new Date().toISOString() } } })
      });
      if (!saved.ok) result.message += ' · 기존 그룹웨어 등록은 완료됐지만 Firebase 보관에 실패했습니다.';
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('[attendance]', error.name);
    return res.status(502).json({ ok: false, message: '출퇴근 연동에 실패했습니다. 기존 그룹웨어의 오늘 기록을 확인해 주세요.' });
  }
};
