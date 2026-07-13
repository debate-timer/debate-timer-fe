# AudienceNormalTimer 발언 정보·프로그레스 바 구현 계획

## 목표

웹 소켓 NORMAL 타이머 메시지의 `sequence`를 관객 표시 상태에 보존하고, `AudienceSharePage`가 `debateTableQuery.data.table[sequence]`에서 현재 발언 순서의 정보를 선택한다. 선택한 정보로 `AudienceNormalTimer`에 발언 유형, 진영별 팀명, 토론자명, 원래 제한 시간을 전달해 현재 남은 시간과 함께 표시하며, 경과 시간 비율을 나타내는 진영 색상의 가로 프로그레스 바를 추가한다.

## 구현 원칙

- API 조회 결과는 기존처럼 `AudienceSharePage`의 단일 데이터 원천으로 유지하고 별도 state로 복제하지 않는다.
- 웹 소켓에서 받은 `sequence`만 관객 표시 상태에 추가하며 API의 `table` 전체를 소켓 상태 훅에 전달하지 않는다.
- `sequence`로 선택한 `TimeBoxInfo`와 팀명은 페이지에서 파생한 뒤 `AudienceNormalTimer`에 명시적인 props로 전달한다.
- 진행률은 `AudienceNormalTimer`에서 `(totalTime - remainingTime) / totalTime * 100`으로 파생하고 별도 React state로 중복 저장하지 않는다.
- 공용 프로그레스 바는 API 응답이나 시간 계산 방식을 알지 않으며, 계산된 `progress`, `team`, `className`, 애니메이션 여부만 입력받는다.
- 진행률은 0~100 범위로 제한해 음수 남은 시간이나 서버 동기화 오차가 레이아웃을 깨뜨리지 않게 한다.
- NORMAL 항목의 `stance`가 `NEUTRAL`이면 공용 바의 `DISABLED` 팀으로 매핑해 `bg-default-neutral` 색상을 적용하고 나머지 타이머는 정상 표시한다.
- `sequence`가 배열 범위를 벗어나거나 소켓의 NORMAL 타입과 API 항목의 `boxType`이 불일치하거나 NORMAL 항목의 `time`이 null/0 이하이면 서버 연결 오류 UI로 전환한다.
- 사용자에게 보이는 발언 유형·팀명·토론자명은 기존 i18n 정책을 따른다.
- 테스트는 Constitution에 따라 훅 → 컴포넌트 → 페이지 순서로 먼저 작성한다.

## 구현 순서 (TDD)

1. `useAudienceShareState` 테스트에 NORMAL 메시지의 `sequence` 보존 및 새 메시지 수신 시 갱신 동작을 먼저 명세한다.
2. 공용 프로그레스 바의 색상·className·애니메이션과 `AudienceNormalTimer`의 경과 진행률 계산 및 발언 정보 Row를 컴포넌트 테스트로 먼저 명세한다.
3. `AudienceSharePage` 테스트에서 `sequence`에 해당하는 API 테이블 항목과 팀명이 NORMAL 타이머에 연결되는지 명세한다.
4. 소켓 표시 상태에 `sequence`를 추가하고 페이지에서 현재 `TimeBoxInfo` 및 팀명을 파생한다.
5. `AudienceNormalTimer`의 제목·발언자 Row·타이머·프로그레스 바 UI와 Framer Motion 애니메이션을 구현한다.
6. 관련 Vitest를 실행하고, Prettier 적용 후 전체 lint와 build로 회귀를 검증한다.

## 추가 예정 파일 및 내용

### `src/components/TimerProgressBar/TimerProgressBar.tsx`

- 재사용 가능한 가로 프로그레스 바로서 계산된 `progress`, `team`, 레이아웃 확장용 `className`, 애니메이션 판단용 `isRunning`을 props로 받는다.
- `team`은 컴포넌트 전용 타입인 `PROS | CONS | DISABLED`를 지원한다.
- 바 외곽의 공통 스타일은 `h-[24px]`, `w-full`, `overflow-hidden`, `rounded-full`로 구성하고, 호출부가 전달한 `className`을 병합해 최대 너비·여백 등 배치 정책을 확장한다.
- 관객 NORMAL 타이머에서는 `w-full max-w-[1280px]`과 필요한 좌우 여백 class를 전달해 최대 1280px, 작은 화면에서는 반응형 축소를 적용한다.
- 내부 진행 바는 PROS일 때 `bg-camp-blue`, CONS일 때 `bg-camp-red`, DISABLED일 때 `bg-default-neutral`을 적용한다.
- 전달받은 `progress`를 0~100으로 제한한다.
- `CircularTimer`가 사용하는 방식처럼 Framer Motion의 `useMotionValue`, `animate`, cleanup을 이용한다.
- PLAY 중에는 직전 값에서 새 경과 진행률까지 0.7초 `easeOut`으로 왼쪽에서 오른쪽으로 채우고, STOP·RESET 및 그 밖의 비실행 상태에서는 즉시 동기화한다.
- 시각 정보만으로 상태를 전달하지 않도록 `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`를 제공한다.

### `src/components/TimerProgressBar/TimerProgressBar.test.tsx`

- 전달한 `className`이 외곽 바의 기본 class와 함께 적용되는지 검증한다.
- PROS/CONS/DISABLED 팀별 색상 클래스를 검증한다.
- 0 미만 및 100 초과 `progress`의 제한 동작을 검증한다.
- 프로그레스 바의 접근성 role/value, 24px 높이 및 둥근 끝 스타일을 검증한다.
- fake timer 또는 Framer Motion 제어 mock을 최소한으로 사용해 PLAY의 0.7초 `easeOut` 애니메이션과 STOP·RESET 등 비실행 상태의 즉시 동기화를 검증한다.

## 수정 대상 파일 및 내용

### `src/page/AudienceSharePage/hooks/useAudienceShareState.test.ts`

- NORMAL 이벤트의 `data.sequence`가 `displayData.sequence`로 보존되는 테스트를 추가한다.
- PLAY/STOP/RESET/NEXT/BEFORE 등 유효한 새 NORMAL 메시지 수신 시 남은 시간과 `sequence`가 함께 최신 값으로 갱신되는지 검증한다.
- 기존 TIME_BASED 상태, 연결 수명주기, 오류 및 타임아웃 테스트가 그대로 통과하는지 확인한다.

### `src/page/AudienceSharePage/hooks/useAudienceShareState.ts`

- `AudienceNormalDisplayData`에 `sequence: number`를 추가한다.
- NORMAL 메시지를 처리할 때 `data.sequence`를 `singleTime`, `isRunning`과 함께 저장한다.
- 이번 작업에서는 TIME_BASED 표시 상태에 `sequence`를 추가하지 않는다.

### `src/page/AudienceSharePage/components/AudienceNormalTimer.test.tsx`

- 기존 임시 문구 `남은 시간` 대신 전달받은 `speechType`이 제목으로 표시되는지 검증한다.
- `DTDebate` 아이콘, 현재 진영의 팀명, 토론자명이 한 Row에 렌더링되는지 검증한다.
- PROS 및 CONS 입력 각각에서 올바른 팀 정보와 프로그레스 바 색상이 연결되는지 검증한다.
- `remainingTime`이 기존과 동일하게 `MM:SS` 형식으로 표시되는지 검증한다.
- `(totalTime - remainingTime) / totalTime * 100`으로 계산한 경과 진행률을 공용 `TimerProgressBar`에 전달하는지 검증한다.
- `stance` PROS/CONS를 같은 이름의 바 `team` prop으로 전달하고, NEUTRAL은 DISABLED로 전달하는지 검증한다.
- 프로그레스 바에 최대 1280px과 반응형 전체 너비 class를 전달하는지 검증한다.
- 남은 시간이 전체 시간 범위를 벗어나도 최종 진행률이 0~100으로 제한되는지 검증한다.
- 팀명 또는 토론자명이 비어 있으면 접미사 없이 각각 `팀명 없음`, `토론자 없음` 대체 문구가 표시되는지 검증한다.
- 사용자 조작 요소가 추가되지 않는 기존 계약을 유지한다.

### `src/page/AudienceSharePage/components/AudienceNormalTimer.tsx`

- props를 현재의 `remainingTime` 단일 값에서 다음 정보를 받을 수 있는 구조로 확장한다.
  - 현재 `TimeBoxInfo` 또는 이에 상응하는 `speechType`, `stance`, `speaker`, `totalTime`
  - 현재 진영으로 결정된 `teamName`
  - 로컬 카운트다운이 반영된 `remainingTime`
  - 프로그레스 바 애니메이션 판단용 `isRunning`
- `<h1>`의 `남은 시간`을 현재 순서의 `speechType`으로 교체한다.
- 제목 아래에 `DTDebate`, 팀명, 토론자명을 가로로 배치한 Row를 추가한다.
- `DTDebate`는 정보 전달 텍스트가 함께 있으므로 장식 아이콘으로 처리해 스크린 리더 중복 낭독을 방지한다.
- `TimerPage/NormalTimer`와 동일하게 `normalizeSpeechTypeKey`로 알려진 발언 유형을 정규화해 번역하고, 알 수 없는 사용자 입력은 원문을 표시한다.
- 값이 있는 팀명과 토론자명은 `t('{{team}} 팀', { team: t(teamName) })`, `t('{{speaker}} 토론자', { speaker: t(speaker) })` 형식을 사용한다.
- 팀명 또는 토론자명이 빈 문자열/null이면 템플릿에 넣지 않고 각각 번역된 `팀명 없음`, `토론자 없음`을 최종 문구로 표시한다.
- `(totalTime - remainingTime) / totalTime * 100` 경과 진행률을 렌더링 중 파생해 기존 포맷된 타이머 아래의 공용 `TimerProgressBar`에 전달한다.
- 공용 바에는 PROS/CONS 또는 NEUTRAL에서 변환한 DISABLED 팀, `w-full max-w-[1280px]` className, `isRunning`을 함께 전달한다.
- API 원본 객체에 직접 의존하지 않고 페이지에서 선택된 현재 항목만 props로 받아 컴포넌트 책임을 표시 UI로 제한한다.

### `src/page/AudienceSharePage/AudienceSharePage.test.tsx`

- NORMAL 표시 mock에 `sequence`를 추가한다.
- 여러 테이블 항목을 가진 API mock을 사용해 `sequence`에 해당하는 항목의 `speechType`, `stance`, `speaker`, `time`이 선택되는지 검증한다.
- PROS면 `info.prosTeamName`, CONS면 `info.consTeamName`이 표시되는지 각각 검증한다.
- 웹 소켓에서 새 `sequence`를 수신한 상태로 바뀌면 다른 발언 정보와 프로그레스 바 기준 시간이 표시되는지 검증한다.
- 유효하지 않은 `sequence`, `boxType !== 'NORMAL'`, `time === null`, `time <= 0`인 NORMAL 소켓 상태에서 서버 연결 오류 UI가 표시되는지 검증한다.
- NEUTRAL NORMAL 항목은 오류 없이 타이머를 유지하고 중립 색상의 프로그레스 바를 표시하는지 검증한다.
- 기존 API/소켓 로딩·오류, 헤더, TIME_BASED 타이머, 종료 화면 테스트가 그대로 통과하는지 확인한다.

### `src/page/AudienceSharePage/AudienceSharePage.tsx`

- NORMAL `displayData.sequence`로 `debateTableQuery.data.table[sequence]`를 선택한다.
- `sequence`가 배열 범위를 벗어나거나 선택된 항목의 `boxType !== 'NORMAL'` 또는 `time === null`/`time <= 0`이면 서버 데이터 불일치로 판단해 기존 `서버 연결에 실패했어요.` 오류 UI를 재사용한다.
- 선택된 항목의 `stance`에 따라 PROS는 `info.prosTeamName`, CONS는 `info.consTeamName`, NEUTRAL은 빈 팀명으로 파생하고 `AudienceNormalTimer`가 대체 문구를 표시하게 한다.
- `AudienceNormalTimer`에 현재 항목, 팀명, 로컬 카운트다운이 반영된 남은 시간, 실행 여부를 전달한다.
- API 데이터와 소켓 `sequence`의 결합 및 경계 검증은 페이지에 두고, `AudienceNormalTimer`에는 유효하고 표시 가능한 데이터만 전달한다.

## 수정하지 않을 것으로 예상되는 기존 파일

- `src/apis/sockets/type.ts`: 웹 소켓 `TimerDataPayload`에 이미 `sequence`가 정의되어 있다.
- `src/apis/responses/live.ts` 및 `src/type/type.ts`: API 테이블 항목에 `stance`, `speechType`, `speaker`, `time`이 이미 정의되어 있다.
- `src/page/TimerPage/components/CircularTimer.tsx`: 참고만 하며 원형 타이머 동작은 변경하지 않는다.
- `src/page/TimerPage/hooks/useCircularTimerAnimation.ts`: 원형 타이머 전용 이름과 의미를 유지하고, 관객용 가로 바가 이를 직접 import해 페이지 간 결합을 만들지 않는다.
- `src/components/icons/Debate.tsx`: 기존 `DTDebate` 아이콘을 그대로 사용한다.
- `tailwind.config.js`: `camp-blue`, `camp-red` 색상 토큰이 이미 존재한다.

## 모호한 부분 (Q&A)

- 현재 확인된 추가 모호점 없음.
