/**
 * 알림 발송 / 테스트 엔드포인트
 *
 * POST /api/notify
 *   { title, body?, link?, tag? }                 → 본인 기기로 발송(알림 설정 확인용)
 *   { to: "<이메일>", title, body?, link?, tag? } → 지정한 임직원에게 발송
 *
 * 로그인한 임직원만 호출할 수 있다(members 명부 검증 포함).
 * 외부에서 임의로 전사 알림을 뿌릴 수 없도록 수신자는 한 번에 한 명으로 제한한다.
 */
const { member, serviceToken, DOCUMENTS } = require('../server/sitegate-user');
const { sendToUser } = require('../server/push');

const PROJECT = 'wnc-groupware';
const IDENTITY_SCOPE = 'https://www.googleapis.com/auth/identitytoolkit';

/** 받는 사람이 임직원 명부에 등록되어 있는지 확인한다(외부 주소로의 발송 차단). */
async function isMember(email, token) {
  const response = await fetch(`${DOCUMENTS}/members/${encodeURIComponent(email.toLowerCase())}`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000)
  });
  return response.ok;
}

/** 이메일로 상대방의 Firebase UID를 찾는다(서비스 계정 권한의 Authentication 조회). */
async function uidOf(email) {
  const token = await serviceToken(IDENTITY_SCOPE);
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:lookup`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: [email.toLowerCase()] }),
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) return null;
  const users = (await response.json()).users || [];
  return users.length ? users[0].localId : null;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST만 허용됩니다.' });

  try {
    const user = await member(req);
    if (!user) return res.status(401).json({ ok: false, message: '로그인이 필요합니다.' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const title = String(body.title || '').trim();
    if (!title) return res.status(400).json({ ok: false, message: '알림 제목이 필요합니다.' });

    // 수신자 결정: to가 없으면 본인에게 보낸다.
    let targetUid = user.localId;
    if (body.to) {
      const recipient = String(body.to).trim();
      const token = await serviceToken();
      if (!await isMember(recipient, token)) {
        return res.status(403).json({ ok: false, message: '임직원 명부에 없는 주소로는 보낼 수 없습니다.' });
      }
      targetUid = await uidOf(recipient);
      if (!targetUid) {
        return res.status(404).json({ ok: false, message: '받는 사람의 계정을 찾을 수 없습니다.' });
      }
    }

    const result = await sendToUser(targetUid, {
      title,
      body: body.body,
      link: body.link,
      tag: body.tag
    });

    if (!result.sent) {
      return res.status(200).json({
        ok: false, ...result,
        message: '알림을 받을 기기가 없습니다. 설정에서 알림을 먼저 켜 주세요.'
      });
    }
    return res.status(200).json({ ok: true, ...result, message: `${result.sent}개 기기로 알림을 보냈습니다.` });
  } catch (error) {
    console.error('[notify] 발송 실패:', error.message);
    return res.status(500).json({ ok: false, message: '알림 발송 중 오류가 발생했습니다.' });
  }
};
