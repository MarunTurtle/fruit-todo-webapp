<script setup>
// Vue, Pinia, Ref 가져오기
import { ref } from "vue";
import { useTodoStore } from "../stores/todoStore";

// Props 정의 (버튼 활성화 여부)
const props = defineProps({
  addButtonDisabled: Boolean, // Add 버튼 비활성화 여부
});

// Pinia Store 연결 및 변수 초기화
const todoStore = useTodoStore();
const task = ref(""); // 입력된 Task
const importance = ref("general"); // 중요도 기본값

// Task 추가 함수
const addTask = () => {
  if (task.value.trim()) {
    todoStore.addTask(task.value, importance.value); // Store에 Task 추가
    task.value = ""; // 입력 필드 초기화
    importance.value = "general"; // 중요도 초기화
  }
};
</script>


<template>
  <div class="todo-input">
    <!-- 입력 그룹 -->
    <div class="input-group mb-4">
      <!-- Task 입력 -->
      <input
        v-model="task"
        type="text"
        class="form-control"
        placeholder="Add your task"
        :disabled="addButtonDisabled" 
      />

      <!-- 중요도 선택 -->
      <select v-model="importance" class="form-select" :disabled="addButtonDisabled">
        <option value="very important">Very Important</option>
        <option value="important">Important</option>
        <option value="general">General</option>
        <option value="none">None</option>
      </select>

      <!-- 추가 버튼 -->
      <button
        @click="addTask"
        class="btn btn-success"
        :disabled="addButtonDisabled" 
      >
        +
      </button>
    </div>
  </div>
</template>


<style scoped>
/* Todo 입력 컴포넌트 스타일 */
.todo-input {
  margin-bottom: 20px; /* 아래 여백 */
}
</style>
