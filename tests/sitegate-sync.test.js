const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
process.env.SITEGATE_URL = 'http://example.test';
process.env.SITEGATE_ID = 'test';
process.env.SITEGATE_PW = 'test';
const handler = require('../api/sync/daily-reports');
const { collectDailyReports } = require('../scripts/sync-daily-reports');

function fixtures() {
  const calendar = '<!-- diary -->' + '<table></table>'.repeat(3)
    + '<table><tr><td><a>1</a> ● [테스터] 반차(오후) ● [윤성호] 연차</td></tr></table>';
  const attendance = '<table></table>'.repeat(39)
    + '<table><tr><td>2025-12-01 (월)</td><td>09:00</td><td>18:00</td></tr></table>';
  return { calendar, attendance };
}
const range = { year: 2025, month: 12, todayStr: '2025-12-08', scheduleMonths: [{ year: 2025, month: 12 }], attendanceMonths: [{ year: 2025, month: 12 }] };
function upstream(url) {
  if (url.includes('login_check')) return new Response('', { status: 302, headers: { 'Set-Cookie': 'session=test; Path=/' } });
  return new Response(url.includes('bo_table=daily_report') ? fixtures().calendar : fixtures().attendance);
}
function response() {
  return { code: 200, setHeader() {}, status(code) { this.code = code; return this; }, json(payload) { this.payload = payload; return this; } };
}

test('수집은 요청한 연도 사용, 제외 대상 제거, 날짜 보존', async () => {
  const result = await collectDailyReports({ baseUrl: 'http://example.test', mb_id: 'test', mb_password: 'test', employees: [{ name: '테스터', role: '팀장', avatar: 'test.png' }], range, fetchImpl: upstream });
  assert.deepEqual(Object.keys(result.schedules), ['2025-12-1']);
  assert.equal(result.schedules['2025-12-1'].length, 1);
  assert.equal(result.schedules['2025-12-1'][0].author, '테스터 팀장');
  assert.equal(result.logs[0].rawDate, '2025-12-01');
  assert.equal(result.logs[0].durationSec, 32400);
});

test('잘못된 입력과 비관리자는 원본 크롤링 및 저장 금지', async () => {
  const original = global.fetch;
  let calls = 0;
  global.fetch = async () => { calls++; return new Response('{}', { status: 401 }); };
  try {
    const invalid = response();
    await handler({ method: 'POST', headers: {}, body: { year: 2025, month: 13, confirm: true } }, invalid);
    assert.equal(invalid.code, 400);
    assert.equal(calls, 0);
    const unauthorized = response();
    await handler({ method: 'POST', headers: { authorization: 'Bearer invalid' }, body: { year: 2025, month: 12, confirm: true } }, unauthorized);
    assert.equal(unauthorized.code, 403);
    assert.equal(calls, 1);
  } finally { global.fetch = original; }
});

test('관리자 수집 결과는 빈 날짜까지 한 번에 원자적으로 저장', async () => {
  const original = global.fetch;
  let commit;
  global.fetch = async (url, options) => {
    if (url.includes('accounts:lookup')) return Response.json({ users: [{ localId: 'admin-test' }] });
    if (url.includes('/admins/')) return Response.json({ name: 'admin-test' });
    if (url.endsWith(':commit')) { commit = JSON.parse(options.body); return Response.json({ writeResults: [] }); }
    return upstream(url);
  };
  try {
    const result = response();
    await handler({ method: 'POST', headers: { authorization: 'Bearer valid' }, body: { year: 2025, month: 12, confirm: true } }, result);
    assert.equal(result.code, 200);
    assert.equal(result.payload.ok, true);
    assert.equal(commit.writes.length, 32);
    assert.equal(commit.writes[1].update.fields.items.arrayValue.values.length, 0);
    assert.match(commit.writes[31].update.name, /meta\/sitegate-sync-2025-12$/);
  } finally { global.fetch = original; }
});

test('잘못된 원본 페이지는 빈 데이터로 저장하지 않는다', async () => {
  await assert.rejects(collectDailyReports({ baseUrl: 'http://example.test', mb_id: 'test', mb_password: 'test', employees: [], range,
    fetchImpl: url => url.includes('login_check') ? upstream(url) : Promise.resolve(new Response('<html>로그인</html>')) }), /페이지 구조/);
});

test('자동 수집 비밀키가 없거나 다르면 외부 요청을 차단', async () => {
  const cron = require('../api/sync/cron');
  const original = global.fetch;
  const previousSecret = process.env.CRON_SECRET;
  let calls = 0;
  global.fetch = async () => { calls++; throw new Error('호출 금지'); };
  try {
    process.env.CRON_SECRET = 'valid-secret';
    for (const authorization of [undefined, 'Bearer invalid', 'Bearer valid-secret-extra']) {
      const result = response();
      await cron({ method: 'POST', headers: { authorization } }, result);
      assert.equal(result.code, 401);
    }
    delete process.env.CRON_SECRET;
    const result = response();
    await cron({ method: 'POST', headers: { authorization: 'Bearer undefined' } }, result);
    assert.equal(result.code, 401);
    assert.equal(calls, 0);
  } finally {
    global.fetch = original;
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  }
});

test('클라우드 일정은 대상 월만 교체하며 개인 기록은 소유자에게만 적용', () => {
  const events = [];
  const window = { MockData: { schedules: { '2025-11-1': [{ title: '보존' }], '2025-12-2': [{ title: '삭제됨' }] }, attendance: { logs: [{ monthStr: '11월', dayNum: '1' }] } }, dispatchEvent: event => events.push(event) };
  const context = vm.createContext({ window, console, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } } });
  vm.runInContext(fs.readFileSync('firebase/init.js', 'utf8'), context);
  window.WncCloud.user = { email: 'owner@example.test' };
  const payload = { year: 2025, month: 12, sourceEmail: 'other@example.test', schedules: { '2025-12-1': [{ title: '새 일정' }] }, logs: [{ monthStr: '12월', dayNum: '1' }] };
  const snapshot = { forEach: fn => fn({ data: () => payload }) };
  window.WncCloud._applySitegateData(snapshot);
  assert.ok(window.MockData.schedules['2025-11-1']);
  assert.equal(window.MockData.schedules['2025-12-2'], undefined);
  assert.equal(window.MockData.attendance.logs.length, 1);
  assert.equal(events[0].detail.logs, false);
  payload.sourceEmail = 'owner@example.test';
  window.WncCloud._applySitegateData(snapshot);
  assert.equal(window.MockData.attendance.logs.length, 2);
});
