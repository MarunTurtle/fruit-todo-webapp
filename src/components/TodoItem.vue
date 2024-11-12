<script setup>
import { ref, computed } from 'vue';
import { useTodoStore } from '../stores/todoStore';

const props = defineProps({
  id: Number,
  todo: Object,
});

const todoStore = useTodoStore();
const isEditing = ref(false);
const editedText = ref(props.todo.text);

const saveTask = () => {
  todoStore.updateTask(props.id, editedText.value);
  isEditing.value = false;
};

const toggleComplete = () => {
  todoStore.toggleComplete(props.id);
};

const deleteTask = () => {
  todoStore.deleteTask(props.id);
};

// Dynamically set card background color
const cardBackgroundColor = computed(() => {
  const importanceMapping = {
    "none": "#ECEFF1", // Light Gray
    "general": "#E8F5E9", // Light Green
    "important": "#FFF3E0", // Light Orange
    "very important": "#FDECEA", // Light Red
  };
  return importanceMapping[props.todo.importance] || "#ECEFF1"; // Default to light gray
});
</script>

<template>
  <div
    class="todo-item card shadow-sm p-3 mb-3"
    :style="{ backgroundColor: cardBackgroundColor }"
  >
    <div class="d-flex align-items-center justify-content-between">
      <div v-if="!isEditing" class="d-flex align-items-center">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleComplete"
          class="form-check-input me-3"
        />
        <span :class="{ 'text-decoration-line-through text-muted': todo.completed }">
          {{ todo.text }}
        </span>
      </div>
      <div v-else class="flex-grow-1">
        <input v-model="editedText" class="form-control me-3" />
      </div>
      <div class="btn-group">
        <button v-if="!isEditing" @click="isEditing = true" class="btn btn-warning btn-sm">✏️</button>
        <button v-if="isEditing" @click="saveTask" class="btn btn-primary btn-sm">💾</button>
        <button @click="deleteTask" class="btn btn-danger btn-sm">🗑️</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-decoration-line-through {
  text-decoration: line-through;
}
</style>