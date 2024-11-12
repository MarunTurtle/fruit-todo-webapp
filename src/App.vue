<script setup></script>

<template>
  <div>
    <!-- Global Header -->
    <header class="bg-light py-3 shadow-sm mb-4">
      <div class="container text-center">
        <h1 class="m-0">ToDo List 📝</h1>
      </div>
    </header>
    <!-- Router Content -->
    <RouterView />
  </div>
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #ffffff;
}
</style>