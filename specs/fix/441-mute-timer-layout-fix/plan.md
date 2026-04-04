# Implementation Plan: 음소거 아이콘 헤더 반영 및 타이머 화면 레이아웃 개선

**Branch**: `fix/#441-mute-timer-layout-fix` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/fix/441-mute-timer-layout-fix/spec.md`

## Summary

헤더의 볼륨 버튼 아이콘이 음소거 상태를 반영하지 않는 버그와
`NormalTimer`에서 팀명과 토론자 정보가 한 줄로 압축되는 레이아웃 버그를 수정한다.
순수 UI 레이어 변경(2개 파일 수정)으로, API/상태관리 변경 없음.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode)
**Primary Dependencies**: React 18, Tailwind CSS 3, react-icons 5, react-i18next
**Storage**: N/A (localStorage 볼륨 값 - 기존 로직 유지)
**Testing**: Vitest + @testing-library/react + @testing-library/user-event + MSW
**Target Platform**: Web (Chrome/Safari/Firefox)
**Project Type**: Web SPA (Vite + React Router v7)
**Performance Goals**: 즉각적인 아이콘 상태 변경 (React 상태 업데이트 기반, 별도 성능 목표 없음)
**Constraints**: 기존 TimerPageLogics 인터페이스 변경 없음, API 호출 없음
**Scale/Scope**: TimerPage 1개 + NormalTimer 1개 컴포넌트 수정

## Constitution Check

✅ **레이어드 폴더 구조**: 수정 대상 파일이 기존 구조(`page/TimerPage/`, `page/TimerPage/components/`) 내 위치
✅ **코드 스타일**: function declaration 유지, camelCase/PascalCase 준수
✅ **TDD**: 테스트 파일 먼저 작성 후 구현 예정
✅ **i18n**: 기존 `t()` 사용 패턴 유지, 하드코딩 텍스트 없음
✅ **API 레이어 패턴**: API 변경 없음
✅ **순환 의존성**: 없음

**Constitution 위반 사항**: 없음

## Project Structure

### Documentation (this feature)

```text
specs/fix/441-mute-timer-layout-fix/
├── plan.md              # 이 파일
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── test-contracts/
│   ├── NormalTimer.md   # Phase 1 output ✅
│   └── TimerPage-mute-icon.md  # Phase 1 output ✅
└── tasks.md             # Phase 2 output (/speckits:tasks 로 생성)
```

### Source Code (수정 대상)

```text
src/
├── page/TimerPage/
│   ├── TimerPage.tsx             # 수정: 음소거 시 다른 아이콘 표시
│   ├── TimerPage.test.tsx        # 신규: 헤더 음소거 아이콘 TDD 테스트
│   └── components/
│       ├── NormalTimer.tsx       # 수정: 두 줄 레이아웃 + text-center
│       └── NormalTimer.test.tsx  # 신규: 레이아웃 TDD 테스트
```

## Architecture Decision Table

| 결정 | 고려한 옵션 | 선택 | 근거 | 프로젝트 구조 영향 | 테스트 용이성 |
|---|---|---|---|---|---|
| 음소거 아이콘 소스 | ① react-icons `RiVolumeMuteFill` ② 새 DTVolumeMuted 아이콘 | react-icons | 전체화면 토글 패턴과 일관성, 새 파일 불필요 | 변경 없음 | 높음 (클래스명/aria로 검증) |
| isMuted 파생 위치 | ① `TimerPage` 내 `volume === 0` ② `useTimerPageState` 인터페이스에 추가 | TimerPage 내 파생 | 파생값 추가 노출 불필요, 인터페이스 변경 최소화 | 변경 없음 | 높음 |
| 두 줄 레이아웃 방식 | ① flex-col + 개별 `<p>` ② `<br/>` 구분 | flex-col + 개별 `<p>` | 시맨틱, 각 줄 독립 스타일 적용 용이 | 없음 | 높음 (별도 요소로 쿼리) |
| 팀명 말줄임 | ① truncate를 팀명 줄에만 | truncate 팀명 줄만 | 토론자 줄은 항상 완전 표시 (FR-004) | 없음 | 높음 |
| 순서명 정렬 | ① text-center 추가 ② 현행 유지 | text-center 추가 | 한/영 모두 일관 중앙 정렬 보장 | 없음 | 높음 |

## TDD Implementation Order

### RED 단계 (테스트 먼저 작성)

**우선순위 1: NormalTimer 컴포넌트 (component 레이어)**

```
NormalTimer.test.tsx 작성 (모두 RED):
1. 팀명과 토론자가 각각 독립된 DOM 요소로 분리되는지
2. 팀명 줄에 truncate 클래스가 있는지
3. 토론자 줄에 truncate 클래스가 없는지
4. 팀명만 있을 때 토론자 요소가 미렌더링되는지
5. 팀명, 토론자 모두 없을 때 아이콘 영역 미렌더링되는지
6. h1(순서명)에 text-center 클래스가 있는지
```

**우선순위 2: TimerPage 페이지 (page 레이어)**

```
TimerPage.test.tsx 작성 (모두 RED):
1. volume > 0일 때 음소거 아이콘이 없는지
2. volume === 0일 때 음소거 아이콘이 표시되는지
3. 볼륨을 0으로 변경하면 헤더 아이콘이 즉시 음소거로 변경되는지
```

### GREEN 단계 (최소 구현)

```
NormalTimer.tsx 수정:
- flex-row → flex-col 변경
- 팀명 p 태그 분리 + truncate 유지
- 토론자 p 태그 분리
- h1에 text-center 추가

TimerPage.tsx 수정:
- volume === 0 조건으로 RiVolumeMuteFill / DTVolume 분기
```

### REFACTOR 단계

```
- 불필요한 className 정리
- 테스트 가독성 개선
```

## Complexity Tracking

> Constitution 위반 없음 — 이 섹션은 해당 없음
