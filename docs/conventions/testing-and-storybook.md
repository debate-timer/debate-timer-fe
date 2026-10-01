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

`Default`, `Disabled`, `Loading`, `Failed`, `On*`, `When*`처럼 의미 있는 상태를
named Story로 구분함. Props만으로 표현되는 상태는 `args`, Provider·Layout·훅
조립이 필요하면 `render`를 사용함. 페이지 Story는
`parameters.layout = 'fullscreen'`을 사용함. 근거는
`src/components/ClearableInput/ClearableInput.stories.tsx`,
`src/components/DialogModal/DialogModal.stories.tsx`,
`src/page/TimerPage/stories/NormalTimerTestPage.stories.tsx`에 있음.
