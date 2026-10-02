---
name: groupware-react-native-apk
description: >-
  WnC 그룹웨어의 React Native (Expo 54, RN 0.81) 모바일 앱 아키텍처,
  WebView 세션 및 안드로이드 하드웨어 뒤로가기 제어, JDK 17 및 Android Gradle 8.x
  환경에서의 릴리즈 APK 빌드(assembleRelease) 및 배포 패키징 가이드입니다.
---

# WnC 그룹웨어 React Native & Android APK 빌드 가이드

## 1. 앱 아키텍처 및 기술 스택

- **프레임워크**: React Native `0.81.5`, Expo SDK `54.0.0`
- **웹뷰 코어**: `react-native-webview` (13.15.0)
- **그라데이션**: `expo-linear-gradient` (57.0.1)
- **엔진**: Hermes JavaScript Engine (AOT 바이트코드 최적화)
- **패키지명**: `com.wordncode.groupware`
- **빌드 시스템**: Android Gradle Plugin 8.x, Gradle 8.14.3, OpenJDK 17

---

## 2. 네이티브 웹뷰 연동 핵심 코드 (`App.js`)

### 안드로이드 물리 뒤로가기 제어
웹뷰 내부 탐색 히스토리가 있을 때는 앱이 종료되지 않고 웹뷰 이전 페이지로 돌아가며, 첫 페이지일 때만 앱 종료 동작을 수행합니다.

```javascript
useEffect(() => {
  const handleBackButton = () => {
    if (Platform.OS === 'android' && canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true; // 이벤트 가로채기
    }
    return false; // 기본 동작
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  return () => backHandler.remove();
}, [canGoBack]);
```

### 웹뷰 세션 및 권한 설정
```jsx
<WebView
  ref={webViewRef}
  source={{ uri: 'https://lebass98.github.io/groupware/' }}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  startInLoadingState={true}
  scalesPageToFit={true}
  mixedContentMode="always"
  originWhitelist={['*']}
  thirdPartyCookiesEnabled={true}
  allowFileAccess={true}
  geolocationEnabled={true}
  onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
/>
```

---

## 3. APK 빌드 전 사전 점검 절차 (Pre-Build Verification)

1. **JS 번들링 유효성 검사**:
   ```bash
   cd react-native-app
   npx expo export --platform android --output-dir /tmp/test-export
   ```
2. **Java / JDK 버전 확인 (JDK 17 필수)**:
   ```bash
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17
   $JAVA_HOME/bin/java -version
   ```
3. **Android SDK 환경 변수 확인**:
   ```bash
   export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
   export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
   ```

---

## 4. 릴리즈 APK 생성 명령어 (Release APK Build)

```bash
cd react-native-app/android
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH

./gradlew assembleRelease
```

### 생성 결과물 위치
- 원본 APK: `react-native-app/android/app/build/outputs/apk/release/app-release.apk`
- 배포용 복사본: `WnC_Groupware_v1.0.0.apk` (루트 디렉터리)
- 파일 크기: 약 **55 MB**
