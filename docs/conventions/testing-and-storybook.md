# 테스트와 Storybook 컨벤션

## TDD와 실행 순서

기능 구현은 Red → Green → Refactor 순서로 진행함. Red에서 실패하는 테스트를
추가하고 실패를 확인함. Green에서 최소 구현으로 해당 테스트를 통과시킴. Refactor
후 관련 테스트와 전체 테스트를 다시 실행함. 구현 의존성이 있는 경우 `util/` →
`apis/` → `hooks/` → `components/` → `page/` 순서로 계약을 쌓음. 수행한 단계와
실제 검증 결과는 작업 보고에 남김.

테스트는 대상 코드 옆에 `{module}.test.ts(x)`로 둠. `describe`로 대상·상황을
묶고 `it`에 기대 행위를 한국어 문장으로 씀. suite와 case 이름은 모두 한국어로
작성함. 기존 `test` 사용은 새 코드의 예외가 아님. 근거는
`src/util/formatting.test.ts`, `src/apis/sockets/util.test.ts`,
`src/hooks/useModal.test.tsx`에 있음.

## 관찰과 경계

- 컴포넌트는 Testing Library `render`·`screen`으로 사용자에게 보이는 결과를
  검증함. 접근 가능한 역할·이름이 있으면 `getByRole` 계열을 우선함.
- 클릭·입력은 `userEvent.setup()`과 `await user.*`를 사용함. 훅은 `renderHook`,
  상태 변경은 `act`, 비동기 결과는 `waitFor`를 사용함.
- 시간 기반 로직은 fake timer로 진행을 명시하고 테스트 뒤 real timer로 복구함.
- API는 MSW로 모방함. SDK·소켓·브라우저 경계는 필요할 때 `vi.mock`·`vi.spyOn`을
  사용함. 순수 함수와 실제 Provider 사용을 우선하고 불필요한 mock을 줄임.
- Router·Query·Portal·i18n에 의존하는 UI는 테스트 wrapper에서 필요한 Provider를
  조립함.
- 정상값뿐 아니라 null·잘못된 타입·경계값·중복 이벤트·재연결처럼 계약을 깨뜨릴
  수 있는 경로를 검사함. 같은 계약의 입력 조합은 `it.each`로 묶음.

`setup.ts`가 MSW server와 공통 브라우저 보조 환경을 준비함. 직접 API 테스트의
범위와 handler 공유 규칙은 [데이터·실시간 컨벤션](data-and-realtime.md)이
소유함. 근거는 `src/apis/apis/live.test.ts`,
`src/hooks/sockets/useSocket.test.ts`,
`src/components/DialogModal/DialogModal.test.tsx`에 있음.

## Storybook

Story는 구현 파일 옆 또는 기능의 `stories/`에 `*.stories.tsx`로 둠. typed
CSF에서 `Meta<typeof Target>`와 `StoryObj<typeof Target>`를 사용하고
`const meta`를 default export함. 자동 문서가 필요한 대상은
`tags: ['autodocs']`를 지정함.

Storybook 10의 React·Vite Story 타입과 Preview 타입은
`@storybook/react-vite`에서 가져옴. 상호작용 검증의 `expect`, `fn`, `within` 등은
`storybook/test`, args를 갱신하는 `useArgs`는 `storybook/preview-api`를 사용함.
문서 기능은 `@storybook/addon-docs`, Controls·Actions·Interactions·viewport는
Storybook에 통합된 기능을 사용함. `.storybook`의 TS·TSX 설정도 앱 타입 검사에
포함함.

viewport 목록은 `parameters.viewport.options`에 정의하고, Story의 고정 화면은
`globals.viewport = { value: '화면 키', isRotated: false }`로 선택함. 전역 기본은
화면 선택을 강제하지 않는 반응형으로 유지함. 언어·화면 크기를 조합하는 헬퍼는
`parameters`와 `globals`를 함께 반환함. 근거는
`src/components/UpdateModal/UpdateModal.stories.tsx`와
`src/page/AudienceFinishedPage/AudienceFinishedPage.stories.tsx`에 있음.

`Default`, `Disabled`, `Loading`, `Failed`, `On*`, `When*`처럼 의미 있는 상태를
named Story로 구분함. Props만으로 표현되는 상태는 `args`, Provider·Layout·훅
조립이 필요하면 `render`를 사용함. 페이지 Story는
`parameters.layout = 'fullscreen'`을 사용함. 근거는
`src/components/ClearableInput/ClearableInput.stories.tsx`,
`src/components/DialogModal/DialogModal.stories.tsx`,
`src/page/TimerPage/stories/NormalTimerTestPage.stories.tsx`에 있음.

### 버전 이전 시 수동 검증

`npm run storybook`과 `npm run build-storybook`의 정적 결과를 각각 브라우저에서
확인함. 정적 결과는
`npx --no-install vite preview --outDir storybook-static --port 6007`로 실행함.
색인의 Story·문서 ID를 이전 버전과 비교하고 Docs·Controls·Actions·
Interactions의 표시와 동작을 확인함. worker의 HTTP 200만으로 MSW 검증을
완료하지 않으며 테이블 조회·투표·타이머·청중 시뮬레이터의 실제 응답과
Router·Query·Portal 조립 결과를 확인함.

UpdateModal은 기존 `play`를 모든 화면·언어 조합에서 실행함. 모바일·가로 화면·
767/768px 경계·데스크톱에서 이미지 비율·긴 설명 스크롤, 체크박스의 args 반영과
닫기 동작을 확인함. 청중 모바일 Story는 375×812인지 확인함. 앱 개발 서버는
Storybook 빌드 후 재시작해 산출물이 의존성 탐색에 섞이지 않는지 확인함.
고정 viewport 검증 시 관리 화면의 미리보기 영역을 충분히 확보함. 영역이 작으면
Storybook 10이 iframe 높이를 제한하므로 화면 이름만으로 크기를 판단하지 않음.

`npx --no-install storybook doctor`와 `NODE_OPTIONS=--trace-deprecation`을 적용한
개발·빌드 로그로 의존성과 Node 경고를 확인함. Windows의 도구 실행 오류는 실제
peer 충돌과 구분해 기록함. Chromatic 게시·시각 비교는 별도 권한으로 수행하고,
인증 가능한 경우 CLI의 `--dry-run`으로 감지·빌드를 확인함. 미실행 항목과
수동 확인 범위는 완료 보고와 PR에 명시함.
