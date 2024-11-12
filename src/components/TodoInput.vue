<script setup>
import { ref } from "vue";
import { useTodoStore } from "../stores/todoStore";

const props = defineProps({
  addButtonDisabled: Boolean,
});

const todoStore = useTodoStore();
const task = ref("");
const importance = ref("general"); // Default importance

const addTask = () => {
  if (task.value.trim()) {
    todoStore.addTask(task.value, importance.value);
    task.value = "";
    importance.value = "general"; // Reset importance
  }
};
</script>

<template>
  <div class="todo-input">
    <div class="input-group mb-4">
      <input
        v-model="task"
        type="text"
        class="form-control"
        placeholder="Add your task"
        :disabled="addButtonDisabled"
      />
      <select v-model="importance" class="form-select" :disabled="addButtonDisabled">
        <option value="very important">Very Important</option>
        <option value="important">Important</option>
        <option value="general">General</option>
        <option value="none">None</option>
      </select>
      <button @click="addTask" class="btn btn-success" :disabled="addButtonDisabled">+</button>
    </div>
  </div>
</template>

<style scoped>
.todo-input {
  margin-bottom: 20px;
}
</style>