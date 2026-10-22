/**
 * WnC 그룹웨어 Firebase 프로젝트 설정
 *
 * apiKey는 비밀키가 아니라 프로젝트 식별자이므로 공개 저장소에 포함되어도 무방합니다.
 * 실제 데이터 접근 통제는 firestore.rules(보안 규칙)와 Firebase Authentication이 담당합니다.
 */
window.FirebaseConfig = {
  apiKey: "AIzaSyDlJlejygCf0BAzyiXtWApjZB3pq_zC1cY",
  authDomain: "wnc-groupware.firebaseapp.com",
  projectId: "wnc-groupware",
  storageBucket: "wnc-groupware.firebasestorage.app",
  messagingSenderId: "1088182727206",
  appId: "1:1088182727206:web:4d107f8d62f8ad561eece7",
  measurementId: "G-8XV6Z7FZ5J",

  /**
   * 웹 푸시 인증서(VAPID) 공개키.
   *
   * 비워 두면 Firebase 기본 공개키로 토큰을 발급하므로 알림은 그대로 동작한다.
   * 전용 키를 쓰려면 Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징 >
   * '웹 푸시 인증서'에서 키 쌍을 생성해 여기에 붙여 넣는다.
   * 키를 바꾸면 기존에 발급된 토큰은 무효가 되어 각 기기에서 알림을 다시 켜야 한다.
   */
  vapidKey: ""
};

/**
 * 연동 동작 옵션
 *
 * requireAuth
 *   false : Firebase 로그인에 실패해도 기존 데모 로그인으로 진입합니다(클라우드 동기화는 비활성).
 *           Firebase 콘솔에 계정을 아직 등록하지 않은 초기 도입 단계의 기본값입니다.
 *   true  : Firebase에 등록된 계정만 로그인할 수 있습니다.
 *           Authentication에 임직원 계정 등록을 마친 뒤 true로 변경하십시오.
 */
window.FirebaseOptions = {
  requireAuth: true,
  syncDebounceMs: 400
};
