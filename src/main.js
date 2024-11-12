import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { router } from './router/index';
import App from './App.vue';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // Enable persistence plugin

createApp(App).use(pinia).use(router).mount('#app');