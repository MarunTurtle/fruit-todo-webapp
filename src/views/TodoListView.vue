<script setup>
// Import Vue 기능과 필요한 컴포넌트
import { ref, computed } from "vue";
import { useTodoStore } from "../stores/todoStore";
import TodoInput from "../components/TodoInput.vue";
import TodoItem from "../components/TodoItem.vue";
import Fruit from "../components/Fruit.vue";

// 스토어 연결
const todoStore = useTodoStore();

// 상태 변수 정의
const filter = ref("todo"); // 필터링 기준 (할 일, 완료, 모두)
const sortOrder = ref("asc"); // 정렬 순서 (오름차순)
const addButtonDisabled = ref(false); // Add 버튼 활성화 상태
const showWarning = ref(false); // 경고 메시지 표시 여부

// 중요도 매핑 (정렬에 사용)
const importanceMap = {
  none: 0,
  general: 1,
  important: 2,
  "very important": 3,
};

// Add 버튼 상태 업데이트 함수
const setAddButtonDisabled = (disabled) => {
  addButtonDisabled.value = disabled; // 버튼 상태 업데이트
  showWarning.value = disabled; // 경고 메시지 표시 여부 동기화
};

// 필터링 및 정렬된 Todo 목록 계산 (컴퓨티드)
const filteredAndSortedTodos = computed(() => {
  let filtered = todoStore.todos;

  // 필터링 적용
  if (filter.value === "completed") {
    filtered = todoStore.todos.filter((todo) => todo.completed);
  } else if (filter.value === "todo") {
    filtered = todoStore.todos.filter((todo) => !todo.completed);
  }

  // 중요도 기준으로 정렬
  return filtered.sort((a, b) => {
    const aValue = importanceMap[a.importance];
    const bValue = importanceMap[b.importance];
    return sortOrder.value === "asc" ? aValue - bValue : bValue - aValue;
  });
});

// 필터 기준 설정 함수
const setFilter = (newFilter) => {
  filter.value = newFilter;
};

// 정렬 순서 토글 함수
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

// 완료되지 않은 Todo 모두 삭제
const clearAllTodos = () => {
  if (window.confirm("Are you sure you want to clear all uncompleted todos?")) {
    todoStore.clearTodos();
  }
};
</script>

<template>
  <div class="container mt-5">
    <!-- 전체 컨테이너 -->
    <div class="row align-items-start justify-content-center">
      <!-- 오른쪽/상단: Fruit 컨테이너 -->
      <div class="col-xl-6 col-12">
        <Fruit :update-add-button-disabled="setAddButtonDisabled" />
      </div>
      <!-- 왼쪽: Todo 리스트 -->
      <div class="col-xl-6 col-12 mb-4 mb-xl-0">
        <TodoInput :add-button-disabled="addButtonDisabled" />

        <!-- 경고 메시지 -->
        <p v-if="showWarning" class="text-danger text-center mt-3">
          Finish your existing tasks before adding new ones to maintain focus!
        </p>
        
        <!-- 필터 및 정렬 버튼 -->
        <div class="d-flex justify-content-between align-items-center my-4">
          <div class="btn-group">
            <button
              @click="setFilter('todo')"
              :class="['btn', filter === 'todo' ? 'btn-primary' : 'btn-outline-primary']">
              To-Do
            </button>
            <button
              @click="setFilter('completed')"
              :class="['btn', filter === 'completed' ? 'btn-success' : 'btn-outline-success']">
              Completed
            </button>
            <button
              @click="setFilter('all')"
              :class="['btn', filter === 'all' ? 'btn-warning' : 'btn-outline-warning']">
              All
            </button>
          </div>

          <!-- 정렬 버튼 -->
          <button class="btn btn-info" @click="toggleSortOrder">
            Sort ({{ sortOrder === 'asc' ? 'Asc' : 'Desc' }})
          </button>
        </div>

        <!-- Todo 리스트 -->
        <div>
          <div v-for="(todo, index) in filteredAndSortedTodos" :key="todo.id" class="mb-3">
            <TodoItem :todo="todo" :id="todo.id" />
          </div>
        </div>

        <!-- 모두 삭제 버튼 -->
        <button @click="clearAllTodos" class="btn btn-danger w-100 mt-4">
          Clear All Todos
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.container {
  min-width: 768px; /* 컨테이너 최소 너비 */
}

.mt-5 {
  margin-top: 3rem !important; /* 상단 마진 */
}

/* 버튼 그룹 스타일 */
.btn-group .btn {
  margin-right: 0.5rem; /* 버튼 간격 */
}

.btn-group .btn:last-child {
  margin-right: 0; /* 마지막 버튼 간격 제거 */
}

/* 버튼 호버 효과 */
button.btn:hover {
  transition: transform 0.2s ease-in-out;
  transform: scale(1.05); /* 버튼 크기 확대 효과 */
}

</style>
