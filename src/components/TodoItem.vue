<script setup>
import { ref, computed } from 'vue';
import { useTodoStore } from '../stores/todoStore';

// Props 정의: Todo ID와 상세 데이터
const props = defineProps({
  id: Number, // Todo ID
  todo: Object, // Todo 객체
});

// Todo Store 가져오기
const todoStore = useTodoStore();

// 편집 상태 및 편집 텍스트 관리
const isEditing = ref(false); // 편집 여부 상태
const editedText = ref(props.todo.text); // 편집 중 텍스트

// 작업 저장 함수
const saveTask = () => {
  todoStore.updateTask(props.id, editedText.value); // 텍스트 업데이트
  isEditing.value = false; // 편집 상태 종료
};

// 완료 상태 토글 함수
const toggleComplete = () => {
  todoStore.toggleComplete(props.id); // Todo 완료 상태 변경
};

// 작업 삭제 함수
const deleteTask = () => {
  todoStore.deleteTask(props.id); // Todo 삭제
};

// 중요도에 따른 카드 배경색 동적 설정
const cardBackgroundColor = computed(() => {
  const importanceMapping = {
    "none": "#ECEFF1", // 연한 회색
    "general": "#E8F5E9", // 연한 녹색
    "important": "#FFF3E0", // 연한 주황색
    "very important": "#FDECEA", // 연한 빨간색
  };
  return importanceMapping[props.todo.importance] || "#ECEFF1"; // 기본 배경색은 회색
});
</script>


<template>
  <div
    class="todo-item card shadow-sm p-3 mb-3"
    :style="{ backgroundColor: cardBackgroundColor }" <!-- 동적 배경색 -->
  >
    <!-- Todo 텍스트 및 컨트롤 -->
    <div class="d-flex align-items-center justify-content-between">
      <!-- 읽기 상태 -->
      <div v-if="!isEditing" class="d-flex align-items-center">
        <!-- 완료 체크박스 -->
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleComplete" <!-- 완료 상태 토글 -->
          class="form-check-input me-3"
        />
        <!-- Todo 텍스트: 완료 상태일 경우 취소선 -->
        <span :class="{ 'text-decoration-line-through text-muted': todo.completed }">
          {{ todo.text }}
        </span>
      </div>

      <!-- 편집 상태 -->
      <div v-else class="flex-grow-1">
        <input v-model="editedText" class="form-control me-3" /> <!-- 편집 텍스트 입력 -->
      </div>

      <!-- 버튼 그룹 -->
      <div class="btn-group">
        <!-- 편집 버튼 -->
        <button
          v-if="!isEditing"
          @click="isEditing = true"
          class="btn btn-warning btn-sm"
        >✏️</button>

        <!-- 저장 버튼 -->
        <button
          v-if="isEditing"
          @click="saveTask"
          class="btn btn-primary btn-sm"
        >💾</button>

        <!-- 삭제 버튼 -->
        <button
          @click="deleteTask"
          class="btn btn-danger btn-sm"
        >🗑️</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* 완료된 Todo 텍스트에 취소선 스타일 */
.text-decoration-line-through {
  text-decoration: line-through; /* 취소선 */
}

</style>