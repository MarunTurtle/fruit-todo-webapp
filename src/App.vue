<script setup>
// 현재 컴포넌트에 특별한 JavaScript 로직이 필요하지 않아 비워둠
</script>

<template>
  <div>
    <!-- 전역 헤더 -->
    <header class="bg-light py-3 shadow-sm mb-4">
      <div class="container text-center">
        <h1 class="m-0">ToDo List 📝</h1> <!-- 제목 -->
      </div>
    </header>
    <!-- 라우터 콘텐츠 -->
    <RouterView /> <!-- 각 라우트에 따른 콘텐츠 출력 -->
  </div>
</template>

<style scoped>
header {
  /* 상단 고정 헤더 */
  position: sticky; /* 스크롤 시 고정 */
  top: 0; /* 화면 상단에 위치 */
  z-index: 1000; /* 다른 요소 위에 렌더링 */
  background-color: #ffffff; /* 헤더 배경색 */
}

.bg-light {
  background-color: #f8f9fa; /* Bootstrap 라이트 배경색 */
}

.py-3 {
  padding-top: 1rem; /* 상단 패딩 */
  padding-bottom: 1rem; /* 하단 패딩 */
}

.shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 가벼운 그림자 */
}

.mb-4 {
  margin-bottom: 1.5rem; /* 하단 여백 */
}

.container {
  max-width: 960px; /* 중앙 정렬 컨테이너 */
  margin: 0 auto; /* 좌우 여백 */
}

.text-center {
  text-align: center; /* 텍스트 중앙 정렬 */
}

.m-0 {
  margin: 0; /* 기본 마진 제거 */
}

</style>