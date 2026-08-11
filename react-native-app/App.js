import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Platform, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f5ff" />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>네트워크 연결 확인</Text>
          <Text style={styles.errorSub}>그룹웨어 서버에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setError(false); setKey(k => k + 1); }}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={key}
          source={{ uri: 'https://lebass98.github.io/groupware/' }}
          style={{ flex: 1 }}
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
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0052D0" />
            </View>
          )}
          onError={() => setError(true)}
          onHttpError={() => setError(true)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f5ff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f7f5ff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#232C51',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: '#515981',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#0052D0',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
