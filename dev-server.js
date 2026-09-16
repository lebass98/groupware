#!/usr/bin/env node
/**
 * 의존성 없는 라이브 리로드 개발 서버.
 *   node dev-server.js [포트]
 * HTML 응답에 SSE 클라이언트를 주입하므로 소스 파일은 수정하지 않는다.
 * CSS 변경은 새로고침 없이 스타일시트만 교체한다.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const ROOT = __dirname;

// 인자 파싱 (포트, --open 여부)
let PORT = 8089;
let shouldOpen = false;

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--open' || arg === '-o') {
    shouldOpen = true;
  } else if (arg.startsWith('--port=')) {
    PORT = Number(arg.split('=')[1]) || 8089;
  } else if (!isNaN(Number(arg))) {
    PORT = Number(arg);
  }
}

const IGNORED = /(^|[\\/])(\.git|node_modules|\.expo|\.claude|\.agents|dist|build)([\\/]|$)/;
const WATCH_EXT = /\.(html|css|js|json|png|jpe?g|gif|svg|webp)$/i;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

const CLIENT = `
<script>
(function () {
  var es = new EventSource('/__livereload');
  var badge;
  function flash(text, color) {
    if (!badge) {
      badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;z-index:2147483647;left:12px;bottom:12px;padding:6px 12px;' +
        'border-radius:999px;font:600 12px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;' +
        'color:#fff;pointer-events:none;opacity:0;transition:opacity .2s;';
      document.body.appendChild(badge);
    }
    badge.textContent = text;
    badge.style.background = color;
    badge.style.opacity = '1';
    setTimeout(function () { badge.style.opacity = '0'; }, 1200);
  }
  function reloadCss() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.href.split('?')[0];
      link.href = href + '?livereload=' + Date.now();
    }
    flash('CSS 갱신', '#2563eb');
  }
  es.addEventListener('reload', function (e) {
    if (e.data === 'css') reloadCss();
    else location.reload();
  });
  es.addEventListener('open', function () { flash('라이브 리로드 연결됨', '#16a34a'); });
  es.onerror = function () { /* EventSource가 자동 재연결한다 */ };
})();
</script>
`;

const clients = new Set();

function broadcast(kind) {
  for (const res of clients) {
    res.write(`event: reload\ndata: ${kind}\n\n`);
  }
}

let timer = null;
let pendingCssOnly = true;
function scheduleReload(file) {
  if (!file.endsWith('.css')) pendingCssOnly = false;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const kind = pendingCssOnly ? 'css' : 'full';
    console.log(`[변경] ${file} → ${kind === 'css' ? 'CSS 교체' : '전체 새로고침'} (연결 ${clients.size}개)`);
    broadcast(kind);
    pendingCssOnly = true;
  }, 120);
}

try {
  fs.watch(ROOT, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    if (IGNORED.test(filename) || !WATCH_EXT.test(filename)) return;
    scheduleReload(filename);
  });
} catch (err) {
  console.error('파일 감시를 시작하지 못했습니다:', err.message);
}

function send(res, status, headers, body) {
  res.writeHead(status, Object.assign({ 'Cache-Control': 'no-store' }, headers));
  res.end(body);
}

function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
    });
    res.write('retry: 1000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // --- sitegate 출퇴근 중계 API ---------------------------------------------
  // 브라우저는 sitegate(HTTP 전용, CORS 없음)를 직접 호출할 수 없다.
  // 이 서버가 대신 로그인해 요청을 보낸다. 자격 증명은 .env에만 있다.
  //
  // GET  /api/attendance          오늘 상태 조회 (등록하지 않음)
  // POST /api/attendance          { mode: 'in' | 'out', confirm: true } 로 실제 등록
  //
  // 주의: 이 개발 서버는 같은 네트워크에 열려 있다. 실제 근태를 기록하는
  //       엔드포인트이므로 신뢰할 수 없는 네트워크에서는 서버를 띄우지 않는다.
  if (url.pathname === '/api/attendance') {
    const json = (code, payload) => send(res, code,
      { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      JSON.stringify(payload));

    let sitegate;
    try {
      sitegate = require('./scripts/sitegate-attendance.js');
    } catch (err) {
      return json(500, { ok: false, message: `중계 모듈을 불러오지 못했습니다: ${err.message}` });
    }

    if (req.method === 'GET') {
      sitegate.getStatus()
        .then((r) => json(200, r))
        .catch((err) => json(502, { ok: false, message: err.message }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (c) => {
        body += c;
        if (body.length > 10000) req.destroy(); // 과도한 요청 방지
      });
      req.on('end', () => {
        let payload;
        try {
          payload = JSON.parse(body || '{}');
        } catch {
          return json(400, { ok: false, message: '잘못된 JSON 요청입니다.' });
        }
        // confirm 플래그를 요구해 링크 클릭이나 크롤러가 실수로 등록하지 못하게 한다.
        if (payload.confirm !== true) {
          return json(400, { ok: false, message: 'confirm: true 가 필요합니다.' });
        }
        console.log(`[근태] sitegate ${payload.mode === 'in' ? '출근' : '퇴근'} 등록 요청`);
        sitegate.registerAttendance(payload.mode)
          .then((r) => {
            console.log(`[근태] ${r.ok ? '성공' : '거절'}: ${r.message}`);
            json(r.ok ? 200 : 409, r);
          })
          .catch((err) => {
            console.log(`[근태] 오류: ${err.message}`);
            json(502, { ok: false, message: err.message });
          });
      });
      return;
    }

    return json(405, { ok: false, message: 'GET 또는 POST만 지원합니다.' });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, '잘못된 경로');
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = path.join(ROOT, pathname);
  // 루트 밖으로 나가는 경로는 거부한다. 심볼릭 링크는 realpath 비교 없이 허용한다(pc/ 하위가 링크).
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    return send(res, 403, { 'Content-Type': 'text/plain; charset=utf-8' }, '접근 거부');
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      console.log(`[404] ${pathname}`);
      return send(res, 404, { 'Content-Type': 'text/html; charset=utf-8' },
        `<meta charset="utf-8"><h1>404</h1><p>${pathname} 파일이 없습니다.</p>${CLIENT}`);
    }
    if (stat.isDirectory()) {
      res.writeHead(302, { Location: pathname.replace(/\/?$/, '/') });
      return res.end();
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';

    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (readErr, html) => {
        if (readErr) return send(res, 500, { 'Content-Type': 'text/plain; charset=utf-8' }, '읽기 실패');
        const injected = html.includes('</body>')
          ? html.replace(/<\/body>/i, `${CLIENT}</body>`)
          : html + CLIENT;
        send(res, 200, { 'Content-Type': type }, injected);
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Cache-Control': 'no-store' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`포트 ${PORT}가 이미 사용 중입니다. 'lsof -ti:${PORT} | xargs kill' 후 다시 실행하세요.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '0.0.0.0', () => {
  const netIp = getNetworkIp();
  console.log(`\n🚀 WnC 그룹웨어 라이브 리로드(자동 새로고침) 개발 서버 실행 완료\n`);
  console.log(`  📱 모바일 메인:   http://localhost:${PORT}/index.html`);
  console.log(`  💻 PC 대시보드:   http://localhost:${PORT}/pc.html`);
  if (netIp) {
    console.log(`  🌐 네트워크(모바일기기): http://${netIp}:${PORT}/index.html`);
  }
  console.log(`  📁 감시 디렉토리: ${ROOT}\n`);

  if (shouldOpen) {
    const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${startCmd} http://localhost:${PORT}/pc.html`);
  }
});
