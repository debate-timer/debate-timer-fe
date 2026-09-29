# 저장소 코드 컨벤션

`src`의 코드에서 반복 확인된 관례와 검토 후 확정한 규칙을 기술함. 코드 근거와 확정 규칙이 충돌하면 확정 규칙을 새 코드와 리팩터링의 기준으로 사용함.

## 1. 조사 기준

- 조사 대상: `src`의 `.ts`, `.tsx`, `.css` 365개, 약 35,900줄
- 별도 집계: 테스트 57개, Story 50개
- 참고만 함: `old-conventions.md`, `criteria.md`
- 확정 기준: 서로 구별되는 명시적 코드 근거 3건 이상
- 2건: 확정 규칙에서 제외하고 `관찰 후보`로만 기록함
- 1건: 컨벤션으로 보지 않아 제외함
- 생성물·바이너리: `src/assets` 이미지·영상은 코드 분석에서 제외함
- 수치는 단순 문자열 출현 수가 아닌 파일 수와 구조를 함께 확인함
- 아래 `근거`는 대표 3건만 적음. 실제 출현 수가 더 많을 수 있음
- 3건 미만이거나 코드만으로 판별할 수 없던 항목은 24장의 의사결정을 거쳐 확정함

## 2. 전체 구조

| 분류            | 현행 역할                                    | 대표 위치                              |
| --------------- | -------------------------------------------- | -------------------------------------- |
| 앱 조립         | 전역 도구 초기화, Provider 조립              | `main.tsx`, `instrument.ts`, `i18n.ts` |
| 화면            | 라우트 단위 UI·기능 조립                     | `page/{PageName}/`                     |
| 공용 UI         | 여러 화면이 쓰는 UI                          | `components/{Component}/`              |
| 레이아웃        | Header·Content·Footer 조합                   | `layout/`                              |
| 클라이언트 상태 | 범용·기능별 React 훅                         | `hooks/`, `page/**/hooks/`             |
| 서버 상태       | Query·Mutation 훅                            | `hooks/query/`, `hooks/mutations/`     |
| HTTP            | Axios 인스턴스 → 요청 원시 함수 → 도메인 API | `apis/`                                |
| 실시간 통신     | STOMP 관리자·계약·React 훅                   | `apis/sockets/`, `hooks/sockets/`      |
| 데이터 소스     | API·Session 구현 선택                        | `repositories/`                        |
| 계약 타입       | 공용 도메인·요청·응답 타입                   | `types/`                               |
| 순수·경계 유틸  | 포맷·검증·저장소·관측                        | `util/`                                |
| API 모방        | 브라우저·테스트 공용 MSW 핸들러              | `mocks/`                               |
| 정적 값         | 오류·URL·샘플·패치 노트                      | `constants/`                           |

## 3. 공통 TypeScript·모듈 규칙

| 컨벤션           | 관찰 내용                                                                            | 근거(3+)                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 이름 체계        | 컴포넌트·클래스·인터페이스는 PascalCase, 변수·함수·훅은 camelCase 사용함             | `components/DialogModal/DialogModal.tsx:8`, `apis/primitives.ts:10`, `hooks/useDocumentVisibility.ts:16`                             |
| boolean 이름     | 상태·판정값에 `is`·`has`·`should`·`can` 접두어 사용함. 112개 파일에서 확인됨         | `routes/ProtectedRoute.tsx:14`, `hooks/useModal.tsx:26`, `page/TimerPage/hooks/useTimerPageState.ts:113`                             |
| 상태 setter      | `useState`를 `[value, setValue]` 쌍으로 명명함. 42개 파일에서 확인됨                 | `components/CustomRangeSlider/CustomRangeSlider.tsx:21`, `hooks/useTableShare.tsx:9`, `page/TimerPage/hooks/useTimerPageState.ts:48` |
| Ref 이름         | `useRef` 보관값에 `Ref` 접미사 사용함. 31개 파일에서 확인됨                          | `components/DropdownMenu/DropdownMenu.tsx:30`, `hooks/usePageTracking.ts:25`, `hooks/sockets/useAudienceSocket.ts:73`                |
| 상수 이름        | 모든 상수는 UPPER_SNAKE_CASE 사용함                                                  | 기존 공유 상수 관례 및 24장 확정                                                                                                     |
| 문자열·문장 형식 | 작은따옴표, 세미콜론, 2칸 들여쓰기가 지배적임                                        | `apis/endpoints.ts`, `routes/routes.tsx`, `util/languageRouting.ts`                                                                  |
| 상대 경로 import | 외부 패키지는 bare import, 저장소 코드는 상대 경로 import 사용함                     | `main.tsx:2`, `components/DialogModal/DialogModal.tsx:1`, `hooks/query/useGetPollInfo.ts:2`                                          |
| export 방식      | 주 컴포넌트와 훅은 default export함. 그 외 대상의 export 방식은 규정하지 않음        | `page/LandingPage/LandingPage.tsx:12`, `hooks/useModal.tsx:25`, 24장 확정                                                            |
| type-only import | 런타임 값이 없는 일부 타입은 `import type` 사용함                                    | `hooks/useAnalytics.ts:3`, `util/analytics/analyticsManager.ts:3`, `util/sentry.ts:2`                                                |
| 변수 선언        | `var`를 금지하고 재할당이 없으면 `const`를 사용함                                    | 코드 전반의 지배적 관례 및 24장 확정                                                                                                 |
| 함수 선언        | 컴포넌트 내부 함수는 화살표 함수, 파일 최상단·유틸리티 함수는 함수 선언문으로 작성함 | 24장 확정                                                                                                                            |
| 조건문 중괄호    | early return을 포함한 모든 조건문에 중괄호를 사용함                                  | 24장 확정                                                                                                                            |
| 주석             | 주석과 JSDoc은 한국어로 작성함                                                       | 24장 확정                                                                                                                            |

import 순서는 별도로 규정하지 않음. type-only import의 사용 여부도 현행 관찰이며 강제 규칙은 아님.

## 4. React 훅·부수 효과

| 컨벤션            | 관찰 내용                                                                                    | 근거(3+)                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 훅 이름           | 사용자 훅은 `use` 접두어와 기능명으로 명명함                                                 | `hooks/useModal.tsx:25`, `hooks/query/useGetPollInfo.ts:5`, `page/TimerPage/hooks/useNormalTimer.ts`                                |
| 범용·기능 훅 분리 | 범용 훅은 `src/hooks`, 특정 화면 훅은 해당 `page` 아래에 둠                                  | `hooks/useDebounce.ts`, `page/LandingPage/hooks/useLandingPageHandlers.ts`, `page/TimerPage/hooks/useTimerPageState.ts`             |
| 구독 정리         | DOM 이벤트 등록 effect는 같은 effect cleanup에서 해제함. 등록·해제 각각 19개 파일에서 확인됨 | `hooks/useMobile.ts:7`, `hooks/useModal.tsx:43`, `components/BackActionHandler.tsx:35`                                              |
| 시간 자원 정리    | interval·timeout을 cleanup 또는 종료 조건에서 제거함                                         | `hooks/useDebounce.ts:9`, `page/AudienceSharePage/hooks/useAudienceCountdown.ts:67`, `hooks/sockets/useChairmanSocket.ts:265`       |
| 안정된 콜백       | effect 의존성·하위 props·외부 리스너에 전달하는 제어 함수를 `useCallback`으로 감쌈           | `hooks/useModal.tsx:33`, `hooks/useDocumentVisibility.ts:20`, `page/TimerPage/hooks/useTimerPageState.ts:76`                        |
| 최신 콜백 Ref     | 구독을 다시 만들지 않고 최신 콜백을 쓰는 경우 Ref에 콜백을 동기화함                          | `hooks/useDocumentVisibility.ts:27`, `hooks/sockets/useChairmanSocket.ts:113`, `hooks/usePageTracking.ts:35`                        |
| 함수형 갱신       | 이전 상태에 의존하는 토글·증가는 함수형 setter 사용함                                        | `layout/components/header/LanguageSelector.tsx:94`, `hooks/useDragAndDrop.tsx:48`, `hooks/sockets/useChairmanSocket.ts:244`         |
| 옵션 객체         | 선택 동작이 늘어나는 훅은 기본값 `{}`인 options 객체와 내부 기본값을 사용함                  | `hooks/useModal.tsx:25`, `hooks/useDocumentVisibility.ts:20`, `hooks/sockets/useAudienceSocket.ts:48`                               |
| enabled 제어      | 조회·구독 훅은 `enabled`로 실행 여부를 외부에서 제어함                                       | `hooks/query/useGetChairmanToken.ts:17`, `hooks/query/useGetDebateTableDataForShare.ts:18`, `hooks/sockets/useAudienceSocket.ts:45` |
| layout effect     | DOM 측정·전체 화면처럼 paint 전에 동기화해야 하는 작업에만 `useLayoutEffect`를 사용함        | `hooks/useFullscreen.ts:62`, `page/TableComposition/components/TimeBoxStep/TimeBoxStep.tsx:122`, 24장 확정                          |

### 4.1 TanStack Query

| 컨벤션         | 관찰 내용                                                                           | 근거(3+)                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 조회 훅        | 조회를 `hooks/query/useGet*.ts`에서 `useQuery`로 감쌈                               | `useGetDebateTableData.ts`, `useGetPollInfo.ts`, `useGetVoterPollInfo.ts`                                 |
| queryKey       | 도메인 식별자와 파라미터를 배열 key로 구성함                                        | `useGetDebateTableData.ts:7`, `useGetPollInfo.ts:11`, `useGetOrganizationTemplates.ts:21`                 |
| 조건부 조회    | `enabled`에 ID 유효성·화면 상태를 반영함                                            | `useGetChairmanToken.ts:17`, `useGetDebateTableDataForShare.ts:18`, `useGetOrganizationTemplates.ts:23`   |
| 지역 오류 UI   | 자체 오류 UI가 필요한 조회는 `throwOnError: false`로 전역 ErrorBoundary 전파를 막음 | `useGetDebateTableData.ts:13`, `useGetDebateTableDataForShare.ts:19`, `useGetOrganizationTemplates.ts:24` |
| 변경 훅        | 변경 요청을 `hooks/mutations`에서 `mutationFn`·`onSuccess`·필요 시 `onError`로 감쌈 | `usePutDebateTable.ts`, `usePostUser.ts`, `usePatchDebateTable.ts`                                        |
| 후속 동작 주입 | 성공 후 이동·상태 변경은 훅 인자의 `onSuccess` 콜백에 위임함                        | `useAddDebateTable.ts:6`, `useCreatePoll.ts:5`, `useFetchEndPoll.ts:5`                                    |
| 중복 변경 방지 | 사용자 중복 요청 방지가 필요한 변경은 `usePreventDuplicateMutation`을 공통 사용함   | `useAddDebateTable.ts:7`, `useCreatePoll.ts:6`, `usePostVoterPollInfo.ts:6`                               |

## 5. UI 컴포넌트

| 컨벤션              | 관찰 내용                                                                                                         | 근거(3+)                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 선언 형식           | 컴포넌트는 PascalCase 함수 선언문과 default export가 지배적임. `export default function`만 125개 파일임           | `components/ClearableInput/ClearableInput.tsx:19`, `page/LandingPage/LandingPage.tsx:12`, `layout/components/main/ContentContainer.tsx:7`          |
| Props 이름          | 객체 Props는 `interface {ComponentName}Props`를 컴포넌트와 같은 파일에 둠. 82개 파일에서 확인됨                   | `ClearableInput.tsx:6`, `DialogModal.tsx:8`, `TimerController.tsx:7`                                                                               |
| Props 구조분해      | Props는 매개변수가 아니라 컴포넌트 함수 본문에서 구조분해함                                                       | 24장 확정                                                                                                                                          |
| 네이티브 속성 확장  | 래퍼 UI는 해당 HTML attribute interface를 확장해 나머지 props를 전달함                                            | `ClearableInput.tsx:6`, `IconButton/IconButton.tsx:3`, `LabeledCheckBox/LabeledCheckBox.tsx:3`                                                     |
| children 타입       | 단순 컨테이너는 `PropsWithChildren`, 명시적 계약이 필요하면 `ReactNode` 사용함                                    | `layout/defaultLayout/DefaultLayout.tsx:5`, `components/FloatingActionButton/FloatingActionButton.tsx:3`, `util/GlobalPortal/PortalConsumer.tsx:5` |
| 이벤트 이름         | 콜백 prop은 `on*`, 내부 처리 함수는 `handle*` 사용함                                                              | `DropdownMenu.tsx:13`, `TableNameAndType.tsx:20`, `page/TimerPage/components/AnswerTimeSetting.tsx:25`                                             |
| 스타일              | Tailwind utility와 제한된 공통 CSS를 사용함. 100자를 초과하는 `className` 문자열은 UPPER_SNAKE_CASE 상수로 분리함 | `ClearableInput.tsx:39`, `DropdownMenu.tsx:64`, `TimerController.tsx:29`, 24장 확정                                                                |
| 사용자 문구         | 제품 UI·접근성 문구·사용자 오류 문구는 `useTranslation()`의 `t()`를 거침. Story·개발 로그는 강제하지 않음         | `ErrorBoundary/ErrorPage.tsx:18`, `LandingPage/components/Header.tsx`, `TimerPage/components/TimerController.tsx:23`, 24장 확정                    |
| 버튼 이름           | 모든 버튼에 번역된 `aria-label`을 부여함. `title`은 보조 설명으로만 사용함                                        | `TimeBoxManageButtons.tsx:41`, `TimerController.tsx:34`, `layout/components/header/StickyTriSectionHeader.tsx:105`, 24장 확정                      |
| DT 아이콘 import    | `DT*`으로 정의된 아이콘은 해당 컴포넌트 파일에서 직접 import함. 그 외 아이콘의 export 방식은 규정하지 않음        | `components/icons/*.tsx`, 24장 확정                                                                                                                |
| 상태 ARIA           | 펼침·선택·토글·검증 상태를 `aria-expanded`·`aria-selected`·`aria-pressed`·`aria-invalid`로 노출함                 | `DropdownMenu.tsx:101`, `LanguageSelector.tsx:109`, `ClearableInput.tsx:36`                                                                        |
| 시맨틱 동작 요소    | 사용자 클릭 동작은 주로 `<button>`·`<a>`로 구현함. `<div onClick>` 패턴은 확인되지 않음                           | `TimerController.tsx:31`, `TemplateCard.tsx:56`, `AudienceFinishedPage.tsx:43`                                                                     |
| controlled 입력     | 값과 변경 콜백을 Props로 받는 입력 UI가 지배적임                                                                  | `ClearableInput.tsx:7`, `CustomRangeSlider.tsx:5`, `LabeledRadioButton/LabeledRadioButton.tsx`                                                     |
| 합성 레이아웃       | 큰 레이아웃은 compound component로 조립함                                                                         | `layout/defaultLayout/DefaultLayout.tsx:14`, `layout/components/header/StickyTriSectionHeader.tsx:39`, `util/GlobalPortal/index.ts:4`              |
| 상태별 early return | 로딩·오류·데이터 부재·타이머 유형을 상단 분기 또는 전용 렌더 함수로 분리함                                        | `TableOverviewPage.tsx:91`, `TimerView.tsx:35`, `AudienceSharePage.tsx:114`                                                                        |

기존 코드에는 접근성 레이블 누락이 남아 있을 수 있으나, 새 코드와 리팩터링에는 위 버튼 이름 규칙을 적용함.

## 6. 타입 정의·유틸리티

| 컨벤션             | 관찰 내용                                                                                      | 근거(3+)                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 객체 계약          | Props·응답·Provider 계약 등 확장 가능한 객체는 interface가 지배적임. 121개 파일에서 확인됨     | `type/type.ts:26`, `apis/responses/member.ts:4`, `util/analytics/types.ts:86`                                               |
| 유한 상태          | 상태·이벤트·모드는 문자열 literal union으로 제한함                                             | `type/type.ts:2`, `apis/sockets/error.ts:1`, `util/tableValidation.ts:28`                                                   |
| 식별 union         | 형태별 동작 차이가 크면 discriminated union으로 모델링함                                       | `apis/sockets/type.ts:37`, `page/AudienceSharePage/hooks/AudienceScreenState.ts:48`, `constants/patch_note.ts:25`           |
| 명시적 null        | “값 없음”이 도메인 상태인 필드는 <code>T &#124; null</code>로 드러냄                           | `type/type.ts:34`, `apis/sockets/type.ts:36`, `page/AudienceSharePage/hooks/EventInterpreter.ts:16`                         |
| 매핑               | 유한 key와 표시값·스타일의 대응은 `Record` 또는 Map으로 둠                                     | `type/type.ts:15`, `constants/errors.ts:1`, `util/speechType.ts:12`                                                         |
| 외부 입력 검증     | JSON·소켓·에러처럼 신뢰할 수 없는 입력은 `unknown`에서 type guard로 좁힘                       | `apis/sockets/util.ts:36`, `apis/sockets/util.ts:50`, `util/sentry.ts:141`                                                  |
| 순수 계산 분리     | 포맷·검증·인코딩·상태 해석을 React 밖의 함수로 분리함                                          | `util/formatting.ts`, `util/tableValidation.ts`, `page/AudienceSharePage/hooks/EventInterpreter.ts`                         |
| 브라우저 경계 폴백 | 브라우저 API 실패는 `try/catch`와 대체 경로·안전값으로 처리함                                  | `util/clipboard.ts:8`, `hooks/useBrowserStorage.tsx:21`, `util/jwt.ts:14`                                                   |
| 도메인 제한 상수화 | 길이·시간·재시도 제한을 이름 있는 상수로 둠                                                    | `util/tableValidation.ts:9`, `hooks/sockets/useChairmanSocket.ts:15`, `page/AudienceSharePage/hooks/getNetworkDelayMs.ts:5` |
| 타입 선언 기준     | 객체 계약은 `interface`, union·tuple·primitive alias는 `type`으로 선언함                       | 코드의 지배적 관례 및 24장 확정                                                                                             |
| JSDoc 대상         | 재사용 범위가 넓은 훅·유틸·헬퍼, 복잡한 로직, `src/components` 공통 UI에 한국어 JSDoc을 작성함 | 24장 확정                                                                                                                   |

공용 타입은 단일 `src/types/`에 모음. 기능 내부에서만 쓰는 Props·상태 타입은 해당 파일에 함께 둘 수 있음.

## 7. Storybook Story

| 컨벤션             | 관찰 내용                                                                                   | 근거(3+)                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 파일 위치          | 대상 컴포넌트 인접 또는 기능의 `stories/`에 `*.stories.tsx`로 둠                            | `components/DialogModal/DialogModal.stories.tsx`, `page/DebateEndPage/DebateEndPage.stories.tsx`, `page/TimerPage/stories/NormalTimer.stories.tsx` |
| CSF 타입           | 50개 전부 `Meta<typeof Target>` meta와 `StoryObj<typeof Target>` alias 사용함               | `ClearableInput.stories.tsx:5`, `ErrorPage.stories.tsx:5`, `TimerController.stories.tsx:4`                                                         |
| meta export        | 50개 전부 `const meta`를 default export함                                                   | `CustomRangeSlider.stories.tsx:11`, `LandingPage.stories.tsx:13`, `TimeBasedTimer.stories.tsx:25`                                                  |
| 자동 문서          | 47개가 `tags: ['autodocs']` 사용함                                                          | `DialogModal.stories.tsx:7`, `DebateEndPage.stories.tsx:7`, `TimerPage.stories.tsx:7`                                                              |
| 상태별 named Story | `Default`, `Disabled`, `On*`, `When*`, `Failed`, `Loading` 등 상태 단위 named export 사용함 | `DropdownMenu.stories.tsx:16`, `NotificationBadge.stories.tsx:14`, `LiveShareModal.stories.tsx`                                                    |
| 단순 UI는 args     | Props만으로 표현 가능한 상태는 `args` 객체 사용함                                           | `ClearableInput.stories.tsx:16`, `ErrorIndicator.stories.tsx:15`, `TimerController.stories.tsx:15`                                                 |
| 조립 UI는 render   | Wrapper·Layout·훅이 필요하면 `render` 사용함                                                | `FloatingActionButton.stories.tsx:16`, `NormalTimerTestPage.stories.tsx:57`, `VoteCompletePage.stories.tsx:17`                                     |
| 페이지 fullscreen  | 페이지 Story는 `parameters.layout = 'fullscreen'`을 사용함                                  | `AudienceFinishedPage.stories.tsx:9`, `TimerPage.stories.tsx:9`, `VoteParticipationPage.stories.tsx:8`                                             |

## 8. 테스트 코드

| 컨벤션                 | 관찰 내용                                                                                 | 근거(3+)                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| co-location            | 57개 테스트 전부 대상 파일 옆에 `{module}.test.ts(x)`로 둠                                | `util/formatting.test.ts`, `hooks/useModal.test.tsx`, `components/TimerProgressBar/TimerProgressBar.test.tsx`        |
| 행위 중심 이름         | `describe`로 대상·상황을 묶고 `it`에 기대 행위를 문장으로 씀                              | `apis/sockets/util.test.ts`, `page/TimerPage/hooks/useNormalTimer.test.ts`, `util/sentry.test.ts`, 24장 확정         |
| 한국어 설명            | 모든 suite·case 제목을 한국어로 작성함                                                    | `formatting.test.ts:4`, `useLiveShare.test.ts:20`, `AudienceFinishedPage.test.tsx:42`, 24장 확정                     |
| UI 관찰                | 컴포넌트는 Testing Library `render`·`screen`으로 사용자에게 보이는 결과를 검사함          | `UpdateModal.test.tsx`, `LiveShareModal.test.tsx`, `TableListPage.test.tsx`                                          |
| 접근 가능한 query 우선 | 역할·accessible name을 확인 가능한 곳은 `getByRole` 계열 사용함                           | `AudienceFinishedPage.test.tsx:47`, `LiveShareButton.test.tsx`, `TableNameAndType.test.tsx`                          |
| 사용자 상호작용        | 클릭·입력은 `userEvent.setup()`과 `await user.*` 사용함                                   | `UpdateModal.test.tsx:215`, `useModal.test.tsx`, `TimerPage.test.tsx`                                                |
| 훅 테스트              | 훅은 `renderHook`, 상태 변경은 `act`, 비동기 결과는 `waitFor` 사용함                      | `useSocket.test.ts`, `usePageTracking.test.tsx`, `useGetOrganizationTemplates.test.tsx`                              |
| 시간 제어              | timer 기반 로직은 fake timer로 시간 진행을 명시하고 real timer로 복구함                   | `hooks/useDocumentVisibility.test.ts`, `useNormalTimer.test.ts`, `RoundControlRow.test.tsx`                          |
| 외부 경계 Mock         | API는 MSW, SDK·소켓·브라우저 경계는 `vi.mock`·`vi.spyOn` 사용함                           | `apis/apis/live.test.ts`, `apis/sockets/SocketManager.test.ts`, `util/analytics/providers/amplitudeProvider.test.ts` |
| Provider wrapper       | Router·Query·Portal·i18n 의존 UI는 테스트 wrapper에서 실제 Provider 조립함                | `DialogModal.test.tsx`, `TableCompositionPage.test.tsx`, `UpdateModalWrapper.test.tsx`                               |
| 경계값                 | 정상값뿐 아니라 null·잘못된 타입·최솟값·중복 이벤트·재연결을 검사함                       | `apis/sockets/util.test.ts`, `util/jwt.test.ts`, `page/AudienceSharePage/hooks/useAudienceShareState.test.ts`        |
| 반복 케이스            | 같은 계약의 입력 조합은 `it.each`로 묶음                                                  | `useAudienceShareState.test.ts`, `AudienceNormalTimer.test.tsx`, `TimerProgressBar.test.tsx`, 24장 확정              |
| TDD 절차               | Red에서 실패 확인 → Green에서 최소 구현 통과 → Refactor 후 전체 테스트 통과 순으로 검증함 | 24장 확정                                                                                                            |

기존 코드에는 `test`가 남아 있을 수 있으나 새 테스트는 `it`으로 작성함. `data-testid`는 역할·문구 query와 병행됨.

## 9. 저수준 HTTP 네트워킹

| 컨벤션              | 관찰 내용                                                             | 근거(3+)                                                                                   |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 단일 Axios 인스턴스 | base URL·timeout·JSON·credential·interceptor를 `axiosInstance`에 모음 | `apis/axiosInstance.ts:31`, `apis/axiosInstance.ts:44`, `apis/axiosInstance.ts:91`         |
| 원시 요청 함수      | 상위 API는 `request<T>(method, endpoint, data, params)`만 호출함      | `apis/primitives.ts:23`, `apis/apis/live.ts:12`, `apis/apis/poll.ts:32`                    |
| HTTP method 제한    | method를 문자열 literal union으로 제한함                              | `apis/primitives.ts:7`, `apis/apis/debateTable.ts:31`, `apis/apis/poll.ts:32`              |
| 인증 주입           | access token은 request interceptor에서 헤더에 추가함                  | `axiosInstance.ts:45`, `util/accessToken.ts:1`, `apis/apis/member.ts:34`                   |
| 401 재발급          | 최초 401만 `_retry`로 가드하고 토큰 교체 후 원 요청을 재시도함        | `axiosInstance.ts:95`, `axiosInstance.ts:99`, `axiosInstance.ts:118`                       |
| 실패 정규화         | Axios 오류를 상태·data를 가진 `APIError`로 변환함                     | `primitives.ts:10`, `primitives.ts:38`, `components/ErrorBoundary/ErrorPage.tsx:30`        |
| 관측 중복 방지      | interceptor에서 수집한 오류에 표식을 전달해 Boundary 재수집을 막음    | `axiosInstance.ts:57`, `primitives.ts:57`, `components/ErrorBoundary/ErrorBoundary.tsx:39` |

## 10. 고수준 API

| 컨벤션             | 관찰 내용                                                                        | 근거(3+)                                                                                             |
| ------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 도메인 파일        | 요청 함수를 `apis/apis/{domain}.ts`에 모음                                       | `apis/apis/debateTable.ts`, `apis/apis/member.ts`, `apis/apis/poll.ts`                               |
| HTTP 동사 접두어   | 함수명을 `get*`·`post*`·`put*`·`patch*`·`delete*`로 시작함. 15개 함수에서 확인됨 | `live.ts:9`, `poll.ts:30`, `debateTable.ts:68`                                                       |
| endpoint 주석      | 함수 위에 `// METHOD /api/...` 계약을 적음                                       | `debateTable.ts:25`, `member.ts:50`, `poll.ts:29`                                                    |
| URL 중앙화         | 공통 URL은 `ApiUrl`에서 만들고 동적 segment만 함수에서 붙임                      | `apis/endpoints.ts:7`, `apis/apis/live.ts:13`, `apis/apis/poll.ts:32`                                |
| 응답 data 반환     | AxiosResponse를 화면에 노출하지 않고 성공 body인 `response.data` 반환함          | `live.ts:19`, `member.ts:61`, `poll.ts:39`                                                           |
| 요청·응답 타입     | API 계약 타입은 method+domain+`RequestType`/`ResponseType` 형태로 분리함         | `requests/debateTable.ts:3`, `responses/live.ts:3`, `responses/poll.ts:4`                            |
| URL 동적 값 인코딩 | path·query·공유 payload의 동적 문자열은 `encodeURIComponent` 적용함              | `apis/apis/live.ts:14`, `util/arrayEncoding.ts:8`, `page/LandingPage/components/TemplateCard.tsx:62` |
| API 직접 테스트    | 모든 도메인 API 함수에 URL·method·parameter·응답 반환을 검증하는 MSW 테스트를 둠 | `apis/apis/live.test.ts`, `apis/apis/organization.test.ts`, 24장 확정                                |

응답 타입명은 일관되나 요청 타입 파일은 1개뿐임. “모든 요청 body는 별도 RequestType 파일로 분리”까지는 현행 규칙으로 확정할 수 없음.

## 11. 상수

| 컨벤션        | 관찰 내용                                                  | 근거(3+)                                                                     |
| ------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 상수 이름     | 모든 상수는 UPPER_SNAKE_CASE 사용함                        | 기존 공유 상수 관례 및 24장 확정                                             |
| 불변 추론     | literal 객체·배열은 필요한 경우 `as const`로 좁힘          | `constants/urls.ts:1`, `constants/reviews.ts:1`, `util/tableValidation.ts:9` |
| 관련 값 묶기  | URL·오류·이벤트·제한값을 목적별 객체 또는 전용 파일로 묶음 | `constants/urls.ts`, `constants/errors.ts`, `util/analytics/constants.ts`    |
| 유한 key 매핑 | 문자열 분기를 `Record<Union, Value>`로 표현함              | `type/type.ts:15`, `constants/errors.ts:1`, `util/analytics/constants.ts:4`  |

기존 코드의 camelCase 상수는 새 규칙을 적용하지 않은 사례임. 새 코드와 리팩터링에서는 UPPER_SNAKE_CASE를 사용함.

## 12. MSW API 모방

| 컨벤션            | 관찰 내용                                                            | 근거(3+)                                                                                                             |
| ----------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 도메인 핸들러     | 도메인별 `{domain}Handlers` 배열로 분리함                            | `mocks/handlers/customize.ts:7`, `mocks/handlers/live.ts:8`, `mocks/handlers/poll.ts:9`                              |
| 실제 URL 재사용   | 핸들러도 `ApiUrl`을 사용해 실제 API 경로와 맞춤                      | `customize.ts:2`, `live.ts:2`, `poll.ts:2`                                                                           |
| MSW v2 형식       | `http.{method}`와 `HttpResponse.json`/생성자를 사용함                | `member.ts:6`, `organization.ts:6`, `static_asset.ts:8`                                                              |
| 요청 검사         | path param·query·body를 handler 인자에서 읽음                        | `customize.ts:10`, `member.ts:13`, `poll.ts:28`                                                                      |
| 계약 타입 재사용  | 복잡한 body·response는 API response 타입으로 단언·주석함             | `customize.ts:3`, `live.ts:3`, `poll.ts:3`                                                                           |
| 단일 집합 조립    | `allHandlers`에서 도메인 배열을 spread해 한 집합으로 만듦            | `handlers/global.ts:35`, `mocks/browser.ts:2`, `mocks/server.ts:2`                                                   |
| 실행 환경 공유    | 개발 브라우저와 Node 테스트는 같은 `allHandlers`를 시작점으로 사용함 | `mocks/browser.ts`, `mocks/server.ts`, 24장 확정                                                                     |
| 테스트별 override | API 테스트는 `server.use()`로 해당 시나리오 handler만 덮어씀         | `apis/apis/live.test.ts:27`, `apis/apis/organization.test.ts:23`, `hooks/query/useGetOrganizationTemplates.test.tsx` |

## 13. 라우팅

| 컨벤션           | 관찰 내용                                                               | 근거(3+)                                                                                |
| ---------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 단일 라우트 표   | `appRoutes` 항목에 `path`·`element`·`requiresAuth`를 함께 둠            | `routes/routes.tsx:23`, `routes/routes.tsx:39`, `routes/routes.tsx:99`                  |
| 인증 장식        | 라우트 표를 map해 인증 항목만 `ProtectedRoute`로 감쌈                   | `routes/routes.tsx:107`, `routes/ProtectedRoute.tsx:10`, `routes/ProtectedRoute.tsx:23` |
| 언어 wrapper     | 기본 경로와 `:lang` 경로가 같은 route 목록·언어 동기화 wrapper를 공유함 | `routes/routes.tsx:128`, `routes/routes.tsx:133`, `routes/LanguageWrapper.tsx:10`       |
| 경로 생성 helper | 이동 경로는 `buildLangPath`로 현재 언어를 보존함                        | `ProtectedRoute.tsx:21`, `AudienceFinishedPage.tsx:28`, `TableOverviewPage.tsx:75`      |
| route hook       | 화면은 `useParams`·`useSearchParams`·`useNavigate`로 입력·이동을 처리함 | `AudienceSharePage.tsx:49`, `TableSharingPage.tsx:53`, `OAuthPage/OAuth.tsx:17`         |
| 식별자 검증      | 문자열 param을 숫자로 바꾼 뒤 유효성·존재 여부를 검사함                 | `AudienceSharePage.tsx:56`, `DebateVotePage.tsx`, `VoteParticipationPage.tsx`           |
| replace 이동     | 정규화·완료·인증 redirect는 history를 남기지 않도록 `replace` 사용함    | `LanguageWrapper.tsx:24`, `ProtectedRoute.tsx:29`, `AudienceSharePage.tsx:108`          |

## 14. 오류 처리·관측

| 컨벤션                | 관찰 내용                                                                    | 근거(3+)                                                                                |
| --------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 도메인 Error          | 오류 종류·상태·원인을 보존하는 `Error` 하위 클래스를 둠                      | `apis/primitives.ts:10`, `apis/sockets/error.ts:7`, `page/AudienceSharePage/error.ts:8` |
| 전역 렌더 fallback    | 라우트 Outlet을 class ErrorBoundary로 감싸 fallback 화면을 렌더링함          | `ErrorBoundary.tsx:24`, `ErrorBoundaryWrapper.tsx:4`, `routes/routes.tsx:118`           |
| 지역 복구 UI          | 복구 가능한 조회 오류는 `isError` 분기와 retry callback을 표시함             | `TableOverviewPage.tsx:91`, `TemplateSelection.tsx:19`, `AudienceSharePage.tsx:121`     |
| 외부 오류 보존        | 기술 오류를 `unknown`·원본 error·detail로 보존하고 사용자 상태와 분리함      | `APIError.data`, `SocketError.detail`, `AudienceShareError.technicalError`              |
| Sentry 분류           | 경로·HTTP 상태·기능으로 level·fingerprint·tag를 생성함                       | `util/sentry.ts:71`, `apis/axiosInstance.ts:57`, `ErrorBoundary.tsx:41`                 |
| 민감 정보 제거        | URL query·요청/응답 context·Replay의 개인정보를 마스킹함                     | `util/sentry.ts:175`, `instrument.ts:17`, `axiosInstance.ts:71`                         |
| 중복·비대응 오류 제외 | 이미 수집한 오류, 취소, 오프라인, 복구 가능한 401을 제외함                   | `util/sentry.ts:141`, `util/sentry.ts:116`, `axiosInstance.ts:126`                      |
| 안전 폴백             | 저장소·JWT·클립보드처럼 실패 가능한 경계는 null·false·초기값·대체 API 반환함 | `hooks/useBrowserStorage.tsx:21`, `util/jwt.ts:21`, `util/clipboard.ts:16`              |

## 15. 실시간 소켓

| 컨벤션        | 관찰 내용                                                                                           | 근거(3+)                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 계층 분리     | STOMP 수명은 `SocketManager`, React 연결은 `useSocket`, 역할별 정책은 audience/chairman 훅이 담당함 | `apis/sockets/SocketManager.ts`, `hooks/sockets/useSocket.ts`, `hooks/sockets/useChairmanSocket.ts`   |
| 싱글톤        | 소켓 연결 하나를 private constructor와 `getInstance()`로 관리함                                     | `SocketManager.ts:68`, `SocketManager.ts:74`, `SocketManager.ts:356`                                  |
| 구독 복구     | 구독 정보와 활성 구독을 별도 Map에 저장하고 재연결 시 복구함                                        | `useSocket.ts:29`, `useSocket.ts:32`, `useSocket.ts:148`                                              |
| 수명 정리     | 훅 unmount·room 변경 시 listener와 subscription을 해제함                                            | `useSocket.ts:184`, `useAudienceSocket.ts:154`, `useChairmanSocket.ts:256`                            |
| 런타임 검증   | 수신 JSON은 `unknown`으로 파싱 후 type guard를 통과한 값만 반영함                                   | `apis/sockets/util.ts:50`, `useAudienceSocket.ts:111`, `useChairmanSocket.ts:49`                      |
| 순서 보장     | message version을 단조 증가시키고 청중은 오래된 version을 무시함                                    | `useChairmanSocket.ts:296`, `useAudienceSocket.ts:125`, `apis/sockets/type.ts:43`                     |
| 재연결 정책   | 지수 backoff·jitter·횟수/시간 제한을 옵션화함                                                       | `SocketManager.ts:304`, `SocketManager.ts:343`, `useChairmanSocket.ts:25`                             |
| 상태 snapshot | 재연결·신규 청중·heartbeat에 `SYNC`를 보내 현재 상태를 복원함                                       | `useChairmanSocket.ts:186`, `useChairmanSocket.ts:261`, `page/TimerPage/buildTimerPayloadForShare.ts` |

## 16. Repository·저장소

| 컨벤션          | 관찰 내용                                                    | 근거(3+)                                                                                                           |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 인터페이스 우선 | 화면이 요구하는 CRUD 계약을 `DebateTableRepository`로 정의함 | `repositories/DebateTableRepository.ts:12`, `ApiDebateTableRepository.ts:16`, `SessionDebateTableRepository.ts:16` |
| 구현 분리       | 서버 저장과 sessionStorage 저장을 별도 구현으로 둠           | `ApiDebateTableRepository.ts`, `SessionDebateTableRepository.ts`, `util/sessionStorage.ts`                         |
| 런타임 선택     | 게스트 여부에 따라 `getRepository()`가 구현을 선택함         | `DebateTableRepository.ts:23`, `hooks/mutations/useAddDebateTable.ts:8`, `hooks/query/useGetDebateTableData.ts:9`  |
| 구현 singleton  | 구현 인스턴스를 파일에서 한 번 만들고 default export함       | `ApiDebateTableRepository.ts:38`, `SessionDebateTableRepository.ts:42`, `DebateTableRepository.ts:27`              |

## 17. 분석·추적 코드

| 컨벤션           | 관찰 내용                                                                  | 근거(3+)                                                                                         |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| typed event map  | 이벤트 이름과 전용 payload를 `AnalyticsEventMap`으로 결합함                | `util/analytics/types.ts:83`, `util/analytics/constants.ts:4`, `hooks/useAnalytics.ts:12`        |
| provider adapter | SDK별 구현이 공통 `AnalyticsProvider`를 구현함                             | `amplitudeProvider.ts:12`, `ga4Provider.ts:11`, `noopProvider.ts:4`                              |
| manager fan-out  | 화면은 SDK를 직접 호출하지 않고 manager·hook을 통해 모든 provider에 전파함 | `analyticsManager.ts:8`, `analytics/index.ts:13`, `hooks/useAnalytics.ts:10`                     |
| 공통 속성 합성   | user type·language·page path를 manager가 모든 이벤트에 추가함              | `analyticsManager.ts:28`, `analyticsManager.ts:43`, `analyticsManager.ts:83`                     |
| payload 이름     | 분석 이벤트·속성은 snake_case 사용함                                       | `analytics/types.ts:10`, `analytics/types.ts:35`, `analytics/types.ts:70`                        |
| 임시 attribution | 로그인·템플릿 출처는 sessionStorage에 저장 후 한 번 소비함                 | `analytics/loginTrigger.ts:24`, `analytics/loginTrigger.ts:40`, `analytics/templateOrigin.ts:18` |
| 실패 격리        | provider 오류는 manager에서 잡아 다른 provider 전파를 계속함               | `analyticsManager.ts:18`, `analyticsManager.ts:45`, `analyticsManager.ts:98`                     |

## 18. 앱 초기화·국제화

| 컨벤션         | 관찰 내용                                                                    | 근거(3+)                                                                          |
| -------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Provider 조립  | 앱 진입점에서 QueryClient → Portal → Router 순으로 조립함                    | `main.tsx:76`, `main.tsx:77`, `main.tsx:78`                                       |
| 개발 모킹 선행 | mock 모드는 worker 시작 완료 뒤 앱을 초기화함                                | `main.tsx:24`, `main.tsx:38`, `mocks/browser.ts:4`                                |
| 언어 source    | 지원 언어를 ko/en으로 제한하고 path → localStorage → navigator 순으로 감지함 | `i18n.ts:10`, `i18n.ts:15`, `util/languageRouting.ts:1`                           |
| 기본 언어 URL  | ko는 prefix를 제거하고 다른 언어는 `/{lang}`을 붙임                          | `languageRouting.ts:20`, `languageRouting.ts:25`, `routes/LanguageWrapper.tsx:20` |
| 언어 변경 전파 | 언어 변경을 i18n뿐 아니라 Sentry·analytics 사용자 속성에도 반영함            | `main.tsx:50`, `main.tsx:61`, `routes/LanguageWrapper.tsx:37`                     |

## 19. 디렉터리·파일 배치

| 컨벤션            | 관찰 내용                                                                      | 근거(3+)                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 공용 컴포넌트     | `components/{PascalCase}/{PascalCase}.tsx`에 둠                                | `components/DialogModal/DialogModal.tsx`, `components/DropdownMenu/DropdownMenu.tsx`, `components/VolumeBar/VolumeBar.tsx` |
| 페이지            | `page/{PageName}/{PageName}.tsx`에 라우트 화면을 둠                            | `page/LandingPage/LandingPage.tsx`, `page/TimerPage/TimerPage.tsx`, `page/TableOverviewPage/TableOverviewPage.tsx`         |
| 기능 응집         | 페이지 전용 UI·훅·Story를 해당 페이지 아래 `components`·`hooks`·`stories`에 둠 | `page/AudienceSharePage/`, `page/LandingPage/`, `page/TimerPage/`                                                          |
| 테스트·Story 인접 | 재사용 UI는 구현 옆, 큰 기능 Story는 기능 `stories` 폴더에 둠                  | `components/ClearableInput/`, `page/TableComposition/components/TimeBox/`, `page/TimerPage/stories/`                       |
| 비컴포넌트 폴더   | 기술·역할 폴더는 camelCase 또는 소문자 사용함                                  | `hooks/mutations`, `apis/responses`, `mocks/handlers`                                                                      |

## 20. 소수 사례의 확정 결과

코드 사례가 2건뿐이었던 항목은 24장의 검토를 거쳐 다음과 같이 판정함.

| 후보                                | 두 근거                                                                                         | 확정 결과                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `React.FC` 화살표 컴포넌트          | `components/KeyIcon/KeyIcon.tsx:8`, `components/LoadingSpinner.tsx:21`                          | 함수 선언형 컴포넌트 규칙의 예외로 보고 컨벤션에서 제외함      |
| Repository 구현 클래스              | `ApiDebateTableRepository.ts:16`, `SessionDebateTableRepository.ts:16`                          | 데이터 소스 interface와 구현체를 분리하는 규칙으로 확정함      |
| `useLayoutEffect`로 DOM 직전 동기화 | `hooks/useFullscreen.ts:62`, `page/TableComposition/components/TimeBoxStep/TimeBoxStep.tsx:122` | paint 전 동기화가 필요한 작업에 한정하는 규칙으로 확정함       |
| MSW 실행 진입점                     | `mocks/browser.ts`, `mocks/server.ts`                                                           | 브라우저와 Node 테스트가 같은 handler 집합을 공유하도록 확정함 |
| 고수준 API 직접 MSW 테스트          | `apis/apis/live.test.ts`, `apis/apis/organization.test.ts`                                      | 모든 도메인 API 함수에 직접 MSW 테스트를 작성하도록 확정함     |

## 21. `old-conventions.md` 대조

| 과거 규칙                          | 판정 | 근거·확정 내용                                                         |
| ---------------------------------- | ---- | ---------------------------------------------------------------------- |
| `var` 금지, 기본 `const`           | 유지 | `var` 선언이 확인되지 않고 `const`가 지배적임                          |
| 컴포넌트 함수 선언문               | 유지 | `export default function` 125개 파일이며 `React.FC` 2개는 예외로 봄    |
| 컴포넌트 PascalCase                | 유지 | `components`, `page`, `layout` 전반에서 확인됨                         |
| Props는 interface·`ComponentProps` | 유지 | 82개 파일에서 확인됨                                                   |
| Props는 컴포넌트 내부 구조분해     | 유지 | 혼재했던 방식을 함수 본문 구조분해로 통일하기로 확정함                 |
| 이벤트 prop `on*`, 내부 `handle*`  | 유지 | 93개·47개 파일에서 각각 확인됨                                         |
| boolean은 `is*` 허용               | 유지 | `is`와 함께 `has`·`should`·`can`도 허용함                              |
| 모든 상수 UPPER_SNAKE_CASE         | 유지 | 내부 구현값을 포함한 모든 상수에 적용하기로 확정함                     |
| 객체는 interface, union은 type     | 유지 | 객체는 `interface`, union·tuple·primitive alias는 `type`으로 확정함    |
| 조건문은 항상 중괄호               | 유지 | early return을 포함한 모든 조건문에 강제하기로 확정함                  |
| `for`문 자제                       | 유지 | 일반 `for`는 소켓 테스트 외 제품 코드에서 1건 수준임                   |
| 주 컴포넌트·훅 default export      | 유지 | 주 컴포넌트와 훅에 적용하고 그 외 export 방식은 규정하지 않기로 확정함 |
| 공용 타입은 `types/`               | 유지 | 공용 타입을 단일 `src/types/`에 모으기로 확정함                        |
| 작은따옴표·세미콜론·2칸            | 유지 | 전 코드 포맷에서 지배적임                                              |

## 23. 확정 핵심 요약

1. UI는 함수 선언형 default component, 함수 본문 Props 구조분해, Tailwind, 제품 문구 i18n을 중심으로 작성함.
2. 로컬 상태·부수 효과는 custom hook으로 분리하고 listener·timer cleanup을 effect와 함께 두며, paint 전 동기화에만 `useLayoutEffect`를 사용함.
3. 서버 상태는 Query·Mutation 훅, HTTP는 Axios instance → `request<T>` → 도메인 API의 3층으로 분리함.
4. 외부 데이터는 명시적 null·literal union·type guard·도메인 Error로 경계를 세움.
5. 테스트는 구현 인접 배치, 한국어 `describe`·`it`, Testing Library, MSW, fake timer와 Red-Green-Refactor 절차를 사용함.
6. Story는 전부 typed CSF 형식이며 상태별 named export를 둠.
7. 실시간 통신·Repository·analytics는 interface/manager와 역할별 adapter를 둬 변경 지점을 격리함.
8. 모든 상수는 UPPER_SNAKE_CASE, 모든 조건문은 중괄호를 사용하며 공용 타입은 `src/types/`에 모음.
9. 한국어 주석을 사용하고 재사용 훅·유틸·헬퍼, 복잡한 로직, 공통 UI에 JSDoc을 작성함.

## 24. 컨벤션 의사결정 기록

코드만으로 확정할 수 없던 항목의 최종 결정과 판단 근거를 보존함. 확정 내용은 관련 장에 반영했으며, 이 장은 결정 이력으로 사용함.

### 24.1 2건 관찰 후보

#### 1. Repository 구현 클래스

검토 대상: 데이터 소스 구현을 공통 interface의 class 구현체와 singleton instance로 작성할지 결정함.

```ts
interface DebateTableRepository {
  getTable(id?: number): Promise<DebateTableData>;
}

class ApiDebateTableRepository implements DebateTableRepository {
  async getTable(id: number) {
    return getDebateTableData(id);
  }
}

export default new ApiDebateTableRepository();
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 데이터 소스 인터페이스와 구현체로 분리하는 방안 유지

#### 2. `useLayoutEffect` 사용 기준

검토 대상: DOM 측정·전체 화면 상태처럼 paint 전에 동기화할 작업에만 `useLayoutEffect`를 사용할지 결정함.

```ts
// paint 전 DOM 상태 동기화
useLayoutEffect(() => {
  updateElementHeight(elementRef.current?.clientHeight ?? 0);
}, []);

// 일반 구독·데이터 동기화
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 네가 파악한 현재 컨벤션 유지

#### 3. 브라우저·테스트의 MSW handler 공유

검토 대상: 개발 브라우저와 Node 테스트가 항상 같은 `allHandlers`를 시작점으로 사용할지 결정함.

```ts
// browser.ts
export const worker = setupWorker(...allHandlers);

// server.ts
export const server = setupServer(...allHandlers);
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 브라우저와 테스트가 같은 핸들러를 공유하는 컨벤션 유지

#### 4. 고수준 API의 직접 MSW 테스트

검토 대상: 도메인 API 함수마다 URL·method·parameter·응답 반환을 검증하는 직접 테스트를 둘지 결정함.

```ts
server.use(
  http.get(`${ApiUrl.live}/table/customize/:tableId`, ({ params }) => {
    expect(params.tableId).toBe('302');
    return HttpResponse.json(mockResponse);
  }),
);

expect(await getDebateTableDataForShare(302)).toEqual(mockResponse);
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 모든 API 함수에 테스트 코드를 함께 두는 규칙 명시

### 24.2 과거 규칙과 현재 코드가 다른 항목

#### 5. Props 구조분해 위치

검토 대상: Props를 함수 본문에서만 구조분해할지, 매개변수 구조분해도 허용할지 결정함.

```tsx
// 함수 본문 구조분해
function Button(props: ButtonProps) {
  const { label, onClick } = props;
  return <button onClick={onClick}>{label}</button>;
}

// 매개변수 구조분해
function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 모든 경우에서 함수 본문 구조분해로 통일

#### 6. 비컴포넌트 함수 선언 형식

검토 대상: 모든 비컴포넌트 함수를 화살표 함수로 통일할지, 함수 선언문도 허용할지 결정함.

```ts
// 화살표 함수
export const validateTableName = (value: string): FieldError => {
  return value.length > 20 ? 'LENGTH' : null;
};

// 함수 선언문
export function getNetworkDelayMs(serverTime: number, receivedAt: number) {
  return receivedAt - serverTime;
}
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 함수가 컴포넌트 내에서 선언되는 경우 화살표 함수로 작성하고, 컴포넌트 외부에서 작성되는 경우(유틸리티 함수나 파일 최상단에 작성될 때) 함수 선언문으로 작성

#### 7. 상수 대문자 표기 범위

검토 대상: 모든 `const`가 아니라 공유·도메인 상수에만 UPPER_SNAKE_CASE를 적용할지 결정함.

```ts
// 공유·도메인 상수
export const ERROR_STATUS_TABLE = { 404: '찾을 수 없음' } as const;

// 파일 내부 구현값
const requestTimeoutMs = 5000;
const currentMode = import.meta.env.MODE;
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 모든 상수를 UPPER_SNAKE_CASE로 작성

#### 8. `interface`와 `type`의 선택 기준

검토 대상: 객체는 `interface`, union·tuple·primitive alias는 `type`으로 제한할지 결정함.

```ts
interface User {
  id: string;
  name: string;
}

type TimerState = 'default' | 'warning' | 'danger';

// 현재 존재하는 객체 type 예외
type SentryMetadata = {
  status: number | undefined;
  endpoint: string;
};
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 네가 파악한 현재 컨벤션 "객체는 `interface`, union·tuple·primitive alias는 `type`으로 제한"을 유지

#### 9. 한 줄 조건문의 중괄호

검토 대상: early return을 포함한 모든 조건문에 중괄호를 강제할지 결정함.

```ts
// 중괄호 사용
if (!data) {
  return null;
}

// 한 줄 early return
if (!data) return null;
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 모든 경우에 중괄호 강제

#### 10. default·named export 선택 기준

검토 대상: 주 컴포넌트만 default export할지, 단일 값도 default export할지, 전부 named export할지 결정함.

```ts
// 주 컴포넌트 default export
export default function TimerPage() {}

// 단일 유틸 named export
export async function copyToClipboard(text: string): Promise<boolean> {
  await navigator.clipboard.writeText(text);
  return true;
}

// 여러 계약 named export
export type TimerEvent = 'PLAY' | 'STOP';
export const TIMER_INTERVAL_MS = 1000;
```

> 결정(유지/폐기/수정): 수정
>
> 확정 규칙/메모: 주 컴포넌트, 훅을 default export하도록 규칙을 명시하나, 그 외 케이스에 대해서는 언급하지 않는다.

#### 11. 공용 타입의 배치

검토 대상: 공용 타입을 단일 `types/`에 모을지, 도메인·계층 가까이에 둘지 결정함.

```text
# 중앙 집중형
src/types/timer.ts
src/types/member.ts

# 현재의 근접 배치형
src/type/type.ts
src/apis/requests/debateTable.ts
src/apis/responses/debateTable.ts
src/page/TimerPage/hooks/useTimerPageState.ts
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 단일 types/에 모음

#### 12. SVG·아이콘 export 방식

검토 대상: SVG를 asset index에서 일괄 export할지, React 아이콘 컴포넌트를 파일에서 직접 import할지 결정함.

```ts
// asset index 방식
export { ReactComponent as HomeIcon } from './home.svg';
import { HomeIcon } from '@/assets/icons';

// 현재 직접 import 방식
import DTHome from '../../components/icons/Home';
```

> 결정(유지/폐기/수정): 수정
>
> 확정 규칙/메모: `DT*`으로 정의된 아이콘의 경우만 직접 import하는 것으로 명시하고 그 외 케이스에 대해서는 언급하지 않는다.

#### 13. 스타일 배치 방식

검토 대상: 컴포넌트별 style 파일을 둘지, Tailwind utility와 제한된 공통 CSS를 사용할지 결정함.

```tsx
// 컴포넌트별 style 파일
import * as S from './Button.style';
return <S.Button>저장</S.Button>;

// 현재 Tailwind 방식
return (
  <button className="rounded-full bg-brand px-4 py-2 hover:bg-brand-hover">
    저장
  </button>
);
```

> 결정(유지/폐기/수정): 수정
>
> 확정 규칙/메모: Tailwind CSS와 제한된 공통 CSS를 사용함. `className` 문자열이 100자를 초과하면 `const BUTTON_STYLE: string = 'flex flex-row'`처럼 UPPER_SNAKE_CASE 상수로 분리함.

### 24.3 별도 기준이 없는 항목

#### 14. import 순서

검토 대상: import 그룹과 그룹 내부 순서를 강제할지 결정함.

```ts
// 예시 순서
import { useEffect } from 'react'; // 1. 외부 패키지
import type { AxiosError } from 'axios'; // 2. 외부 타입

import TimerPage from '../page/TimerPage'; // 3. 내부 값
import type { TimerState } from '../type/type'; // 4. 내부 타입

import './index.css'; // 5. side effect·style
```

> 결정(유지/폐기/수정): 폐기
>
> 확정 규칙/메모: 순서는 전혀 중요하지 않으며 불필요한 컨벤션이 추가 작업을 유도할 수 있어 폐기한다.

#### 15. 테스트 함수 이름

검토 대상: Vitest case를 `it` 또는 `test` 중 하나로 통일할지 결정함.

```ts
describe('타이머', () => {
  it('0초에서 정지한다', () => {});
  test('초기화하면 기본값으로 돌아간다', () => {});
});
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: `it`으로 통일한다.

#### 16. 사용자 문구의 i18n 적용 범위

검토 대상: 제품 UI, 접근성 문구, 오류, Story, 개발 로그 중 어디까지 `t()`를 강제할지 결정함.

```tsx
// 번역 적용
<button aria-label={t('타이머 초기화')}>{t('초기화')}</button>;

// literal 예외 후보
console.error('Failed to load data');
export const Default: Story = { args: { label: '샘플 버튼' } };
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 제품 UI, 접근성 문구, 오류까지만 강제한다.

#### 17. 아이콘 버튼의 접근 가능한 이름

검토 대상: 텍스트 없는 모든 버튼에 번역된 `aria-label`을 강제하고 `title`은 보조로만 사용할지 결정함.

```tsx
// 접근 가능한 이름 있음
<button type="button" aria-label={t('삭제하기')}>
  <DeleteIcon aria-hidden="true" />
</button>

// 이름 없음
<button type="button">
  <DeleteIcon />
</button>
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 모든 버튼에 `aria-label`을 강제하고 `title`은 보조로 사용하는 네 제안을 수용한다.

#### 18. TDD 작업 절차

검토 대상: 코드 변경 시 Red → Green → Refactor 순서와 단계별 검증을 저장소 규칙으로 강제할지 결정함.

```text
1. Red: 실패하는 테스트 추가 후 실패 확인
2. Green: 최소 구현 후 해당 테스트 통과 확인
3. Refactor: 중복·구조 개선 후 전체 테스트 통과 확인
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: Red → Green → Refactor 순서와 단계별 검증으로 구성된 네 제안을 수용한다.

#### 19. 주석 언어·JSDoc 적용 범위

검토 대상: 주석 언어와 JSDoc 대상(공개 API·복잡한 훅·경계 계약 등)을 정할지 결정함.

```ts
/**
 * 서버 시각과 수신 시각의 차이를 ms로 계산함.
 * 유효하지 않은 값은 0을 반환함.
 */
export function getNetworkDelayMs(
  serverTime: number | null,
  receivedAt: number,
): number {
  // 기기 시계 차이는 네트워크 지연으로 보지 않음
  return Math.max(0, receivedAt - (serverTime ?? receivedAt));
}
```

> 결정(유지/폐기/수정): 유지
>
> 확정 규칙/메모: 주석은 한국어로 적는다. 추가로, 모든 테스트 케이스와 스위트의 이름 역시 한국어로 적는다. JSDoc 작성은 다음 경우로 한정한다:
>
> - 재사용 범위가 넓은 커스텀 훅
> - 재사용 범위가 넓은 유틸리티 및 헬퍼 함수
> - 로직이 복잡하거나 코드로 파악하기 어려워 추가 설명이 필요한 경우 (e.g., 현재 저장소 내 소켓 연결 실패 시 지수 백오프 정책 등)
> - 공통 UI 컴포넌트 (프로젝트 내에서는 src/components 내)
