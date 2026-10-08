const { credentials, DOCUMENTS } = require('./sitegate-user');
const { collectDailyReports } = require('../scripts/sync-daily-reports');
const employees = require('../data/_legacy/employees.json');
async function syncAttendanceLogs(user, token, { year, month }) {
  const cfg = await credentials(user, token);
  if (!cfg) return { connected: false };
  const result = await collectDailyReports({ baseUrl: cfg.baseUrl, mb_id: cfg.id, mb_password: cfg.pw, employees,
    range: { year, month, todayStr: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), scheduleMonths: [], attendanceMonths: [{ year, month }] },
    fetchImpl: (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(20000) }) });
  const saved = await fetch(`${DOCUMENTS}/users/${user.localId}/attendance_months/${year}-${month}`, {
    method: 'PATCH', signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { year: { integerValue: String(year) }, month: { integerValue: String(month) },
      logs: { stringValue: JSON.stringify(result.logs) }, sourceEmail: { stringValue: user.email }, updatedAt: { timestampValue: new Date().toISOString() } } })
  });
  if (!saved.ok) throw new Error('개인 출퇴근 수집 저장 실패');
  return { connected: true, attendanceCount: result.logs.length };
}
module.exports = { syncAttendanceLogs };
