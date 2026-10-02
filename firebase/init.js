/**
 * WnC 그룹웨어 Firebase 연동 레이어 (window.WncCloud)
 *
 * 설계 원칙
 *  1. 기존 코드 구조를 보존한다. script.js / pc.js 는 전역 스크립트이므로 ESM이 아닌
 *     compat 빌드를 사용하여 window.firebase 전역을 동기적으로 확보한다.
 *  2. LocalStorage를 계속 로컬 캐시로 사용한다. Firestore는 그 위에 얹는 동기화 채널이다.
 *     따라서 오프라인이거나 Firebase 접속에 실패해도 앱은 기존과 100% 동일하게 동작한다.
 *  3. 원격 변경을 수신하면 LocalStorage에 반영한 뒤 storage 이벤트를 합성 발생시킨다.
 *     script.js / pc.js 에 이미 구현된 실시간 재렌더링 경로를 그대로 재사용하기 위함이다.
 *  4. LocalStorage 캐시는 항상 '한 계정의 것'이다. 캐시 소유 계정(OWNER_KEY)과 로그인 계정이
 *     다르면 즉시 폐기하고, 원격을 내려받기 전에는 절대 업로드하지 않는다(pull-before-push).
 *     이 두 가지가 계정 간 데이터 오염을 막는 핵심 안전장치다.
 */
(function () {
  'use strict';

  const KEYS = {
    state: 'wordncode_groupware_state',
    projects: 'wordncode_groupware_projects',
    notifications: 'wordncode_notifications_read_state'
  };

  // 현재 LocalStorage 캐시를 소유한 계정 UID. 계정 전환 감지의 기준값이다.
  const OWNER_KEY = 'wnc_state_owner_uid';

  const WncCloud = {
    status: 'disabled',      // disabled | ready | signed-in | error
    user: null,
    lastError: null,

    /** 마지막으로 통지한 계정 정보. 앱 초기화가 늦어도 재생(replay)할 수 있게 보관한다. */
    account: null,

    _app: null,
    _db: null,
    _auth: null,
    _unsubscribe: null,
    _pushTimer: null,
    _clientId: Math.random().toString(36).slice(2) + Date.now().toString(36),
    _lastPushed: {},
    // 원격 문서를 최소 1회 확인하기 전에는 업로드를 봉인한다.
    _hydrated: false,

    isReady() {
      return this.status === 'ready' || this.status === 'signed-in';
    },

    isSignedIn() {
      return this.status === 'signed-in';
    },

    /** 원격 상태를 한 번이라도 확인했는지(= 업로드 허용 상태인지) 여부. */
    isHydrated() {
      return this._hydrated === true;
    },

    /** SDK 로드 및 앱 초기화. 실패해도 예외를 밖으로 던지지 않는다. */
    init() {
      if (typeof firebase === 'undefined' || !window.FirebaseConfig) {
        this.status = 'disabled';
        console.info('[Firebase] SDK 또는 설정을 찾을 수 없어 로컬 전용 모드로 동작합니다.');
        return false;
      }
      try {
        this._app = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.FirebaseConfig);
        this._db = firebase.firestore();
        this._auth = firebase.auth();
        this.status = 'ready';

        this._auth.onAuthStateChanged((user) => {
          this.user = user;
          if (user) {
            this._handleSignedIn(user);
          } else {
            this.status = 'ready';
            this.account = null;
            this._hydrated = false;
            clearTimeout(this._pushTimer);
            this._unsubscribeSnapshot();
          }
          window.dispatchEvent(new CustomEvent('wnc-cloud-status', { detail: { status: this.status } }));
        });

        console.info(`[Firebase] '${window.FirebaseConfig.projectId}' 프로젝트에 연결되었습니다.`);
        return true;
      } catch (err) {
        this.status = 'error';
        this.lastError = err;
        console.warn('[Firebase] 초기화에 실패하여 로컬 전용 모드로 동작합니다:', err.message);
        return false;
      }
    },

    /**
     * 로그인 확정 시점의 계정 격리 처리.
     * 순서가 곧 안전장치다: 캐시 소유자 검증 -> 이전 계정 캐시 폐기 -> 앱 통지 -> 원격 구독.
     * 업로드는 첫 스냅샷을 받은 뒤에만 열리므로, 이전 계정 데이터가 새 계정 문서로 흘러가지 않는다.
     */
    _handleSignedIn(user) {
      this.status = 'signed-in';
      this._hydrated = false;
      this._lastPushed = {};
      clearTimeout(this._pushTimer);

      const owner = this._readOwner();
      let switched = !!owner && owner !== user.uid;
      // 소유자 표시가 없는 캐시(구버전 잔재·데모 모드 데이터)는 저장된 프로필 이메일로 주인을 판별한다.
      // 같은 사람이면 보존해 클라우드로 승계하고, 다른 사람이면 폐기한다.
      if (!owner) switched = this._isForeignCache(user.email);
      if (switched) {
        console.info('[Firebase] 다른 계정이 로그인하여 이전 계정의 로컬 캐시를 폐기합니다.');
        this._purgeLocal();
      }
      this._writeOwner(user.uid);

      console.info(`[Firebase] 로그인 상태 확인: ${user.email}`);

      this.account = { uid: user.uid, email: user.email, switched };
      // 앱이 인메모리 상태를 먼저 정리하도록 통지한 뒤 원격 구독을 시작한다.
      window.dispatchEvent(new CustomEvent('wnc-cloud-account-changed', { detail: this.account }));

      this._subscribe(user.uid);
    },

    /** 이메일/비밀번호 로그인. 결과를 항상 객체로 반환하며 예외를 던지지 않는다. */
    async signIn(email, password) {
      if (!this.isReady()) {
        return { ok: false, code: 'cloud/unavailable', message: '클라우드에 연결되어 있지 않습니다.' };
      }
      try {
        const cred = await this._auth.signInWithEmailAndPassword(email, password);
        return { ok: true, user: cred.user };
      } catch (err) {
        return { ok: false, code: err.code, message: this.describeAuthError(err.code) };
      }
    },

    /** 비밀번호 재설정 메일 발송. 계정 존재 여부는 응답으로 노출하지 않는다. */
    async sendPasswordReset(email) {
      if (!this.isReady()) {
        return { ok: false, message: '클라우드에 연결되어 있지 않아 재설정 메일을 보낼 수 없습니다.' };
      }
      if (!email) {
        return { ok: false, message: '이메일 주소를 먼저 입력해 주세요.' };
      }
      try {
        await this._auth.sendPasswordResetEmail(email);
        return { ok: true };
      } catch (err) {
        // 계정 존재 여부가 드러나지 않도록 user-not-found도 성공으로 처리한다.
        if (err.code === 'auth/user-not-found') return { ok: true };
        return { ok: false, message: this.describeAuthError(err.code) };
      }
    },

    /**
     * 로그아웃. 대기 중인 변경분을 먼저 업로드하고, 업로드가 확인된 경우에만 로컬 캐시를 비운다.
     * (오프라인 등으로 업로드에 실패하면 로컬 데이터를 보존해 유실을 막는다.)
     * OWNER_KEY는 지우지 않는다. 남겨 두어야 다음에 다른 계정이 로그인할 때 캐시 폐기가 반드시 동작한다.
     */
    async signOut() {
      if (!this.isReady() || !this.user) return;
      clearTimeout(this._pushTimer);
      const flushed = await this._pushNow();
      try {
        await this._auth.signOut();
      } catch (err) {
        console.warn('[Firebase] 로그아웃 처리 중 오류:', err.message);
      }
      if (flushed) {
        this._purgeLocal();
      } else {
        console.warn('[Firebase] 마지막 변경분 업로드에 실패하여 로컬 데이터를 보존합니다.');
      }
      this._hydrated = false;
      this.account = null;
    },

    describeAuthError(code) {
      const table = {
        'auth/invalid-email': '이메일 주소 형식이 올바르지 않습니다.',
        'auth/user-not-found': '등록되지 않은 계정입니다. 관리자에게 계정 발급을 요청하세요.',
        'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
        'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'auth/too-many-requests': '로그인 시도가 많아 일시적으로 차단되었습니다. 잠시 후 다시 시도하세요.',
        'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
        'auth/user-disabled': '비활성화된 계정입니다. 관리자에게 문의하세요.'
      };
      return table[code] || '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    },

    /** 현재 LocalStorage 스냅샷을 Firestore 사용자 문서로 업로드(디바운스). */
    pushState() {
      if (!this.isSignedIn()) return;
      clearTimeout(this._pushTimer);
      const delay = (window.FirebaseOptions && window.FirebaseOptions.syncDebounceMs) || 400;
      this._pushTimer = setTimeout(() => this._pushNow(), delay);
    },

    /** @returns {Promise<boolean>} 원격이 최신 상태임이 보장되면 true. */
    async _pushNow() {
      if (!this.isSignedIn()) return false;
      // 원격을 아직 확인하지 않았다면 업로드하지 않는다.
      // 이 시점의 LocalStorage는 이전 계정의 잔재이거나 원격보다 오래된 값일 수 있다.
      if (!this._hydrated) return false;
      try {
        const payload = {
          state: localStorage.getItem(KEYS.state) || '',
          projects: localStorage.getItem(KEYS.projects) || '',
          notifications: localStorage.getItem(KEYS.notifications) || '',
          clientId: this._clientId,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        // 변경이 없으면 쓰기를 생략하여 무료 할당량을 아낀다.
        const unchanged = ['state', 'projects', 'notifications']
          .every((k) => this._lastPushed[k] === payload[k]);
        if (unchanged) return true;

        await this._db.collection('users').doc(this.user.uid).set(payload, { merge: true });
        this._lastPushed = { state: payload.state, projects: payload.projects, notifications: payload.notifications };
        return true;
      } catch (err) {
        console.warn('[Firebase] 상태 업로드 실패(로컬 저장은 정상):', err.message);
        return false;
      }
    },

    _subscribe(uid) {
      this._unsubscribeSnapshot();
      try {
        this._unsubscribe = this._db.collection('users').doc(uid)
          .onSnapshot((snap) => {
            if (!snap.exists) {
              // 원격 문서가 없는 신규 계정: 정리된 현재 로컬 상태를 최초 1회 시드로 올린다.
              this._markHydrated();
              return;
            }
            const data = snap.data() || {};
            // 자기 자신이 방금 올린 쓰기의 메아리는 무시한다.
            if (data.clientId === this._clientId) {
              this._markHydrated();
              return;
            }
            this._applyRemote(KEYS.state, data.state);
            this._applyRemote(KEYS.projects, data.projects);
            this._applyRemote(KEYS.notifications, data.notifications);
            this._markHydrated();
          }, (err) => {
            console.warn('[Firebase] 실시간 구독 오류:', err.message);
            // 구독이 실패해도 로컬 변경분이 영구히 갇히지 않도록 업로드는 열어 준다.
            // 계정 전환 시 캐시는 이미 폐기되었으므로 다른 계정 데이터가 올라갈 위험은 없다.
            this._markHydrated();
          });
      } catch (err) {
        console.warn('[Firebase] 실시간 구독을 시작하지 못했습니다:', err.message);
        this._markHydrated();
      }
    },

    _unsubscribeSnapshot() {
      if (this._unsubscribe) {
        this._unsubscribe();
        this._unsubscribe = null;
      }
    },

    /** 원격 확인 완료를 선언하고 업로드를 개방한다(최초 1회만 통지). */
    _markHydrated() {
      if (this._hydrated) return;
      this._hydrated = true;
      window.dispatchEvent(new CustomEvent('wnc-cloud-hydrated', {
        detail: { uid: this.user ? this.user.uid : null }
      }));
      // 봉인 구간에서 발생했던 로컬 변경분을 이제 안전하게 올린다.
      this.pushState();
    },

    /** 소유자 표시가 없는 캐시가 다른 사람의 것인지 저장된 프로필 이메일로 판별한다. */
    _isForeignCache(email) {
      try {
        const raw = localStorage.getItem(KEYS.state);
        if (!raw || !email) return false;
        const cached = JSON.parse(raw);
        const cachedEmail = cached && cached.user && cached.user.email;
        if (!cachedEmail) return false;
        return String(cachedEmail).trim().toLowerCase() !== String(email).trim().toLowerCase();
      } catch (_) {
        return false;
      }
    },

    _readOwner() {
      try {
        return localStorage.getItem(OWNER_KEY);
      } catch (_) {
        return null;
      }
    },

    _writeOwner(uid) {
      try {
        localStorage.setItem(OWNER_KEY, uid);
      } catch (_) { }
    },

    /** 계정 종속 로컬 캐시 3종을 폐기한다. */
    _purgeLocal() {
      try {
        Object.keys(KEYS).forEach((k) => localStorage.removeItem(KEYS[k]));
      } catch (err) {
        console.warn('[Firebase] 로컬 캐시 폐기 실패:', err.message);
      }
      this._lastPushed = {};
    },

    /**
     * 원격 값을 LocalStorage에 반영하고 storage 이벤트를 합성 발생시킨다.
     * 같은 탭에서는 브라우저가 storage 이벤트를 발생시키지 않으므로 직접 만들어 준다.
     */
    _applyRemote(key, value) {
      if (typeof value !== 'string' || !value) return;
      const current = localStorage.getItem(key);
      if (current === value) return;
      try {
        localStorage.setItem(key, value);
        this._lastPushed[Object.keys(KEYS).find((k) => KEYS[k] === key)] = value;
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: value,
          oldValue: current,
          storageArea: localStorage,
          url: location.href
        }));
        console.info(`[Firebase] 다른 기기의 변경사항을 반영했습니다: ${key}`);
      } catch (err) {
        console.warn('[Firebase] 원격 변경 반영 실패:', err.message);
      }
    }
  };

  window.WncCloud = WncCloud;
  WncCloud.init();
})();
