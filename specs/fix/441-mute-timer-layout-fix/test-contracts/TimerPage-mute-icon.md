# Test Contract: TimerPage 헤더 음소거 아이콘

**파일**: `src/page/TimerPage/TimerPage.test.tsx`
**우선순위**: page 레이어 (component 레이어 테스트 이후)

---

## 모듈 개요

`TimerPage`의 헤더 우측 볼륨 버튼은 현재 음소거 상태(volume === 0)에 따라
음소거 아이콘 또는 일반 볼륨 아이콘을 표시해야 한다.

---

## 테스트 대상 행위

### 1. 초기 렌더링 시 아이콘 상태

| 테스트 | 조건 | 예상 출력 |
|---|---|---|
| 볼륨이 0보다 클 때 일반 볼륨 아이콘이 표시된다 | localStorage `timer-volume`이 `0.5` (volume=5) | 음소거 아이콘 미표시, 볼륨 버튼에 aria-label='볼륨 조절' |
| 볼륨이 0일 때 음소거 아이콘이 표시된다 | localStorage `timer-volume`이 `0` (volume=0) | 음소거 상태 아이콘 표시 |

### 2. 볼륨 변경 시 아이콘 즉시 업데이트

| 테스트 | 액션 | 예상 출력 |
|---|---|---|
| VolumeBar에서 슬라이더를 0으로 내리면 헤더 아이콘이 즉시 음소거로 변경된다 | VolumeBar의 range input value를 0으로 변경 | 헤더 볼륨 버튼 내 음소거 아이콘 표시 |
| VolumeBar에서 음소거 버튼을 클릭하면 헤더 아이콘이 즉시 음소거로 변경된다 | VolumeBar 음소거 버튼 클릭 | 헤더 볼륨 버튼 내 음소거 아이콘 표시 |
| 음소거 해제 후 헤더 아이콘이 일반 볼륨으로 복원된다 | 음소거 상태에서 음소거 버튼 재클릭 | 헤더 볼륨 버튼 내 일반 볼륨 아이콘 복원 |

---

## 경계 조건

- 볼륨 슬라이더를 0으로 내린 경우 + 명시적 음소거 버튼 클릭 → 두 경우 모두 동일하게 음소거 아이콘 (FR-008)
- 화면 전환(라운드 이동) 후에도 음소거 상태가 유지되면 헤더 아이콘이 음소거로 표시

---

## 테스트 환경

- Vitest + @testing-library/react
- MSW: `useGetDebateTableData` 호출을 mock handler로 처리
  - `src/mocks/handlers/` 기존 핸들러 활용 또는 새 핸들러 추가
- localStorage: `timer-volume` 값 설정으로 초기 볼륨 상태 제어
- 테스트 설명: 한국어

---

## Mock 전략

- `useGetDebateTableData` → MSW handler (`src/mocks/handlers/`)로 debateTable 응답 mock
- `useParams` → MemoryRouter로 라우트 파라미터 주입
- 전체 TimerPage 렌더링이 무거울 경우: `TimerPage` 대신 헤더 볼륨 버튼 부분만 테스트하는 서브컴포넌트로 분리 고려

---

## 참고

현재 `VolumeBar.tsx`가 별도의 팝오버 내에 있으므로, 통합 테스트 관점에서:
1. VolumeBar를 열고(toggleVolumeBar 클릭)
2. 슬라이더/음소거 버튼으로 볼륨 변경
3. 헤더 아이콘 상태 확인
순서로 테스트
