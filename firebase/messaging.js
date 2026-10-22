/**
 * WnC 그룹웨어 웹 푸시 연동 레이어 (window.WncPush)
 *
 * 설계 원칙
 *  1. 기존 동작을 절대 깨뜨리지 않는다. 푸시를 지원하지 않는 환경(iOS 홈화면 미설치 Safari,
 *     http 접속, 권한 거부 등)에서는 조용히 비활성 상태로 남고 앱은 기존과 100% 동일하게 동작한다.
 *  2. 토큰은 '계정별'로 보관한다. users/{uid}/push_tokens/{token} 문서에 저장하며,
 *     로그아웃 시 해당 기기의 토큰만 지운다. 공용 PC에서 계정을 바꿔도 이전 사람에게
 *     알림이 가지 않게 하는 핵심 안전장치다.
 *  3. 권한 요청은 사용자가 설정에서 직접 켤 때만 한다. 페이지 진입 즉시 묻지 않는다.
 *     (브라우저가 자동 요청을 차단하거나 영구 거부로 처리하는 것을 피한다.)
 */
(function () {
  'use strict';

  // 켜짐/꺼짐 선택은 기기마다 다르므로 LocalStorage에 기기 단위로 보관한다.
  const PREF_KEY = 'wnc_push_enabled';

  const WncPush = {
    // unsupported | denied | off | on | error
    status: 'off',
    token: null,
    lastError: null,

    _messaging: null,
    _registration: null,
    _unsubscribeForeground: null,

    /** 이 브라우저가 웹 푸시를 지원하는지. iOS는 홈 화면에 설치된 PWA에서만 true가 된다. */
    isSupported() {
      return typeof window !== 'undefined'
        && 'Notification' in window
        && 'serviceWorker' in navigator
        && 'PushManager' in window
        && typeof firebase !== 'undefined'
        && typeof firebase.messaging === 'function';
    },

    /** 사용자가 이 기기에서 알림을 켜 두었는지. */
    isEnabled() {
      try {
        return localStorage.getItem(PREF_KEY) === 'true';
      } catch (_) {
        return false;
      }
    },

    _setEnabled(value) {
      try {
        localStorage.setItem(PREF_KEY, value ? 'true' : 'false');
      } catch (_) { }
    },

    /**
     * 앱 부팅 시 1회 호출한다.
     * 이미 켜 둔 기기에서만 조용히 토큰을 재발급받아 최신 상태로 유지한다.
     * (토큰은 브라우저 사정으로 수시로 갱신되므로 매 접속마다 확인해야 한다.)
     */
    init() {
      if (!this.isSupported()) {
        this.status = 'unsupported';
        return;
      }
      if (Notification.permission === 'denied') {
        this.status = 'denied';
        return;
      }
      this.status = this.isEnabled() ? 'on' : 'off';

      // 로그인 전에는 토큰을 저장할 곳(uid)이 없으므로, 로그인 확정 후에 등록한다.
      window.addEventListener('wnc-cloud-account-changed', () => {
        if (this.isEnabled() && Notification.permission === 'granted') {
          this.enable({ silent: true }).catch(() => { });
        }
      });
      if (window.WncCloud?.isSignedIn() && this.isEnabled() && Notification.permission === 'granted') {
        this.enable({ silent: true }).catch(() => { });
      }
    },

    /**
     * 알림을 켠다. 권한 요청 → 서비스 워커 등록 → 토큰 발급 → Firestore 저장 순으로 진행한다.
     *
     * @param {{silent?: boolean}} options silent=true면 권한 대화상자를 띄우지 않는다(자동 갱신용).
     * @returns {Promise<{ok: boolean, reason?: string, message?: string}>}
     */
    async enable(options) {
      const silent = !!(options && options.silent);

      if (!this.isSupported()) {
        this.status = 'unsupported';
        return { ok: false, reason: 'unsupported', message: this._unsupportedReason() };
      }
      if (!window.WncCloud?.isSignedIn()) {
        return { ok: false, reason: 'signed-out', message: '직원 계정으로 로그인한 뒤 알림을 켤 수 있습니다.' };
      }

      // 권한 확인. 이미 거부한 브라우저는 다시 물어볼 수 없으므로 설정 변경을 안내한다.
      let permission = Notification.permission;
      if (permission === 'default') {
        if (silent) return { ok: false, reason: 'permission-needed' };
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') {
        this.status = 'denied';
        this._setEnabled(false);
        return {
          ok: false, reason: 'denied',
          message: '브라우저가 알림을 차단하고 있습니다. 주소창의 자물쇠 아이콘에서 알림을 허용해 주세요.'
        };
      }

      try {
        const registration = await this._registerServiceWorker();
        const messaging = this._getMessaging();
        const tokenOptions = { serviceWorkerRegistration: registration };
        // VAPID 키를 지정하지 않으면 Firebase 기본 공개키를 사용한다.
        // 콘솔에서 웹 푸시 인증서를 발급해 config.js에 넣으면 그 키로 전환된다.
        const vapidKey = window.FirebaseConfig && window.FirebaseConfig.vapidKey;
        if (vapidKey) tokenOptions.vapidKey = vapidKey;

        const token = await messaging.getToken(tokenOptions);
        if (!token) throw new Error('토큰이 발급되지 않았습니다.');

        await this._saveToken(token);
        this.token = token;
        this.status = 'on';
        this._setEnabled(true);
        this._listenForeground(messaging);
        return { ok: true };
      } catch (err) {
        this.status = 'error';
        this.lastError = err;
        console.warn('[Push] 알림 등록에 실패했습니다:', err.message);
        return { ok: false, reason: 'error', message: '알림 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.' };
      }
    },

    /**
     * 알림을 끈다. 이 기기의 토큰만 삭제하므로 다른 기기의 알림은 그대로 유지된다.
     */
    async disable() {
      this._setEnabled(false);
      this.status = 'off';
      if (this._unsubscribeForeground) {
        this._unsubscribeForeground();
        this._unsubscribeForeground = null;
      }
      const token = this.token;
      this.token = null;
      if (!token || !this.isSupported()) return { ok: true };

      try {
        await this._deleteToken(token);
        await this._getMessaging().deleteToken();
      } catch (err) {
        // 서버 토큰 삭제에 실패해도 이 기기는 이미 꺼진 상태이므로 사용자에게는 성공으로 둔다.
        console.warn('[Push] 토큰 해제 중 오류:', err.message);
      }
      return { ok: true };
    },

    /** 로그아웃 직전에 호출한다. 다음 사용자에게 이전 사용자 알림이 가지 않도록 토큰을 떼어 낸다. */
    async detachForSignOut() {
      if (!this.token) return;
      try {
        await this._deleteToken(this.token);
      } catch (_) { }
      this.token = null;
    },

    _getMessaging() {
      if (!this._messaging) this._messaging = firebase.messaging();
      return this._messaging;
    },

    async _registerServiceWorker() {
      if (this._registration) return this._registration;
      // 루트 스코프로 등록해야 PC(/pc.html)와 모바일(/index.html)을 함께 담당한다.
      this._registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return this._registration;
    },

    /** 토큰을 본인 계정 문서 아래에 저장한다. 같은 기기에서 재발급되면 덮어쓴다. */
    async _saveToken(token) {
      const uid = window.WncCloud?.user?.uid;
      if (!uid) throw new Error('로그인 정보를 찾을 수 없습니다.');
      await firebase.firestore()
        .collection('users').doc(uid)
        .collection('push_tokens').doc(token)
        .set({
          token,
          platform: this._describePlatform(),
          userAgent: navigator.userAgent.slice(0, 300),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    },

    async _deleteToken(token) {
      const uid = window.WncCloud?.user?.uid;
      if (!uid) return;
      await firebase.firestore()
        .collection('users').doc(uid)
        .collection('push_tokens').doc(token)
        .delete();
    },

    /** 앱이 열려 있는 동안 도착한 메시지는 서비스 워커가 아니라 여기로 들어온다. */
    _listenForeground(messaging) {
      if (this._unsubscribeForeground) return;
      this._unsubscribeForeground = messaging.onMessage((payload) => {
        const data = payload.data || {};
        window.dispatchEvent(new CustomEvent('wnc-push-message', { detail: data }));
        // 화면에 토스트를 띄우는 책임은 앱(script.js / pc.js)에 맡긴다.
      });
    },

    _describePlatform() {
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
      if (/Android/.test(ua)) return 'android';
      if (/Macintosh/.test(ua)) return 'mac';
      if (/Windows/.test(ua)) return 'windows';
      return 'web';
    },

    /** 지원하지 않는 이유를 사용자가 이해할 수 있는 말로 돌려준다. */
    _unsupportedReason() {
      if (!('Notification' in window)) return '이 브라우저는 알림을 지원하지 않습니다.';
      if (!('serviceWorker' in navigator)) {
        return location.protocol === 'https:' || location.hostname === 'localhost'
          ? '이 브라우저는 알림을 지원하지 않습니다.'
          : 'https 주소로 접속해야 알림을 사용할 수 있습니다.';
      }
      if (!('PushManager' in window)) {
        return /iPhone|iPad|iPod/.test(navigator.userAgent)
          ? 'iPhone·iPad는 홈 화면에 앱을 추가한 뒤에 알림을 사용할 수 있습니다.'
          : '이 브라우저는 웹 푸시를 지원하지 않습니다.';
      }
      return '이 환경에서는 알림을 사용할 수 없습니다.';
    }
  };

  window.WncPush = WncPush;
  WncPush.init();
})();
