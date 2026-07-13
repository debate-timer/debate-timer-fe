# AudienceSharePage 토론 시간표 조회·초기 상태 처리 구현 계획

## 목표

`AudienceSharePage` 진입 시 공유용 토론 시간표 API를 먼저 호출하고, 조회 성공 후에만 기존 웹 소켓 연결을 시작한다. API 조회와 웹 소켓 연결이 모두 성공하기 전에는 헤더를 숨기고 콘텐츠 중앙에 회색 `LoadingSpinner`를 표시한다. 둘 중 하나라도 실패하면 페이지 중앙에 오류 아이콘, 오류 문구, 새로고침 버튼을 표시한다. 두 작업이 모두 성공하면 조회한 전체 응답을 페이지의 단일 데이터 원천으로 유지하고, `info`는 `TimerPage`와 같은 `DefaultLayout.Header` 구조에 사용한다. `table`은 이번 단계에서 소켓 상태 계산에 적용하지 않고 다음 수정 사항에서 사용할 수 있도록 페이지에 보관한다.

## 확정된 동작

- 초기화 순서는 `토론 시간표 API 조회 → 웹 소켓 연결`이다.
- API 조회 전이나 조회 중에는 웹 소켓 연결을 시도하지 않는다.
- API 조회와 웹 소켓 연결이 모두 성공해야 헤더 및 기존 관객용 콘텐츠를 표시한다.
- 초기화 중에는 헤더 없이 콘텐츠 중앙에 회색 `LoadingSpinner`를 표시한다.
- 오류는 Error Boundary로 던지지 않고 페이지 내부 오류 UI로 표시한다.
- 오류 UI는 `MdErrorOutline` 아이콘, 오류 문구, 새로고침 버튼을 세로·가로 중앙 정렬한다.
- API 조회 실패 문구는 `필요한 데이터를 불러오지 못했어요. 다시 시도해보세요.`로 한다.
- 웹 소켓 오류 문구는 오류 코드와 관계없이 `서버 연결에 실패했어요.`로 통일한다.
- API와 웹 소켓 오류가 동시에 존재하면 웹 소켓 오류 문구를 우선 표시한다.
- 새로고침 버튼은 브라우저 페이지 새로고침으로 전체 초기화 과정을 다시 시작한다.
- 헤더 왼쪽에는 테이블 이름, 중앙에는 토론 주제를 표시한다.
- 빈 문자열 또는 공백뿐인 이름/주제에는 `TimerPage`와 동일하게 각각 `테이블 이름 없음`, `주제 없음`을 표시한다.
- 헤더 오른쪽에는 공통 헤더가 제공하는 언어 선택기, 홈 버튼, 로그인/로그아웃 버튼만 유지한다. 도움말 버튼은 표시하지 않는다.
- 사용자에게 보이는 새 문구는 모두 `useTranslation()`을 통과시킨다.
- `LoadingSpinner` 내부의 기존 `aria-label="Loading"`은 이번 범위에서 변경하지 않는다.
- API 응답의 `table`은 페이지가 조회 결과의 일부로 보유하되, 이번 구현에서는 `useAudienceShareState`에 전달하거나 소켓 이벤트의 `sequence`와 결합하지 않는다.

## 구현 순서 (TDD)

1. `useAudienceShareState` 테스트에 연결 활성화 조건을 먼저 추가해, API 성공 전에는 연결하지 않고 활성화된 뒤 한 번 연결하는 동작을 명세한다.
2. `AudienceSharePage` 테스트에 API 조회와 소켓 연결의 순차 초기화, 통합 로딩, 오류 UI, 헤더 표시 조건을 먼저 추가한다.
3. `useAudienceShareState`가 연결 활성화 조건을 받을 수 있도록 최소 변경한다.
4. `AudienceSharePage`에서 기존 `useGetDebateTableDataForShare` 결과를 소켓 연결 활성화 조건과 렌더링에 연결하고, 전체 조회 결과를 이후 관객 표시 로직에서 재사용할 수 있게 페이지 스코프에 유지한다.
5. 소켓 오류 우선순위를 포함한 통합 로딩·오류·정상 UI 분기를 정리하고 헤더 정보를 추가한다.
6. 관련 Vitest를 실행한 뒤 프로젝트 lint/type check를 수행해 기존 카운트다운과 종료 흐름에 회귀가 없는지 검증한다.

## 추가 예정 파일 및 내용

- 없음.
  - 공유용 API 함수, 응답 타입, TanStack Query 훅, MSW 핸들러와 관련 테스트 파일이 이미 존재한다.
  - 오류 UI는 현재 페이지 전용이고 구조가 작으므로 별도 공용 컴포넌트를 만들지 않고 `AudienceSharePage` 안에 응집한다.

## 수정 대상 파일 및 내용

### `src/page/AudienceSharePage/hooks/useAudienceShareState.test.ts`

- 연결 비활성 상태에서는 `connect()`를 호출하지 않는 테스트를 추가한다.
- 비활성 상태에서 활성 상태로 바뀌면 웹 소켓 연결을 시작하는 테스트를 추가한다.
- 활성화 이후 unmount 시 기존 타이머와 연결을 정상적으로 정리하는지 검증한다.
- 기존 메시지 처리, 타임아웃, 소켓 오류, 종료 상태 테스트가 그대로 통과하는지 확인한다.

### `src/page/AudienceSharePage/hooks/useAudienceShareState.ts`

- API 조회 성공 전 웹 소켓 연결을 막을 수 있도록 `isEnabled` 인자 또는 동등한 명시적 옵션을 추가한다.
- 비활성 상태에서는 `connect()`를 호출하지 않고 `connecting` 상태를 유지한다.
- 활성 상태로 전환된 경우에만 연결하며, cleanup과 재렌더링으로 중복 연결이 발생하지 않도록 기존 effect 의존성을 유지한다.
- 이번 구현에서는 API 응답의 `table`을 훅에 전달하지 않으며 기존 소켓 메시지 처리 로직은 변경하지 않는다.

### `src/page/AudienceSharePage/AudienceSharePage.test.tsx`

- `useGetDebateTableDataForShare`와 `useAudienceShareState`의 반환 상태 및 호출 인자를 제어하도록 테스트 구성을 보강한다.
- 다음 동작을 TDD의 Red 단계에서 명세한다.
  - API 조회 중에는 소켓 연결이 비활성화되고 회색 로딩 스피너만 표시된다.
  - API 조회 성공 이후 소켓 연결이 활성화된다.
  - API 성공 후 소켓 연결 중에도 헤더를 숨기고 같은 로딩 스피너를 표시한다.
  - API 조회와 소켓 연결이 모두 성공한 뒤에만 헤더와 기존 `waiting`/`displaying`/`finished` 콘텐츠가 표시된다.
  - 조회 데이터의 테이블 이름과 토론 주제가 헤더 좌측과 중앙에 표시된다.
  - 이름과 주제가 공백뿐이면 `테이블 이름 없음`, `주제 없음`이 표시된다.
  - 헤더 우측에 언어 선택기, 홈, 현재 인증 상태에 맞는 로그인/로그아웃 버튼이 표시되고 도움말 버튼은 표시되지 않는다.
  - API 조회 실패 시 중앙 오류 UI와 `필요한 데이터를 불러오지 못했어요. 다시 시도해보세요.` 문구가 표시된다.
  - 웹 소켓 실패 시 중앙 오류 UI와 `서버 연결에 실패했어요.` 문구가 표시된다.
  - API 오류와 웹 소켓 오류가 함께 존재하면 웹 소켓 오류 문구가 우선 표시된다.
  - 새로고침 버튼을 누르면 브라우저 새로고침 함수가 호출된다.
- 기존 ID 검증, 타이머 카운트다운, 종료 화면 테스트의 회귀 여부를 확인한다.

### `src/page/AudienceSharePage/AudienceSharePage.tsx`

- 검증된 `tableId`로 기존 `useGetDebateTableDataForShare`를 호출한다.
- TanStack Query의 조회 성공 데이터(`GetDebateTableDataForShareResponseType`)를 페이지 변수로 유지해 이후 수정에서도 재사용 가능한 단일 데이터 원천으로 삼고, 동일 데이터를 로컬 state에 복제하지 않는다. `info`는 헤더에 사용하고 `table`은 다음 수정 사항을 위해 조회 결과 안에 그대로 보관한다.
- API 조회 성공 여부를 `useAudienceShareState`의 연결 활성화 조건으로 전달한다.
- API 조회와 소켓 상태를 다음 우선순위로 조합한다.
  1. 웹 소켓 오류: `서버 연결에 실패했어요.` 페이지 내부 오류 UI
  2. API 오류: `필요한 데이터를 불러오지 못했어요. 다시 시도해보세요.` 페이지 내부 오류 UI
  3. API 조회 중 또는 소켓 연결 중: 헤더 없는 로딩 UI
  4. 두 작업 성공: 헤더와 기존 관객용 콘텐츠
- 로딩 UI의 `LoadingSpinner`에 `color="text-gray-..."`를 지정한다.
- 오류 UI에 `MdErrorOutline`, 번역된 오류 문구, 번역된 새로고침 버튼을 세로 배치하고 전체를 화면 중앙 정렬한다.
- 새로고침 버튼 클릭 핸들러에서 브라우저 페이지를 다시 불러온다.
- 기존 소켓 오류를 Error Boundary로 던지는 `AudienceShareDisplayError` 흐름은 페이지 내부 오류 렌더링으로 대체한다. 외부 사용처가 없는 것이 확인되면 클래스와 관련 테스트를 제거한다.
- 두 초기 작업이 성공한 경우에만 다음 헤더를 렌더링한다.
  - `DefaultLayout.Header.Left`의 `HeaderTableInfo`: trim 기준 빈 값 대체 정책 적용
  - `DefaultLayout.Header.Center`의 `HeaderTitle`: trim 기준 빈 값 대체 정책 적용
  - `DefaultLayout.Header.Right`: 별도 children 없이 공통 헤더의 언어 선택기, 홈, 인증 버튼을 사용
- 디버깅용 `console.log`를 제거한다.

## 수정하지 않을 것으로 예상되는 기존 파일

- `src/apis/apis/live.ts`: `getDebateTableDataForShare`가 이미 구현되어 있다.
- `src/hooks/query/useGetDebateTableDataForShare.ts`: 기존 조회 훅을 그대로 사용하며, 페이지에서 성공 여부를 소켓 활성화 조건으로 조합한다.
- `src/hooks/query/useGetDebateTableDataForShare.test.tsx`: API 호출 및 캐시 저장 성공 경로가 이미 검증되어 있다.
- `src/mocks/handlers/live.ts`: 공유용 조회 성공 응답 핸들러가 이미 있다. 페이지 테스트는 기존 방식대로 훅을 mock한다.
- `src/components/LoadingSpinner.tsx`: 기존 `color` prop으로 회색을 지정하며, 하드코딩된 접근성 문구는 현재 PR 범위상 변경하지 않는다.
- `src/layout/components/header/StickyTriSectionHeader.tsx`: 언어 선택기, 홈, 로그인/로그아웃 버튼은 `DefaultLayout.Header.Right`가 이미 기본 제공하므로 변경하지 않는다.

## 모호한 부분 (Q&A)

- 현재 확인된 추가 모호점 없음.
