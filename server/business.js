const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { gzipSync } = require('node:zlib');
const { randomUUID } = require('node:crypto');
const { DOCUMENTS } = require('./sitegate-user');
const KINDS = ['projects', 'sites', 'team-schedules', 'leaves', 'equipment', 'expenses', 'issues', 'contracts', 'planning-estimates', 'worklog-index', 'all-business'];

// 기존 파서를 사용하되 파일 수정은 요청별 메모리에만 저장합니다.
// 수집 완료 후 변경된 업무 데이터만 Firestore에 게시합니다.
async function collect(kind) {
  if (!KINDS.includes(kind)) throw new Error('지원하지 않는 수집 종류');
  const root = path.resolve(__dirname, '..');
  const script = path.join(root, 'scripts', `sync-${kind}.js`);
  let source = fs.readFileSync(script, 'utf8');
  const footer = kind === 'all-business' ? source.indexOf('// --mockdata-only') : source.lastIndexOf('\nmain().catch');
  if (footer < 0) throw new Error('수집기 진입점 확인 실패');
  source = source.slice(0, footer).replace(/^#![^\n]*\n/, '') + '\nmodule.exports = main;';
  const files = new Map();
  const environment = ['SITEGATE_URL', 'SITEGATE_ID', 'SITEGATE_PW'].map(key => `${key}=${process.env[key] || ''}`).join('\n');
  const memoryFs = {
    ...fs,
    existsSync(file) { return path.basename(file) === '.env' ? true : files.has(file) || fs.existsSync(file); },
    readFileSync(file, encoding) {
      if (path.basename(file) === '.env') return encoding ? environment : Buffer.from(environment);
      return files.has(file) ? (encoding ? files.get(file) : Buffer.from(files.get(file))) : fs.readFileSync(file, encoding);
    },
    writeFileSync(file, data) { files.set(file, String(data)); },
    mkdirSync() {}
  };
  const realRequire = createRequire(script);
  const silent = { log() {}, info() {}, warn() {}, error() {} };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 240000);
  let failed = false;
  const context = vm.createContext({
    __dirname: path.dirname(script), module: { exports: {} }, console: silent,
    process: { env: process.env, argv: ['node', script], exit() { throw new Error('수집기 종료'); } },
    require(name) { return name === 'fs' ? memoryFs : name === 'child_process' ? { execSync() {} } : realRequire(name); },
    Buffer, TextDecoder, URLSearchParams, setTimeout, clearTimeout,
    fetch: async (url, options = {}) => {
      try {
        const response = await fetch(url, { ...options, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) });
        if (!response.ok && !(options.redirect === 'manual' && response.status >= 300 && response.status < 400)) throw new Error('원본 HTTP 오류');
        return response;
      } catch (error) { failed = true; throw error; }
    }
  });
  try {
    vm.runInContext(source, context, { filename: script });
    await context.module.exports();
    if (failed) throw new Error('일부 원본 수집 실패로 게시하지 않습니다.');
    const mockPath = path.join(root, 'data', 'mockData.js');
    const readMock = text => { const c = vm.createContext({ window: {}, console: silent }); vm.runInContext(text, c); return c.window.MockData; };
    const before = readMock(fs.readFileSync(mockPath, 'utf8'));
    const after = readMock(files.get(mockPath) || fs.readFileSync(mockPath, 'utf8'));
    const changes = {};
    for (const [key, value] of Object.entries(after)) {
      if (key === 'extendedData') {
        for (const [field, data] of Object.entries(value)) {
          if (kind === 'all-business' && ['expenses', 'equipment', 'contracts', 'estimates', 'issues'].includes(field)) continue;
          if (JSON.stringify(data) !== JSON.stringify(before.extendedData?.[field])) (changes.extendedData ||= {})[field] = data;
        }
      } else if (JSON.stringify(value) !== JSON.stringify(before[key])) changes[key] = value;
    }
    if (kind === 'worklog-index') {
      const output = [...files.entries()].find(([file]) => file.endsWith('worklog_index.json'));
      if (output) changes.worklogIndex = JSON.parse(output[1]);
    }
    return changes;
  } finally { clearTimeout(timer); }
}

async function save(kind, changes, token) {
  const version = randomUUID();
  const compressed = gzipSync(Buffer.from(JSON.stringify(changes))).toString('base64');
  const chunks = compressed.match(/.{1,600000}/g) || [''];
  const writes = chunks.map((content, i) => ({ update: {
    name: `projects/wnc-groupware/databases/(default)/documents/business_snapshots/${kind}/chunks/${i}`,
    fields: { version: { stringValue: version }, content: { stringValue: content } }
  } }));
  writes.push({ update: { name: `projects/wnc-groupware/databases/(default)/documents/meta/business-${kind}`, fields: {
    source: { stringValue: 'business' }, kind: { stringValue: kind }, version: { stringValue: version },
    chunks: { integerValue: String(chunks.length) }, updatedAt: { timestampValue: new Date().toISOString() }
  } } });
  const response = await fetch(`${DOCUMENTS}:commit`, { method: 'POST', signal: AbortSignal.timeout(20000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ writes }) });
  if (!response.ok) throw new Error('업무 데이터 저장 실패');
  return { ok: true, kind, fields: Object.keys(changes), chunks: chunks.length };
}
module.exports = { collect, save, KINDS };
