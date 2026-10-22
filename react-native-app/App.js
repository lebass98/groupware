import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Platform, View, Text, TouchableOpacity, ActivityIndicator, BackHandler, Linking, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { checkForUpdate, CURRENT_VERSION } from './updateChecker';

export default function App() {
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [update, setUpdate] = useState(null);
  const webViewRef = useRef(null);
  const targetUri = 'https://wnc-groupware.vercel.app/';

  // 앱을 열 때마다 최신 APK가 올라왔는지 확인한다.
  // 스토어 배포가 아니라 APK 직접 배포라서 앱이 스스로 알려 주어야 한다.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;
    checkForUpdate().then((result) => {
      if (!cancelled && result.available) setUpdate(result);
    });
    return () => { cancelled = true; };
  }, []);

  // 안드로이드 하드웨어 뒤로가기 버튼 대응
  useEffect(() => {
    const handleBackButton = () => {
      // 필수 업데이트 안내가 떠 있으면 뒤로가기로 빠져나갈 수 없다.
      if (update && update.required) return true;
      if (Platform.OS === 'android' && canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // 뒤로가기 이벤트를 가로채고 앱 종료 방지
      }
      return false; // canGoBack이 false이면 기본 뒤로가기 동작(앱 종료 등) 수행
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      backHandler.remove();
    };
  }, [canGoBack, update]);

  // 웹 브라우저 환경에서는 <iframe>을 사용해 웹뷰를 대체합니다.
  if (Platform.OS === 'web') {
    return (
      <LinearGradient
        colors={['#f8f8f8', '#e8e8ec', '#d4d4e0']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <iframe
            src={targetUri}
            style={{ width: '100%', height: '100%', border: 'none', flex: 1, backgroundColor: 'transparent' }}
            title="Groupware Web View"
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleReload = () => {
    setError(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <LinearGradient
      colors={['#f8f8f8', '#e8e8ec', '#d4d4e0']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
        
        {/* 웹뷰를 항상 렌더링 상태로 유지해 세션과 현재 히스토리 URL을 잃지 않도록 합니다. */}
        <WebView
          ref={webViewRef}
          key={key}
          source={{ uri: targetUri }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          containerStyle={{ backgroundColor: 'transparent' }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="always"
          originWhitelist={['*']}
          thirdPartyCookiesEnabled={true}
          allowFileAccess={true}
          allowsInlineMediaPlayback={true}
          geolocationEnabled={true}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0346FF" />
            </View>
          )}
          onError={() => setError(true)}
          onHttpError={() => setError(true)}
        />

        {/* 에러 발생 시 웹뷰 위에 절대 위치로 에러 레이어를 오버레이합니다. */}
        {error && (
          <View style={styles.errorOverlayContainer}>
            <Text style={styles.errorTitle}>네트워크 연결 확인</Text>
            <Text style={styles.errorSub}>WnC 그룹웨어 서버에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleReload}>
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* 새 APK가 배포되었을 때의 업데이트 안내 */}
        <Modal visible={!!update} transparent animationType="fade" onRequestClose={() => { if (!update?.required) setUpdate(null); }}>
          <View style={styles.updateBackdrop}>
            <View style={styles.updateCard}>
              <Text style={styles.updateTitle}>새 버전이 있습니다</Text>
              <Text style={styles.updateVersion}>{CURRENT_VERSION} → {update?.version}</Text>
              {!!update?.releaseNotes && <Text style={styles.updateNotes}>{update.releaseNotes}</Text>}
              <Text style={styles.updateHint}>
                {update?.required
                  ? '계속 사용하려면 업데이트가 필요합니다. 내려받은 파일을 눌러 설치해 주세요.'
                  : '내려받은 파일을 눌러 설치하면 최신 기능이 적용됩니다.'}
              </Text>
              <TouchableOpacity
                style={styles.updateBtn}
                onPress={() => { if (update?.downloadUrl) Linking.openURL(update.downloadUrl); }}
              >
                <Text style={styles.updateBtnText}>업데이트 내려받기</Text>
              </TouchableOpacity>
              {!update?.required && (
                <TouchableOpacity style={styles.updateLater} onPress={() => setUpdate(null)}>
                  <Text style={styles.updateLaterText}>나중에</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  errorOverlayContainer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f8f8',
    zIndex: 999, // 웹뷰 위에 오버레이되도록 보장
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333436',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: '#5E6065',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#0346FF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  updateBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  updateCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
  },
  updateTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333436',
    marginBottom: 6,
  },
  updateVersion: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0346FF',
    marginBottom: 12,
  },
  updateNotes: {
    fontSize: 14,
    color: '#333436',
    lineHeight: 21,
    marginBottom: 12,
  },
  updateHint: {
    fontSize: 13,
    color: '#5E6065',
    lineHeight: 20,
    marginBottom: 20,
  },
  updateBtn: {
    backgroundColor: '#0346FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  updateBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  updateLater: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  updateLaterText: {
    color: '#5E6065',
    fontWeight: '600',
    fontSize: 14,
  },
});
