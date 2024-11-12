import { defineStore } from "pinia";
import { ref } from "vue";

export const useTodoStore = defineStore("todoStore", {
  state: () => ({
    todos: [],
    idCounter: 0,
    addButtonDisabled: false,
  }),
  actions: {
    setAddButtonDisabled(state) {
      this.addButtonDisabled = state;
    },
    addTask(task, importance) {
      this.todos.push({
        id: this.idCounter++,
        text: task,
        completed: false,
        importance,
      });
    },
    deleteTask(id) {
      this.todos = this.todos.filter((todo) => todo.id !== id);
    },
    toggleComplete(id) {
      this.todos = this.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
    },
    updateTask(id, newText, newImportance) {
      this.todos = this.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              text: newText || todo.text, // Preserve old text if newText is undefined
              importance: newImportance || todo.importance, // Preserve old importance
            }
          : todo
      );
    },
    clearTodos() {
      this.todos = this.todos.filter((todo) => todo.completed);
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "todo-list",
        storage: localStorage,
      },
    ],
  },
});