// Vue Router 설정
import { createRouter, createWebHistory } from 'vue-router';
import TodoListView from '../views/TodoListView.vue';

// 라우트 정의
const routes = [
  { path: '/', component: TodoListView }, // 기본 경로 - TodoListView 컴포넌트 연결
];

// 라우터 생성 및 내보내기
export const router = createRouter({
  history: createWebHistory(), // 브라우저 히스토리 모드 사용
  routes, // 설정된 라우트 사용
});
