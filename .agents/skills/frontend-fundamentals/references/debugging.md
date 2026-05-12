# 디버깅 (Debug) 상세 가이드

출처: https://frontend-fundamentals.com/debug/

## 디버깅이란

디버깅은 프로그램이 예상대로 동작하지 않을 때 원인을 찾아내고 해결하는 과정이다. 개발 과정 전반에 걸쳐 반복되는, 누구에게나 피할 수 없는 중요한 작업이다.

**핵심 메시지**: 풀 수 없는 버그는 없다. 작은 단서를 따라가다 보면 반드시 해결책은 나타난다.

---

## 효과적인 디버깅을 위한 4단계

### 1단계: 진단하기

문제를 무작정 해결하려 하기보다 **무엇이 문제인지 정확히 파악**하는 것이 먼저다.

#### A. 에러 메시지로 원인 추측하기

에러 메시지를 통째로 복사해 검색하지 말고, 한 단어씩 차근차근 해석하라.

##### SyntaxError (문법 오류)
자바스크립트 엔진이 코드 실행 전 문법 해석에 실패했음을 알리는 신호.

흔한 사례:
- `unexpected '}'`: 괄호 매칭 오류
- `Unexpected '<'`: 잘못된 URL로 HTML 응답을 JSON으로 파싱 시도
  ```js
  JSON.parse("<!DOCTYPE html>..."); // SyntaxError
  ```
- 따옴표 매칭 오류

**확인할 것**: IDE가 구문 오류를 실시간 감지하므로 강조 표시를 주의 깊게 본다.

##### TypeError (타입 오류)
값의 타입이 예상과 다를 때 발생. 정의되지 않은 값에 접근하거나 함수가 아닌 값을 호출할 때.

흔한 사례:
- `Cannot read properties of null`: null/undefined 객체의 속성 접근
  ```js
  const user = null;
  console.log(user.name); // TypeError
  ```
- `is not a function`: 함수가 아닌 것을 호출
  ```js
  const num = 42;
  num(); // TypeError
  ```
- `await` 누락으로 Promise 객체를 직접 사용

**확인할 것**: 객체 존재 여부, API 응답 구조, `typeof`/`Array.isArray()` 검사, `await` 누락

##### ReferenceError (참조 오류)
정의되지 않은 식별자를 사용하려 할 때 발생.

```js
console.log(userName);  // ReferenceError
let userName = "Alice"; // 선언보다 먼저 접근
```

**확인할 것**: 변수 선언 여부, 선언 순서, 외부 스코프 참조 의도

##### 리소스 로딩 오류
`fetch`에서 네트워크 자체가 실패하면 `TypeError: Load failed` 또는 `TypeError: Failed to fetch`.
- HTTP 4xx/5xx와 다름: 네트워크 자체 실패 또는 보안 정책(CORS 등) 차단
- HTTP 4xx/5xx는 reject하지 않고 `res.ok`가 `false`인 응답을 돌려줌

**확인할 것**: 네트워크, CORS, 인증서, CSP, 확장 프로그램 차단 가능성

##### 모듈 import 오류
ESM과 CJS 혼합 환경에서 자주 발생.

```js
// .js 파일에서 import 사용 시 에러 (Node.js는 기본적으로 CJS)
import fs from "fs"; // SyntaxError
```

**확인할 것**: `package.json`의 `"type": "module"` 설정, 파일 확장자(.mjs/.cjs), 번들 경로

#### B. 작업 지도 그리기
코드의 실행 흐름을 시각화하여 문제 범위를 체계적으로 좁혀간다. 데이터 흐름, 함수 호출 순서, 이벤트 트리거 등을 도식화한다.

---

### 2단계: 재현하기

**재현되지 않는 버그는 고칠 수 없다.** 문제를 확실히 재현할 수 있어야 빠르게 수정하고 테스트할 수 있다.

#### A. 최대한 간단하게 재현하기
복잡한 프로젝트에서 버그를 재현하려면 시간이 오래 걸린다. 최소한의 코드로 재현 환경을 만든다.
- CodeSandbox, StackBlitz 등에서 최소 재현 코드 작성
- 관련 없는 코드를 하나씩 제거하면서 핵심 원인을 좁힌다

#### B. 디버거와 콘솔로그 활용하기
- `console.log`: 빠른 값 확인, 실행 흐름 추적
- `console.table`: 배열/객체 데이터를 표 형태로 확인
- `console.trace`: 호출 스택 추적
- `debugger` 문: 코드 실행을 중단하고 DevTools에서 상태 검사
- 브라우저 DevTools의 중단점(Breakpoint): 조건부 중단점, DOM 변경 중단점 등

#### C. 일반적인 범위에서 벗어난 값 재현하기
경계값(빈 문자열, 0, null, undefined, 매우 큰 수, 특수 문자 등)으로 테스트하면 숨겨진 버그를 발견할 수 있다.

#### D. 반복적인 재현 과정을 자동화하기
재현 단계가 복잡하면 스크립트나 테스트 코드로 자동화한다. Playwright, Cypress 등의 E2E 테스트 도구 활용.

#### E. 버그 발생 경로를 추적하기
Git bisect로 버그가 도입된 커밋을 찾거나, 릴리스 노트를 역추적하여 변경사항을 확인한다.

---

### 3단계: 수정하기

**겉으로 드러난 증상만 고치면 버그는 다시 나타난다.** 진짜 원인을 찾아서 수정해야 한다.

#### A. 근본 원인 수정하기
증상이 아닌 원인을 수정한다.

예시:
- 증상: API 호출 시 가끔 에러 발생
- 임시 해결: try-catch로 에러 무시
- 근본 해결: 레이스 컨디션을 AbortController로 해결

#### B. 순수 함수 만들기
부수 효과가 있는 함수는 디버깅이 어렵다. 가능한 한 순수 함수로 분리하여 입력 → 출력 관계를 명확하게 한다.

```ts
// Bad: 외부 상태에 의존
let taxRate = 0.1;
function calculatePrice(price: number) {
  return price * (1 + taxRate); // taxRate 변경 시 결과가 달라짐
}

// Good: 순수 함수
function calculatePrice(price: number, taxRate: number) {
  return price * (1 + taxRate);
}
```

#### C. 데드코드 제거하기
사용되지 않는 코드는 혼란을 주고, 잘못된 참조의 원인이 된다. 정기적으로 데드코드를 찾아 제거한다.
- 미사용 변수/함수
- 도달 불가능한 코드 (return 뒤의 코드)
- 주석 처리된 오래된 코드
- 더 이상 호출되지 않는 API 핸들러

---

### 4단계: 재발 방지하기

**디버깅의 끝은 재발 방지다.** 왜 생겼는지 되짚어 보고, 같은 실수를 반복하지 않도록 한다.

#### A. 에러 로그 상세히 남기기
에러 발생 시 충분한 맥락 정보를 기록한다:
- 에러 메시지 + 스택 트레이스
- 사용자 행동 경로
- 요청/응답 데이터
- 환경 정보 (브라우저, OS, 디바이스)

```ts
try {
  await submitForm(data);
} catch (error) {
  logger.error({
    message: error.message,
    stack: error.stack,
    context: { userId, formData: data, timestamp: Date.now() },
  });
}
```

#### B. 버그 리포트 남기기
수정한 버그의 원인, 해결 과정, 해결책을 문서화한다. 다음 내용을 포함:
- 문제 설명 (무엇이 어떻게 잘못되었는지)
- 재현 단계
- 예상 동작 vs 실제 동작
- 원인 분석
- 해결 방법
- 관련 커밋/PR 링크

#### C. 팀과 공유하고 공통 유틸에 반영하기
- 팀 미팅이나 위키에서 디버깅 경험 공유
- 자주 발생하는 패턴은 공통 유틸로 추출
- 린트 규칙이나 타입 검사로 같은 실수 방지
- 테스트 코드 추가로 회귀 방지

---

## 디버깅 실무 사례 (카테고리)

Frontend Fundamentals에서 다루는 실무 디버깅 사례 카테고리:

### CSS
- 고주사율 모니터에서만 깜빡이던 시간표 셀 (opacity + backface-visibility 이슈)

### JavaScript
- `MAX_SAFE_INTEGER` 정밀도 손실 (큰 숫자 처리 시 BigInt 사용)
- `THREE.Cache.enabled`로 인한 메모리 누수
- iframe에서 `mousemove`가 동작하지 않는 이슈

### TypeScript
- React Query 사용 중 반환 타입 단언 오류

### React
- BroadcastQueryClient SuspenseError
- React Suspense와 framer-motion UI 충돌
- 실시간 차트에서 메모리 누수 (unmount 시 cleanup 누락)
- React Hook Form + Zod 유효성 검증 실패 시 무반응
- 리렌더링 퍼포먼스 문제
- State Update의 비동기성과 Closure 이슈

### iOS
- 웹뷰 이미지 업로드 시 새로고침
- 스와이프 뒤로가기 시 회색 화면
- Safari TradingView iframe 메모리 누수

### Android
- React Native 번들 로딩 시 SIGBUS 크래시

### 기타
- OG 이미지에 타인 프로필 표시 (캐싱 이슈)
- ESLint/TSC 파싱 콜스택 오버플로우
- Yarn Workspace HMR 미동작
- Radix UI Dialog + Select ESC 키 충돌
- Cursor에서 Biome 포맷팅 미동작
