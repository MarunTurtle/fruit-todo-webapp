<template>
  <div class="fruit-view">
    <h2 class="text-muted text-center">🍉 Todo Fruits 🍉</h2>
    <!-- Canvas 컨테이너. 캔버스를 중앙 정렬 -->
    <div class="canvas-container d-flex justify-content-center align-items-center">
      <div ref="container" class="fruit-container"></div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from "vue";
import { Engine, Render, World, Bodies, Events, Runner } from "matter-js";
import { useTodoStore } from "../stores/todoStore";
import { FRUITS } from "../constants/fruits";

// Store 및 캔버스 관련 변수
const todoStore = useTodoStore();
const container = ref(null);
const engine = Engine.create();
const render = ref(null);
const runner = ref(null);
const circles = ref({}); // Todo ID와 Circle 맵핑
const adviceVisible = ref(false); // 경고 메시지 표시 여부

// Props 정의
const props = defineProps({
  updateAddButtonDisabled: Function, // Add 버튼 비활성화 함수
});

// 캔버스 크기
const containerWidth = 500;
const containerHeight = 500;

// 일정 시간마다 Total Area 계산 (Debounce용)
let timeoutId = null;

function calculateTotalArea() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // 전체 Circle의 면적 계산
    const totalArea = Object.values(circles.value).reduce((sum, circle) => {
      const radius = circle.circleRadius || 0;
      return sum + 3.14 * Math.pow(radius, 2);
    }, 0);

    // 특정 기준 초과 시 Add 버튼 비활성화
    const threshold = 0.6 * containerWidth * containerHeight;
    adviceVisible.value = totalArea > threshold;

    if (typeof props.updateAddButtonDisabled === "function") {
      props.updateAddButtonDisabled(totalArea > threshold);
    } else {
      console.error("updateAddButtonDisabled is not a function");
    }
  }, 50); // 50ms마다 실행
}

// 초기 Mount 시 Matter.js 설정
onMounted(() => {
  // Matter.js 렌더러 생성
  render.value = Render.create({
    element: container.value,
    engine: engine,
    options: {
      width: containerWidth,
      height: containerHeight,
      wireframes: false,
      background: "#f8f9fa",
    },
  });

  // 바닥 및 벽 생성
  const ground = Bodies.rectangle(
    containerWidth / 2, containerHeight, containerWidth, 20,
    { isStatic: true, render: { fillStyle: "#000" } }
  );

  const leftWall = Bodies.rectangle(
    0, containerHeight / 2, 20, containerHeight,
    { isStatic: true, render: { fillStyle: "#000" } }
  );

  const rightWall = Bodies.rectangle(
    containerWidth, containerHeight / 2, 20, containerHeight,
    { isStatic: true, render: { fillStyle: "#000" } }
  );

  World.add(engine.world, [ground, leftWall, rightWall]);

  Render.run(render.value);
  runner.value = Runner.create();
  Runner.run(runner.value, engine);

  // 초기 Todo와 연동
  createCirclesForTodos(todoStore.todos.filter((todo) => !todo.completed));
  calculateTotalArea();

  // Watch: Todo 변경 시 실행
  watch(
    () => todoStore.todos,
    debounce((newTodos, oldTodos) => {
      // 삭제된 Todo 처리
      oldTodos.forEach((oldTodo) => {
        const newTodo = newTodos.find((todo) => todo.id === oldTodo.id);
        if (!newTodo && circles.value[oldTodo.id]) hideCircle(oldTodo.id);

        // 완료된 Todo 처리
        if (newTodo?.completed && !oldTodo.completed) hideCircle(newTodo.id);

        // 텍스트 변경 시 Circle 업데이트
        if (newTodo && oldTodo.text !== newTodo.text && circles.value[oldTodo.id]) {
          updateCircleLabel(newTodo.id, newTodo.text);
        }
      });

      // 새 Todo 추가
      newTodos.forEach((newTodo) => {
        if (!newTodo.completed && !circles.value[newTodo.id]) {
          addCircleForTodo(newTodo);
        }
      });

      calculateTotalArea(); // 업데이트 후 면적 재계산
    }, 100),
    { deep: true }
  );
});


// Todo에 대한 Circle 생성
function createCirclesForTodos(todos) {
  todos.forEach((todo) => addCircleForTodo(todo));
}

function addCircleForTodo(todo) {
  if (!todo.importance) {
    console.error(`Todo ${todo.id} is missing the 'importance' attribute.`);
    return;
  }

  // 중복 Circle 생성 방지
  if (circles.value[todo.id]) return;

  const fruit = getFruitByImportance(todo.importance);

  // X 좌표 및 중요도에 따른 딜레이 계산
  const wallWidth = 20;
  const x = Math.random() * (containerWidth - 2 * wallWidth) + wallWidth;
  const delay = getImportanceDelay(todo.importance);

  setTimeout(() => {
    // 딜레이 후 중복 확인
    if (circles.value[todo.id]) return;

    const circle = Bodies.circle(
      x, 0, fruit.radius,
      {
        label: todo.text,
        restitution: 0.1,
        friction: 0.05,
        frictionAir: 0.01,
        density: 0.004,
        render: { fillStyle: fruit.color, visible: true },
      }
    );

    circles.value[todo.id] = circle;
    World.add(engine.world, circle);

    addTextToCircle(circle, todo.importance);
    calculateTotalArea();
  }, delay);
}

// Debounce Helper 함수
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}


// 중요도에 따른 딜레이 반환
function getImportanceDelay(importance) {
  const delays = { "very important": 0, important: 1000, general: 1500, none: 2000 };
  return delays[importance] || 1500;
}

function hideCircle(id) {
  const circle = circles.value[id];
  if (!circle) return; // Circle이 존재하지 않으면 종료

  circle.isSensor = true; // 충돌 비활성화
  circle.render.visible = false; // 렌더링 비활성화

  World.remove(engine.world, circle); // Circle을 World에서 제거

  let shrinking = true; // Shrink 상태 추적

  const interval = setInterval(() => {
    // 이미 삭제되었거나 Shrink 완료 시 종료
    if (!shrinking || !circle || circle.circleRadius <= 0.5) {
      console.log("Not Activated Shrink");
      World.remove(engine.world, circle); // World에서 최종 제거
      delete circles.value[id]; // Circle 데이터 삭제
      clearInterval(interval); // Interval 종료
      return;
    }

    // Shrink 동작
    console.log("Activated Shrink");
    circle.circleRadius *= 0.9; // 반지름 점진적 축소

    // World에서 삭제 후 다시 추가하여 업데이트 반영
    World.remove(engine.world, circle);
    World.add(engine.world, circle);

    // 반지름이 임계값 이하로 작아지면 Shrink 완료로 설정
    if (circle.circleRadius <= 0.5) {
      shrinking = false;
    }
  }, 50); // 50ms마다 Shrink 실행
}


// Circle 텍스트 업데이트
function updateCircleLabel(id, newText) {
  const circle = circles.value[id];
  if (!circle) return;

  circle.label = newText;
  const todo = todoStore.todos.find((todo) => todo.id === id);
  addTextToCircle(circle, todo?.importance || "none");
}

// Circle에 텍스트 추가
function addTextToCircle(circle, importance) {
  const fontSize = getFontSizeByImportance(importance);

  Events.on(render.value, "afterRender", () => {
    if (!circle.render.visible) return;

    const context = render.value.context;
    context.font = `${fontSize}px Arial`;
    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.fillText(circle.label, circle.position.x, circle.position.y + circle.circleRadius / 4);
  });
}

// 중요도에 따른 Font Size 반환
function getFontSizeByImportance(importance) {
  const fontSizes = { "very important": 20, important: 18, general: 16, none: 14 };
  return fontSizes[importance] || 14;
}

// 중요도에 따른 Fruit 정보 반환
function getFruitByImportance(importance) {
  const mapping = {
    "very important": FRUITS[3],
    important: FRUITS[2],
    general: FRUITS[1],
    none: FRUITS[0],
  };

  return mapping[importance] || FRUITS[0];
}
</script>

<style scoped>


.fruit-view {
  height: 100%;
  border-radius: 8px;
  position: relative;
}

.fruit-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  margin: 0 auto;
  overflow: hidden;
}

.canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

</style>