# Matter.js를 활용한 ToDo 애플리케이션 디버깅 및 최적화

안녕하세요! 오늘은 Matter.js와 Vue.js로 개발한 ToDo 애플리케이션의 디버깅 경험과 문제 해결 과정을 공유하려고 합니다. Matter.js는 물리 엔진 라이브러리로, 이 프로젝트에서는 할 일을 "과일(Fruit)"로 표현해 중요도에 따라 크기와 떨어지는 타이밍을 다르게 설정했습니다. 그러나 구현 과정에서 **무한 루프 문제**와 **중복 객체 생성** 등 다양한 이슈를 겪었고, 이를 해결하며 배우게 된 내용을 정리해 보았습니다.

---

## 문제 상황 및 에러 로그

### 1. 무한 루프 문제

`Fruit.vue` 컴포넌트에서 `hideCircle` 함수가 Circle을 서서히 제거하는 로직을 처리하다가 **무한 루프**가 발생했습니다. 이로 인해 콘솔에는 아래와 같은 에러가 끊임없이 출력되었습니다.

```plaintext
matter-js: Matter.Runner: runner reached runner.maxUpdates, see docs.
Activated Shrink
Activated Shrink
Activated Shrink
...(반복)
```

#### 원인 분석
- **Matter.js의 World.remove 호출**: Circle을 World에서 제거한 후에도 Circle 참조를 삭제하지 않아, Matter.js가 해당 Circle을 계속 추적.
- **setInterval 사용 문제**: Circle의 크기를 줄이는 반복 작업이 종료 조건 없이 실행되며 무한 루프 발생.

---

### 2. 중복 Circle 생성

`addCircleForTodo` 함수에서 동일한 할 일(Todo)에 대해 여러 Circle이 생성되는 문제가 발생했습니다. 예를 들어, 할 일을 완료했다가 다시 미완료로 토글할 때 아래와 같은 경고 메시지가 나타났습니다.

```plaintext
Circle for Todo ID 3 already exists. Skipping creation.
Circle for Todo ID 3 already exists after delay. Skipping creation.
```

#### 원인 분석
- Circle 생성 전에 **중복 체크**를 하지 않아 동일한 ID를 가진 Circle이 여러 개 생성됨.
- 비동기 처리와 상태 변경 간의 **Race Condition**이 원인.

---

## 문제 해결 방법

### 1. 무한 루프 문제 해결: `hideCircle` 함수 수정

#### 핵심 아이디어
- Circle 크기를 서서히 줄이는 로직(`setInterval`)을 제거하고, Circle을 즉시 World에서 제거한 뒤 참조도 삭제.
- Matter.js의 World에서 Circle을 완전히 삭제하면 추적 문제가 사라짐.

#### 수정 전 코드
```javascript
function hideCircle(id) {
  const circle = circles.value[id];
  if (!circle) return;

  const interval = setInterval(() => {
    if (circle.circleRadius > 0.5) {
      World.remove(engine.world, circle);
      World.add(engine.world, circle);
    } else {
      World.remove(engine.world, circle);
      delete circles.value[id];
      clearInterval(interval);
    }
  }, 50);
}
```

#### 수정 후 코드
```javascript
function hideCircle(id) {
  const circle = circles.value[id];
  if (!circle) return;

  circle.isSensor = true; // 충돌 감지 비활성화
  circle.render.visible = false; // 렌더링 비활성화
  World.remove(engine.world, circle); // World에서 Circle 제거
  delete circles.value[id]; // 참조 삭제
}
```

---

### 2. 중복 Circle 생성 문제 해결: `addCircleForTodo` 함수 수정

#### 핵심 아이디어
- Circle을 생성하기 전에 `circles.value`에서 해당 ID의 Circle이 이미 존재하는지 확인.
- 중복 생성 시 경고를 출력하고 Circle 생성을 생략.

#### 수정 전 코드
```javascript
function addCircleForTodo(todo) {
  const fruit = getFruitByImportance(todo.importance);
  const circle = Bodies.circle(...);
  World.add(engine.world, circle);
  circles.value[todo.id] = circle;
}
```

#### 수정 후 코드
```javascript
function addCircleForTodo(todo) {
  if (circles.value[todo.id]) {
    console.warn(`Circle for Todo ID ${todo.id} already exists. Skipping creation.`);
    return;
  }

  const fruit = getFruitByImportance(todo.importance);
  const circle = Bodies.circle(...);
  World.add(engine.world, circle);
  circles.value[todo.id] = circle;
}
```

---

### 3. 할 일 완료 상태 토글 시 Circle 동작 개선

#### 핵심 아이디어
- 할 일의 완료 상태를 토글할 때, 기존 Circle을 제거하고 새 Circle을 추가하는 과정을 명확히 분리.
- 완료된 Circle은 World에서 제거하고, 미완료 상태로 변경된 Circle은 새로 추가.

#### 수정 전 코드
```javascript
function handleTodosUpdate(newTodos, oldTodos) {
  oldTodos.forEach((todo) => {
    if (todo.completed) hideCircle(todo.id);
  });
}
```

#### 수정 후 코드
```javascript
function handleTodosUpdate(newTodos, oldTodos) {
  oldTodos.forEach((oldTodo) => {
    const newTodo = newTodos.find((todo) => todo.id === oldTodo.id);

    if (!newTodo && circles.value[oldTodo.id]) {
      hideCircle(oldTodo.id); // 삭제된 Circle 제거
    }

    if (newTodo?.completed && !oldTodo.completed) {
      hideCircle(newTodo.id); // 완료된 Circle 제거
    }
  });

  newTodos.forEach((newTodo) => {
    if (!newTodo.completed && !circles.value[newTodo.id]) {
      addCircleForTodo(newTodo); // 새 Circle 추가
    }
  });
}
```

---

## 문제 해결 과정에서 배운 점

### 1. **상태 동기화의 중요성**
- 물리 엔진(Matter.js)과 Vue.js 상태를 일치시키지 않으면 예상치 못한 충돌이 발생할 수 있습니다.
- 모든 동작에서 상태와 엔진 간의 관계를 명확히 정의해야 합니다.

### 2. **비동기 처리 안정화**
- `setTimeout`이나 `setInterval` 사용 시 Race Condition을 방지하려면 상태 확인 로직을 추가해야 합니다.
- Debounce를 활용해 상태 업데이트를 적절히 제한하는 것도 중요합니다.

### 3. **디버깅 기록의 필요성**
- 콘솔 로그와 에러 메시지를 활용해 문제 발생 시점을 정확히 파악할 수 있었습니다.
- 디버깅 과정을 기록하며 더 나은 문제 해결 방법을 도출할 수 있었습니다.

---

이 프로젝트를 통해 Matter.js와 Vue.js를 효과적으로 통합하는 방법을 배울 수 있었습니다. 여러분도 비슷한 문제를 겪고 있다면, 이 글이 도움이 되길 바랍니다! 🚀