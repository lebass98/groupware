/**
 * WnC 그룹웨어 웹 푸시 서비스 워커 (Firebase Cloud Messaging)
 *
 * 이 파일은 반드시 사이트 루트(/firebase-messaging-sw.js)에 있어야 한다.
 * 서비스 워커의 제어 범위는 자신이 놓인 경로 이하로 제한되므로,
 * 하위 폴더에 두면 PC(/pc.html)와 모바일(/index.html)을 동시에 담당할 수 없다.
 *
 * 역할은 하나다: 앱이 닫혀 있거나 백그라운드일 때 도착한 메시지를 알림으로 띄운다.
 * (앱이 열려 있을 때의 수신 처리는 firebase/messaging.js가 담당한다.)
 */
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 서비스 워커는 window를 쓸 수 없어 config.js를 그대로 불러올 수 없다.
// 값이 바뀌면 firebase/config.js와 함께 수정해야 한다.
firebase.initializeApp({
  apiKey: "AIzaSyDlJlejygCf0BAzyiXtWApjZB3pq_zC1cY",
  authDomain: "wnc-groupware.firebaseapp.com",
  projectId: "wnc-groupware",
  storageBucket: "wnc-groupware.firebasestorage.app",
  messagingSenderId: "1088182727206",
  appId: "1:1088182727206:web:4d107f8d62f8ad561eece7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || '새 알림';
  self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/resource/brand/favicon-192.png',
    badge: '/resource/brand/favicon-48.png',
    tag: data.tag || 'wnc-groupware',
    data: { link: data.link || '/' },
    // 같은 tag의 기존 알림을 조용히 교체하지 않고 다시 알린다.
    renotify: !!data.tag
  });
});

// 알림을 누르면 이미 열려 있는 탭을 앞으로 가져오고, 없을 때만 새로 연다.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      if ('focus' in client) {
        if ('navigate' in client && link !== '/') await client.navigate(link).catch(() => {});
        return client.focus();
      }
    }
    return self.clients.openWindow(link);
  })());
});
