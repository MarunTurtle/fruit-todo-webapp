<template>
  <div class="fruit-view">
    <h2 class="text-muted text-center">Todo Fruits 🍉</h2>
    <div ref="container" class="fruit-container"></div> 
  </div>
  
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Engine, Render, World, Bodies, Events, Runner } from "matter-js";
import { useTodoStore } from "../stores/todoStore";
import { FRUITS } from "../constants/fruits";

const todoStore = useTodoStore();
const container = ref(null);
const engine = Engine.create();
const render = ref(null);
const runner = ref(null);
const circles = ref({}); // Map of todo id to circle body
const adviceVisible = ref(false); // Track whether to show advice text
const props = defineProps({
  updateAddButtonDisabled: Function,
});

const containerWidth = 600;
const containerHeight = 500;
const calculateTotalArea = () => {
  const totalArea = Object.values(circles.value).reduce((sum, circle) => {
    const radius = circle.circleRadius || 0;
    return sum + 3.14 * Math.pow(radius, 2);
  }, 0);

  const threshold = 0.6 * containerWidth * containerHeight; // 60% of container area
  adviceVisible.value = totalArea > threshold;

  if (typeof props.updateAddButtonDisabled === "function") {
    props.updateAddButtonDisabled(totalArea > threshold);
  } else {
    console.error("updateAddButtonDisabled is not a function");
  }
};

onMounted(() => {

  // Create the Matter.js renderer
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

  const ground = Bodies.rectangle(
    containerWidth / 2,
    containerHeight,
    containerWidth,
    20,
    {
      isStatic: true,
      render: { fillStyle: "#000" },
    }
  );

  const leftWall = Bodies.rectangle(
    0,
    containerHeight / 2,
    20,
    containerHeight,
    {
      isStatic: true,
      render: { fillStyle: "#000" },
    }
  );

  const rightWall = Bodies.rectangle(
    containerWidth,
    containerHeight / 2,
    20,
    containerHeight,
    {
      isStatic: true,
      render: { fillStyle: "#000" },
    }
  );

  World.add(engine.world, [ground, leftWall, rightWall]);

  Render.run(render.value);
  runner.value = Runner.create();
  Runner.run(runner.value, engine);

  createCirclesForTodos(todoStore.todos.filter((todo) => !todo.completed));
  calculateTotalArea();

  watch(
    () => todoStore.todos,
    (newTodos, oldTodos) => {

      // Handle deleted tasks
      oldTodos.forEach((oldTodo) => {
        const newTodo = newTodos.find((todo) => todo.id === oldTodo.id);
        if (!newTodo && circles.value[oldTodo.id]) {
          hideCircle(oldTodo.id); // Deleted todo
        }

        // Handle completed todos
        if (newTodo && newTodo.completed && !oldTodo.completed) {
          hideCircle(newTodo.id); // Newly completed todo
        }

        // Handle text changes (update label)
        if (newTodo && oldTodo.text !== newTodo.text && circles.value[oldTodo.id]) {
          updateCircleLabel(newTodo.id, newTodo.text);
        }
      });

      // Add circles for new todos
      newTodos.forEach((newTodo) => {
        if (!newTodo.completed && !circles.value[newTodo.id]) {
          addCircleForTodo(newTodo);
        }
      });

      calculateTotalArea(); // Recalculate total area after updates
    },
    { deep: true }
  );
});

function createCirclesForTodos(todos) {
  todos.forEach((todo) => addCircleForTodo(todo));
}

function addCircleForTodo(todo) {
  if (!todo.importance) {
    console.error(`Todo ${todo.id} is missing the 'importance' attribute.`);
    return;
  }

  const fruit = getFruitByImportance(todo.importance);

  const circle = Bodies.circle(
    Math.random() * 500 + 50,
    50,
    fruit.radius,
    {
      label: todo.text,
      restitution: 0.8,
      friction: 0.1,
      frictionAir: 0.02,
      render: {
        fillStyle: fruit.color,
        visible: true,
      },
    }
  );

  circles.value[todo.id] = circle;
  World.add(engine.world, circle);

  addTextToCircle(circle, todo.importance);
  calculateTotalArea(); // Update total area when a new circle is added
}

function hideCircle(id) {
  const circle = circles.value[id];
  if (!circle) return;

  // Gradually shrink the circle for a "swoosh" effect
  const interval = setInterval(() => {
    if (circle.circleRadius > 0.5) {
      // Shrink the circle
      circle.circleRadius *= 0.5;

      // Temporarily remove the body from the world to apply changes
      World.remove(engine.world, circle);

      // Update the body's properties
      circle.isSensor = true; // Disable collisions
      circle.render.visible = false; // Make the circle invisible

      // Re-add the body to the world after changes
      World.add(engine.world, circle);
    } else {
      // Once fully shrunk, remove it from the world and cleanup
      World.remove(engine.world, circle);
      delete circles.value[id];
      clearInterval(interval);
    }
  }, 50); // Shrink every 50ms
}

function updateCircleLabel(id, newText) {
  const circle = circles.value[id];
  if (!circle) return;

  circle.label = newText;

  // Pass the importance value to maintain the correct font size
  const todo = todoStore.todos.find((todo) => todo.id === id);
  if (todo && todo.importance) {
    addTextToCircle(circle, todo.importance);
  } else {
    console.error(`Todo ${id} is missing importance. Default font size applied.`);
    addTextToCircle(circle, "none"); // Default to "none" if importance is missing
  }
}

function addTextToCircle(circle, importance) {
  const fontSize = getFontSizeByImportance(importance);

  Events.on(render.value, "afterRender", () => {
    if (!circle.render.visible) return; // Skip rendering hidden circles

    const context = render.value.context;
    context.beginPath();
    context.arc(circle.position.x, circle.position.y, circle.circleRadius, 0, Math.PI * 2);
    context.fillStyle = circle.render.fillStyle;
    context.fill();
    context.closePath();

    context.font = `${fontSize}px Arial`;
    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.fillText(
      circle.label,
      circle.position.x,
      circle.position.y + circle.circleRadius / 4
    );
  });
}

function getFruitByImportance(importance) {
  const mapping = {
    "very important": FRUITS[3],
    important: FRUITS[2],
    general: FRUITS[1],
    none: FRUITS[0],
  };
  return mapping[importance] || FRUITS[0];
}

function getFontSizeByImportance(importance) {
  const fontSizes = {
    "very important": 20,
    important: 18,
    general: 16,
    none: 14,
  };
  return fontSizes[importance] || 14;
}
</script>

<style scoped>
.fruit-view {
  height: 100%;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  position: relative;
}

.fruit-container {
  width: 600px;
  height: 600px;
  margin: 0 auto;
  overflow: hidden;
}
</style>