# TypeScript와 파일 구조 컨벤션

## 이름과 선언

| 대상                       | 규칙                                | 코드 근거                                                              |
| -------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| 컴포넌트·클래스·인터페이스 | PascalCase                          | `src/components/DialogModal/DialogModal.tsx`, `src/apis/primitives.ts` |
| 변수·함수                  | camelCase                           | `src/util/tableValidation.ts`, `src/hooks/useDocumentVisibility.ts`    |
| boolean 상태·판정          | `is`, `has`, `should`, `can` 접두어 | `src/routes/ProtectedRoute.tsx`, `src/hooks/useModal.tsx`              |
| React 상태 setter·Ref      | `set{Value}`, `{name}Ref`           | `src/hooks/useTableShare.tsx`, `src/hooks/usePageTracking.ts`          |
| 모든 상수                  | `UPPER_SNAKE_CASE`                  | `src/constants/errors.ts`; 새 코드의 확정 규칙                         |

`var`를 사용하지 않음. 재할당이 없으면 `const`, 필요하면 `let`을 사용함.
컴포넌트 내부에서 선언하는 함수는 화살표 함수, 파일 최상단과 유틸리티 함수는
함수 선언문으로 작성함. 모든 조건문에 중괄호를 사용하며 early return도 예외가
아님. 문자열에는 작은따옴표, 문장 끝에는 세미콜론, 들여쓰기에는 2칸을 사용함.
기존 코드에 남은 다른 형식은 새 작업의 예외가 아님.

배열·컬렉션 처리에는 일반 `for`문을 자제하고 목적을 드러내는 연산을 사용함. 반복
방식의 변경이 성능이나 중단 조건에 영향을 주는 경우에는 해당 계약을 먼저 확인함.

외부 패키지는 패키지 이름으로, 저장소 코드는 상대 경로로 import함. import 순서와
`import type` 사용 여부는 강제하지 않음. 주 컴포넌트와 훅은 default export함. 그
밖의 export 방식은 규정하지 않음.

## 타입과 값

- Props·응답·Provider처럼 객체 계약은 `interface`로 선언함.
  union·tuple·primitive alias는 `type`으로 선언함.
- 유한한 상태·이벤트·모드는 literal union으로 제한함. 형태에 따라 처리가 갈리면
  판별 가능한 union을 사용함.
- 값 없음이 상태의 일부라면 `T | null`로 표시함. 유한 key와 표시값·스타일은
  `Record` 또는 Map으로 대응시킴.
- JSON, 소켓, 오류 등 신뢰할 수 없는 값은 `unknown`에서 검사 함수로 좁힌 뒤
  사용함.
- 반복되는 길이·시간·재시도 제한에는 이름 있는 상수를 사용하고, literal 추론이
  필요한 값에는 `as const`를 사용함.

근거는 `src/types/type.ts`, `src/apis/sockets/type.ts`,
`src/apis/sockets/util.ts`, `src/util/tableValidation.ts`에 있음.

## 파일 배치와 순수 함수

공용 도메인 타입은 `src/types/`에 모음. API 요청·응답 계약은
`src/apis/requests/`·`src/apis/responses/`에 두고, 기능 안에서만 쓰는 Props·상태
타입은 해당 파일 가까이에 둠. `src/page/{PageName}/{PageName}.tsx`와
`src/components/{Component}/{Component}.tsx`를 화면·공용 UI의 기본 위치로
사용함. 페이지 전용 UI·훅·Story는 그 페이지 아래에 배치함. 비컴포넌트 역할
폴더는 camelCase 또는 소문자로 명명함. 구조의 책임 기준은
[구조와 UI](../architecture/structure-and-ui.md)가 소유함.

포맷·검증·인코딩·상태 해석은 가능하면 React 밖의 순수 함수로 분리함. 브라우저
API 실패는 `try/catch`와 명시적인 안전값 또는 대체 경로로 처리함. 근거는
`src/util/formatting.ts`, `src/util/tableValidation.ts`,
`src/util/clipboard.ts`에 있음.

## 주석

주석과 JSDoc은 한국어로 작성함. JSDoc은 재사용 범위가 넓은 훅·유틸·헬퍼,
코드만으로 파악하기 어려운 복잡한 로직, `src/components/`의 공통 UI에 작성함.
단순 코드의 동작을 그대로 읽어 주는 주석은 생략함.
