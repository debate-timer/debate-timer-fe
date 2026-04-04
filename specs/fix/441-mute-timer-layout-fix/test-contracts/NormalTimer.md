# Test Contract: NormalTimer 레이아웃

**파일**: `src/page/TimerPage/components/NormalTimer.test.tsx`
**우선순위**: component 레이어

---

## 모듈 개요

`NormalTimer`는 일반 타이머 화면의 좌측 정보 영역을 렌더링한다.
팀명(`teamName`)과 토론자(`item.speaker`)를 각각 독립된 줄에 표시해야 한다.

---

## 테스트 대상 행위

### 1. 제목(순서명) 렌더링

| 테스트 | 입력 | 예상 출력 |
|---|---|---|
| 한글 순서명이 중앙 정렬로 렌더링된다 | `item.speechType = '입론'` | h1 요소에 `text-center` 클래스 존재 |
| 영어 순서명이 중앙 정렬로 렌더링된다 | `item.speechType = 'Opening Statement'` | h1 요소에 `text-center` 클래스 존재 |

### 2. 두 줄 레이아웃

| 테스트 | 입력 | 예상 출력 |
|---|---|---|
| 팀명만 있을 때 첫 번째 줄에 팀명이 표시된다 | `teamName = '찬성 팀'`, `speaker = null` | 팀명 텍스트 화면에 표시, 토론자 줄 미표시 |
| 토론자만 있을 때 두 번째 줄에 토론자 정보가 표시된다 | `teamName = null`, `speaker = '발언자 1'` | 토론자 텍스트 화면에 표시, 팀명 줄 미표시 |
| 팀명과 토론자 모두 있을 때 각각 독립된 줄로 표시된다 | `teamName = '찬성 팀'`, `speaker = '발언자 1'` | 팀명과 토론자가 각각 별도 DOM 요소로 렌더링 |
| 팀명과 토론자 모두 없으면 해당 영역 전체가 미표시된다 | `teamName = null`, `speaker = null` | DTDebate 아이콘 및 팀 정보 영역 미렌더링 |

### 3. 팀명 말줄임 처리

| 테스트 | 입력 | 예상 출력 |
|---|---|---|
| 팀명 줄에 truncate 스타일이 적용된다 | `teamName = 'A very long team name'` | 팀명 요소에 `truncate` 클래스 존재 |
| 토론자 줄에는 truncate 스타일이 적용되지 않는다 | `speaker = '발언자 1'` | 토론자 요소에 `truncate` 클래스 미존재 |

---

## 경계 조건

- 팀명이 빈 문자열인 경우 → `null`과 동일하게 처리(팀명 렌더링 안 함)
- `item.speaker`가 빈 문자열인 경우 → `null`과 동일하게 처리

---

## 테스트 환경

- Vitest + @testing-library/react
- i18n: `ko` 언어 설정 (setup.ts)
- ResizeObserver 모킹 (setup.ts)
- 테스트 설명: 한국어

---

## Mock 전략

- 외부 API 없음 → MSW 핸들러 불필요
- `useCircularTimerAnimation`, `useBreakpoint` → 실제 훅 사용 (가능한 경우)
  - `useBreakpoint`가 ResizeObserver 의존 → setup.ts의 모킹으로 처리됨
- `normalTimerInstance` 관련 props → stub 객체로 전달
