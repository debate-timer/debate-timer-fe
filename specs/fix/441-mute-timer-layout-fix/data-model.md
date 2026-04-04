# Data Model: 음소거 아이콘 헤더 반영 및 타이머 화면 레이아웃 개선

> 이 픽스는 순수 UI 레이어 수정이므로 새로운 타입/엔티티 추가 없음.
> 기존 타입을 그대로 활용.

## 관련 기존 타입

### `TimerPageLogics` (src/page/TimerPage/hooks/useTimerPageState.ts)

```ts
export interface TimerPageLogics {
  // ... 기존 필드 ...
  volume: number;        // 0~10 정수. 0이면 음소거 상태
  setVolume: (value: number) => void;
  isVolumeBarOpen: boolean;
  toggleVolumeBar: () => void;
  volumeRef: React.RefObject<HTMLDivElement>;
}
```

**`isMuted` 파생 로직**: `const isMuted = volume === 0;`
- `TimerPage.tsx` 내에서 파생하여 사용
- `TimerPageLogics` 인터페이스 변경 없음

### `NormalTimerProps` (src/page/TimerPage/components/NormalTimer.tsx)

```ts
interface NormalTimerProps {
  normalTimerInstance: NormalTimerInstance;
  isAdditionalTimerAvailable: boolean;
  item: TimeBoxInfo;      // item.speaker: string | null
  teamName: string | null;
}
```

**레이아웃 로직 변경**:
- `teamName` → 첫 번째 줄 (truncate 적용)
- `item.speaker` → 두 번째 줄 (완전 표시)
- 두 줄 모두 중앙 정렬

## 변경 영향 범위

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `src/page/TimerPage/TimerPage.tsx` | 수정 | volume === 0 분기로 음소거 아이콘 조건부 렌더링 |
| `src/page/TimerPage/components/NormalTimer.tsx` | 수정 | 두 줄 레이아웃 + h1 text-center 추가 |
| `src/components/icons/` | 변경 없음 | DTVolumeMuted 미생성, react-icons 사용 |
| `src/page/TimerPage/hooks/useTimerPageState.ts` | 변경 없음 | 인터페이스 그대로 유지 |
| `src/apis/` | 변경 없음 | API 호출 없음 |
