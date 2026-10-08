const { collectDailyReports } = require('../../scripts/sync-daily-reports');
const employees = require('../../data/_legacy/employees.json');

const PROJECT = 'wnc-groupware';
const API_KEY = 'AIzaSyDlJlejygCf0BAzyiXtWApjZB3pq_zC1cY';
const DOCUMENTS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function valueOf(value) {
  if (value === null) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(valueOf) } };
  if (typeof value === 'object') return { mapValue: { fields: fieldsOf(value) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  return { stringValue: String(value) };
}
function fieldsOf(object) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, valueOf(value)]));
}
async function request(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
}
async function requireAdmin(token) {
  if (!token) return null;
  const auth = await request(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token })
  });
  if (!auth.ok) return null;
  const user = (await auth.json()).users?.[0];
  if (!user?.localId) return null;
  const admin = await request(`${DOCUMENTS}/admins/${encodeURIComponent(user.localId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return admin.ok ? user : null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const configured = ['SITEGATE_URL', 'SITEGATE_ID', 'SITEGATE_PW'].every(key => !!process.env[key]);
  if (req.method === 'GET') return res.status(200).json({ ok: true, available: configured, transport: 'vercel', requiresAuth: true });
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST만 지원합니다.' });
  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : req.body || {};
  const { year, month, confirm } = body;
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12 || confirm !== true) {
    return res.status(400).json({ ok: false, message: '크롤링할 연·월을 확인해 주세요.' });
  }
  if (!configured) return res.status(503).json({ ok: false, message: '서버의 sitegate 로그인 설정이 필요합니다.' });
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  try {
    const admin = await requireAdmin(token);
    if (!admin) return res.status(403).json({ ok: false, message: 'Firebase 관리자 계정으로 로그인한 뒤 다시 실행해 주세요.' });
    return res.status(200).json(await syncMonth({ year, month, token, actor: admin.localId }));
  } catch (error) {
    console.error('[sitegate sync]', error.name, error.message.replace(/https?:\/\/\S+/g, '[upstream]'));
    return res.status(502).json({ ok: false, message: error.name === 'TimeoutError' ? 'sitegate 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.' : 'sitegate 로그인 또는 데이터 수집에 실패했습니다. 서버 로그를 확인해 주세요.' });
  }
};

async function syncMonth({ year, month, token, actor }) {
    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const result = await collectDailyReports({
      baseUrl: process.env.SITEGATE_URL.replace(/\/$/, ''),
      mb_id: process.env.SITEGATE_ID,
      mb_password: process.env.SITEGATE_PW,
      employees,
      range: { year, month, todayStr, scheduleMonths: [{ year, month }], attendanceMonths: [{ year, month }] },
      fetchImpl: request
    });
    // 한 달의 빈 날짜도 저장하여 원본에서 삭제된 일정이 남지 않도록 한다.
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const writes = [];
    const name = path => `projects/${PROJECT}/databases/(default)/documents/${path}`;
    for (let day = 1; day <= days; day++) {
      const date = `${year}-${month}-${day}`;
      writes.push({ update: { name: name(`schedules/${date}`), fields: fieldsOf({ date, items: result.schedules[date] || [] }) } });
    }
    const sourceEmail = employees.find(employee => employee.email?.split('@')[0] === process.env.SITEGATE_ID)?.email || '';
    const payload = { source: 'sitegate', sourceEmail, year, month, schedules: result.schedules, logs: result.logs, updatedAt: now.toISOString(), updatedBy: actor };
    writes.push({ update: { name: name(`meta/sitegate-sync-${year}-${month}`), fields: fieldsOf(payload) } });
    const saved = await request(`${DOCUMENTS}:commit`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ writes })
    });
    if (!saved.ok) throw new Error('Firestore 저장 실패');
    return { ok: true, scheduleDays: Object.keys(result.schedules).length, attendanceCount: result.logs.length, message: 'Firestore에 동기화했습니다.' };
}
module.exports.syncMonth = syncMonth;
