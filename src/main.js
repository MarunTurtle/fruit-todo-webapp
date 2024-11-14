import { createApp } from 'vue'; // Vue 앱 생성
import { createPinia } from 'pinia'; // Pinia 상태 관리 라이브러리
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'; // Pinia 상태 영속화 플러그인
import { router } from './router/index'; // 라우터 설정 파일
import App from './App.vue'; // 메인 App 컴포넌트

// Pinia 인스턴스 생성
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // Pinia 영속화 플러그인 활성화

// Vue 앱 초기화 및 플러그인 등록
createApp(App).use(pinia).use(router).mount('#app'); // 앱을 #app에 마운트
