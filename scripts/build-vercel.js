const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

// 웹에서 사용하는 정적 파일만 게시한다.
const entries = ['index.html', 'pc.html', 'style.css', 'pc.css', 'script.js', 'pc.js', 'profile.png', 'data', 'firebase', 'resource', 'pc'];
const allowed = new Set(['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.woff', '.woff2']);
const tooling = new Set(['build-seed.js', 'check-firebase.js', 'verify-seed.js', 'verify-consistency.js']);
for (const entry of entries) {
  fs.cpSync(path.join(root, entry), path.join(output, entry), {
    recursive: true,
    dereference: true,
    filter: source => fs.statSync(source).isDirectory() || (allowed.has(path.extname(source).toLowerCase()) && !tooling.has(path.basename(source)))
  });
}
console.log('Vercel 정적 웹 빌드 완료: public/');
