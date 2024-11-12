import { createRouter, createWebHistory } from 'vue-router';
import TodoListView from '../views/TodoListView.vue';

const routes = [{ path: '/', component: TodoListView }];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});