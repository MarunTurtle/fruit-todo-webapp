// Pinia 스토어 정의
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTodoStore = defineStore("todoStore", {
  state: () => ({
    todos: [], // Todo 목록
    idCounter: 0, // Todo의 고유 ID를 생성하는 카운터
    addButtonDisabled: false, // Add 버튼 활성화/비활성화 상태
  }),
  actions: {
    // Add 버튼 비활성화 상태 설정
    setAddButtonDisabled(state) {
      this.addButtonDisabled = state;
    },

    // 새로운 Todo 추가
    addTask(task, importance) {
      this.todos.push({
        id: this.idCounter++, // 고유 ID 생성
        text: task, // Todo 내용
        completed: false, // 초기 완료 상태
        importance, // 중요도
      });
    },

    // Todo 삭제
    deleteTask(id) {
      this.todos = this.todos.filter((todo) => todo.id !== id); // 해당 ID의 Todo 제거
    },

    // Todo 완료 상태 토글
    toggleComplete(id) {
      this.todos = this.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo // 완료 상태 반전
      );
    },

    // Todo 텍스트 및 중요도 업데이트
    updateTask(id, newText, newImportance) {
      this.todos = this.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              text: newText || todo.text, // 새로운 텍스트가 없으면 기존 텍스트 유지
              importance: newImportance || todo.importance, // 새로운 중요도가 없으면 기존 중요도 유지
            }
          : todo
      );
    },

    // 완료되지 않은 Todo 제거
    clearTodos() {
      this.todos = this.todos.filter((todo) => todo.completed); // 완료된 Todo만 유지
    },
  },
  persist: {
    enabled: true, // 데이터 영속성 활성화
    strategies: [
      {
        key: "todo-list", // 로컬 스토리지에 저장할 키
        storage: localStorage, // 로컬 스토리지 사용
      },
    ],
  },
});
