<script setup>
import { ref, computed } from "vue";
import { useTodoStore } from "../stores/todoStore";
import TodoInput from "../components/TodoInput.vue";
import TodoItem from "../components/TodoItem.vue";
import Fruit from "../components/Fruit.vue";

const todoStore = useTodoStore();
const filter = ref("todo");
const sortOrder = ref("asc"); // Default sorting order: ascending
const addButtonDisabled = ref(false); // Track whether the add button is disabled
const showWarning = ref(false); // Track whether to show the warning message

// Map importance levels to numeric values for sorting
const importanceMap = {
  none: 0,
  general: 1,
  important: 2,
  "very important": 3,
};

// Method to set the disabled state of the add button
const setAddButtonDisabled = (disabled) => {
  addButtonDisabled.value = disabled;
  showWarning.value = disabled; // Show warning when the button is disabled
};

// Computed property to filter and sort todos
const filteredAndSortedTodos = computed(() => {
  let filtered = todoStore.todos;
  if (filter.value === "completed") {
    filtered = todoStore.todos.filter((todo) => todo.completed);
  } else if (filter.value === "todo") {
    filtered = todoStore.todos.filter((todo) => !todo.completed);
  }

  // Sort the filtered todos by importance
  return filtered.sort((a, b) => {
    const aValue = importanceMap[a.importance];
    const bValue = importanceMap[b.importance];
    return sortOrder.value === "asc" ? aValue - bValue : bValue - aValue;
  });
});

// Function to set the active filter
const setFilter = (newFilter) => {
  filter.value = newFilter;
};

// Toggle sorting order
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

// Local method to clear all uncompleted todos
const clearAllTodos = () => {
  if (window.confirm("Are you sure you want to clear all uncompleted todos?")) {
    todoStore.clearTodos();
  }
};
</script>

<template>
  <div class="todo-list-view container">
    <div class="row g-4">
      <!-- Left Half: To-Do List -->
      <div class="col-md-6">
        <TodoInput :add-button-disabled="addButtonDisabled" />


        <!-- Warning Message -->
        <p v-if="showWarning" class="text-danger">
          Finish your existing tasks before adding new ones to maintain focus! <br> Adding new todos is blocked until you do.
        </p>

        <!-- Filter and Sort Buttons -->
        <div class="button-group d-flex justify-content-between align-items-center my-4">
          <!-- Filter Buttons -->
          <div class="filter-buttons btn-group">
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

          <!-- Sort Button -->
          <button
            class="btn btn-info"
            @click="toggleSortOrder"
          >
            Sort ({{ sortOrder === 'asc' ? 'Asc' : 'Desc' }})
          </button>
        </div>

        <!-- Task List -->
        <div>
          <div
            v-for="(todo, index) in filteredAndSortedTodos"
            :key="todo.id"
            class="mb-3"
          >
            <TodoItem :todo="todo" :id="todo.id" />
          </div>
        </div>

        <!-- Clear All Button -->
        <button
          @click="clearAllTodos"
          class="btn btn-danger my-3 w-100 clear-all-btn">
          Clear All Todos
        </button>
      </div>

      <!-- Right Half: Fruit Placeholder -->
      <div class="col-md-6">
        <Fruit :update-add-button-disabled="setAddButtonDisabled" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-list-view {
  margin-top: 50px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-buttons .btn {
  margin-right: 5px;
}

button.clear-all-btn {
  font-weight: bold;
  font-size: 1rem;
  border-radius: 8px;
  transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

button.clear-all-btn:hover {
  transform: scale(1.05);
  background-color: #dc3545; /* Darker red on hover */
  color: #fff;
}
</style>