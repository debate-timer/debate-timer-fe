# Phase 0 Research: 음소거 아이콘 헤더 반영 및 타이머 화면 레이아웃 개선

## 1. 음소거 상태 공유 구조 분석

### 현재 상태 흐름

```
useBellSound (볼륨 원시값: 0.0~1.0)
  └── useTimerPageState (VOLUME_SCALE=10 적용, volume: 0~10)
        ├── TimerPage.tsx (헤더 버튼 - DTVolume 항상 표시 ← 버그)
        └── VolumeBar.tsx (volume prop 수신, 내부적으로 isMuted 계산)
```

### 버그 원인

- `TimerPage.tsx`에서 헤더 볼륨 버튼은 항상 `DTVolume` 렌더링
- `volume === 0` 조건 체크 없음
- 반면 `VolumeBar.tsx`는 `isNotMute = volume > 0` 로직으로 아이콘 스타일만 변경(CSS dimming)하고 다른 아이콘을 표시하지 않음

### Decision: 헤더 아이콘 조건부 렌더링

- **Decision**: `volume === 0` 조건으로 헤더에 음소거/일반 아이콘 분기 렌더링
- **Rationale**: 전역 volume 상태가 이미 `TimerPageLogics` 인터페이스에 노출되어 있어 추가적인 상태 관리 없이 구현 가능
- **Alternatives considered**:
  1. `isMuted` boolean을 `useTimerPageState` 인터페이스에 추가 → 오버엔지니어링, `volume === 0` 파생값이라 별도 노출 불필요
  2. Context로 음소거 상태 별도 관리 → 현재 상태 흐름이 이미 충분히 공유됨

---

## 2. 음소거 아이콘 소스 결정

### 현재 아이콘 체계

- `src/components/icons/` — DT-prefix 커스텀 SVG 아이콘 (Volume.tsx, Help.tsx, etc.)
- `react-icons` 라이브러리 — 전체화면 토글에 `RiFullscreenFill` / `RiFullscreenExitFill` 사용 중

### Decision: react-icons 사용

- **Decision**: 음소거 아이콘으로 `react-icons` (`RiVolumeMuteFill` from `react-icons/ri`)를 사용
- **Rationale**:
  - 전체화면 토글 패턴(`RiFullscreenFill` / `RiFullscreenExitFill`)과 동일한 방식
  - 새 SVG 파일 생성 없이 구현 가능 (최소 변경 원칙)
  - `react-icons/ri` (Remix Icons)가 이미 import 중
- **Alternatives considered**:
  - `DTVolumeMuted` 커스텀 아이콘 생성 → SVG 디자인 리소스 없이는 기존 DTVolume과 시각적 일관성 유지 어려움
  - DTVolume에 `isMuted` prop 추가 → 컴포넌트 인터페이스 변경, 오버엔지니어링

---

## 3. NormalTimer 두 줄 레이아웃 분석

### 현재 코드

```tsx
{(teamName || item.speaker) && (
  <span className="flex w-full max-w-[600px] flex-row items-center justify-center space-x-[16px]">
    <DTDebate className="w-[20px] flex-shrink-0 xl:w-[28px]" />
    <p className="min-w-0 flex-1 truncate text-[20px] xl:text-[28px]">
      {teamName && t('{{team}} 팀', { team: t(teamName) })}
      {item.speaker &&
        t(' | {{speaker}} 토론자', { speaker: t(item.speaker) })}
    </p>
  </span>
)}
```

### 버그 원인

- 팀명과 토론자 정보가 단일 `<p>` 태그 안에서 한 줄로 표시됨
- `truncate`(text-overflow: ellipsis)가 전체 줄에 적용되어 팀명이 길면 토론자 정보가 잘림

### Decision: flex-col + 개별 줄 분리

- **Decision**: `flex-row` → `flex-col`로 변경, 팀명과 토론자 정보를 각각 독립된 줄에 표시
- **Rationale**:
  - 팀명 줄은 `truncate` 유지로 긴 팀명 말줄임 처리 (FR-005)
  - 토론자 줄은 항상 완전하게 표시 가능 (FR-004)
  - 스펙 SR: 두 줄 모두 중앙 정렬 (FR-009)
- **Alternatives considered**:
  - `<br/>` 태그로 줄 구분 → 시맨틱하지 않음
  - Grid 레이아웃 → 두 줄에 오버킬

---

## 4. 순서명 정렬 이슈 분석

### 현재 코드

```tsx
<h1 className="text-[52px] font-bold xl:text-[68px]">{titleText}</h1>
```

### 이슈

- 부모 `<span>`에 `items-center justify-center`가 있으나 h1 자체에 `text-center`가 없음
- 한글 폰트의 경우 기본 text-left일 때 다른 너비를 가질 수 있음
- `flex-col` 컨테이너에서 자식이 block이면 가로 전체 차지 → 텍스트가 중앙 정렬처럼 보이나 실제로는 left-aligned

### Decision: text-center 명시 추가

- **Decision**: h1 태그에 `text-center` 클래스 추가로 텍스트 중앙 정렬 명시
- **Rationale**: 한글/영어 모두 동일 중앙 정렬 보장, 팀 정보 영역과 시각적 일치
- **Alternatives considered**:
  - 현재 스타일 유지 → 한글에서 정렬 불일치 유지됨

---

## Summary

| 결정 사항 | 선택한 방식 | 근거 |
|---|---|---|
| 음소거 아이콘 소스 | react-icons (`RiVolumeMuteFill`) | 전체화면 토글 패턴과 일관성 |
| isMuted 파생 위치 | `TimerPage.tsx` 내 `volume === 0` | 별도 상태 불필요 |
| 두 줄 레이아웃 | flex-col, 개별 `<p>` 태그 | 시맨틱, 명확한 줄 구분 |
| 순서명 정렬 | `text-center` 추가 | 한글/영어 일관 중앙 정렬 |
