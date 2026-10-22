/**
 * Firestore 보안 규칙 게시 (일회성 운영 엔드포인트)
 *
 * 저장소의 firestore.rules를 그대로 읽어 Firebase Rules API로 게시한다.
 * 규칙 내용을 요청 본문으로 받지 않으므로, 호출자가 임의의 규칙을 주입할 수 없다.
 * 호출은 로그인한 임직원으로 제한한다.
 */
const fs = require('node:fs');
const path = require('node:path');
const { member } = require('../../server/sitegate-user');
const { serviceToken } = require('../../server/firebase');

const PROJECT = 'wnc-groupware';
const RULES_API = `https://firebaserules.googleapis.com/v1/projects/${PROJECT}`;
const SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST만 허용됩니다.' });

  try {
    const user = await member(req);
    if (!user) return res.status(401).json({ ok: false, message: '로그인이 필요합니다.' });

    const source = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf8');
    const token = await serviceToken(SCOPE);
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 1) 규칙 묶음(ruleset) 생성 — 문법 오류가 있으면 여기서 거부된다.
    const created = await fetch(`${RULES_API}/rulesets`, {
      method: 'POST', headers, signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ source: { files: [{ name: 'firestore.rules', content: source }] } })
    });
    if (!created.ok) {
      return res.status(502).json({ ok: false, step: 'ruleset', detail: await created.text() });
    }
    const rulesetName = (await created.json()).name;

    // 2) 생성한 묶음을 실제 서비스 릴리즈로 지정한다.
    const releaseName = `projects/${PROJECT}/releases/cloud.firestore`;
    let released = await fetch(`${RULES_API}/releases/cloud.firestore`, {
      method: 'PATCH', headers, signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ release: { name: releaseName, rulesetName } })
    });
    // 릴리즈가 아직 없는 프로젝트면 PATCH가 404가 나므로 생성으로 전환한다.
    if (released.status === 404) {
      released = await fetch(`${RULES_API}/releases`, {
        method: 'POST', headers, signal: AbortSignal.timeout(20000),
        body: JSON.stringify({ name: releaseName, rulesetName })
      });
    }
    if (!released.ok) {
      return res.status(502).json({ ok: false, step: 'release', rulesetName, detail: await released.text() });
    }

    return res.status(200).json({ ok: true, rulesetName, message: '보안 규칙을 게시했습니다.' });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
};
