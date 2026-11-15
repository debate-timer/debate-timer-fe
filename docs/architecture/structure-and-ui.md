# 구조와 UI 책임

## 적용 범위와 흐름

라우트 화면은 화면 조립과 기능 상태를, 공용 UI는 재사용 가능한 표시·조작을, 훅은 재사용 가능한 상태·부수 효과를 소유함. 이 문서는 계층과 공통 책임 경계를 정의하며 개별 UI의 디자인·Props·호출 계약은 해당 선언의 JSDoc에 둠. 문서의 소유권은 [문서 작성 컨벤션](../conventions/docs.md#내용의-소유권)을 따름.

HTTP·소켓 경계는 [데이터 접근](data-access.md)과 [실시간 통신](realtime.md), 코드 형식은 [TypeScript·구조](../conventions/typescript-and-structure.md)와 [React·UI](../conventions/react-and-ui.md), 시각 기준은 [공통 디자인](../conventions/design.md)을 따름.

```text
라우트 → page → 기능 전용 components/hooks → 공용 components/hooks
                                   └→ 데이터 훅·Repository·API
layout → 공용 화면 틀
```

## 화면과 공용 UI

| 위치                              | 책임                         |
| --------------------------------- | ---------------------------- |
| `src/page/{PageName}/`            | 라우트 단위 화면과 기능 조립 |
| `src/page/{PageName}/components/` | 해당 화면 전용 UI            |
| `src/page/{PageName}/hooks/`      | 해당 화면의 상태·효과        |
| `src/components/{Component}/`     | 화면 간 재사용 UI            |
| `src/layout/`                     | 헤더·본문·푸터 등 화면 틀    |

페이지는 라우트 입력·데이터 훅·로컬 상태를 연결함. 기능 전용 UI·훅·Story는 페이지 가까이에 두고, 둘 이상의 화면에서 같은 계약이 필요할 때 공용 위치로 올림. 공유 범위보다 폴더 이름을 먼저 정하지 않음. 큰 레이아웃은 합성 API로 조립하며 화면 트리 밖의 표시는 포털 경계에서 처리함.

공용 UI는 색상·크기·형태와 상태 표현을, 호출 화면은 배치·문구·동작을 소유함. 스타일만 반복되면 CSS utility를, 구조와 동작까지 반복되면 공용 컴포넌트를 검토함. 시각적 유사성만으로 상태와 기능을 합치지 않음.

모달의 본문·행동 영역과 컨테이너의 책임을 구분함. 열림·닫힘·오버레이·대화상자 의미·포커스 수명은 컨테이너 경계에서 관리하며 자식과 중복해서 처리하지 않음. 실행 중인 기능의 수명은 메뉴·오버레이의 개폐와 분리함.

### 배치 판단

1. URL 식별자나 화면 이동에 묶인 조립은 `page/`가 소유함.
2. 한 화면에서만 쓰는 표시와 상태는 해당 페이지의 `components/`·`hooks/`가 소유함.
3. 다른 화면에서도 같은 호출 계약이 필요해지면 공용 `components/`·`hooks/`로 올림.
4. UI 없이 계산 가능한 변환·검증은 순수 함수로 분리함.

### 공용 컴포넌트 목록

에이전트가 새 UI를 작성할 때 기존 공용 컴포넌트를 먼저 확인·재사용할 수 있도록 `src/components/`의 이름·위치·용도를 정리함. 새로운 공용 컴포넌트를 `src/components/`에 추가하면 아래 표에 이름·위치·용도를 함께 추가하고, 개별 컴포넌트의 자세한 디자인·Props·호출 계약은 해당 선언의 JSDoc에 작성함.

| 이름 | 위치 | 용도 |
| --- | --- | --- |
| `Button` | `src/components/Button/` | 기본 버튼 및 링크(`href`) 공용 액션 |
| `IconButton` | `src/components/IconButton/` | 아이콘 전용 공용 버튼 |
| `FloatingActionButton` | `src/components/FloatingActionButton/` | 화면 우하단 등에 떠 있는 액션 버튼 |
| `RoundControlButton` | `src/components/RoundControlButton/` | 둥근 형태의 보조 제어 버튼 |
| `GoToDebateEndButton` | `src/components/GoToDebateEndButton/` | 토론 종료 화면으로 이동하는 버튼 |
| `ToggleButton` | `src/components/ToggleButton/` | 켜기/끄기 상태를 전환하는 스위치 |
| `Chip` | `src/components/Chip/` | 상태나 짧은 보조 정보를 표시하는 비조작 배지 |
| `NotificationBadge` | `src/components/NotificationBadge/` | 숫자 기반 알림 카운트 배지 |
| `Overlay` | `src/components/Overlay/` | 방향별 등장·종료 애니메이션을 제공하는 공용 떠 있는 면 |
| `ModalFrame` | `src/components/ModalFrame/` | 모달 배경·포커스·닫기 경계를 제공하는 틀 |
| `DialogModal` | `src/components/DialogModal/` | 확인/취소 등 일반 대화상자 모달 |
| `SettingsModal` | `src/components/SettingsModal/` | 전역 설정(언어·볼륨·계정·문의) 진입 버튼과 모달 |
| `ShareModal` | `src/components/ShareModal/` | 시간표 공유 링크 생성·복사 모달 |
| `UpdateModal` | `src/components/UpdateModal/` | 서비스 업데이트·공지 안내 모달 |
| `LoginPrompt` | `src/components/LoginPrompt/` | OAuth 로그인 전 계정/게스트 진행 확인 모달 |
| `DropdownMenu` | `src/components/DropdownMenu/` | 선택 목록을 여닫는 공용 드롭다운 |
| `ClearableInput` | `src/components/ClearableInput/` | 초기화 버튼이 포함된 텍스트 입력 |
| `LabeledCheckBox` | `src/components/LabeledCheckBox/` | 레이블 클릭 영역을 포함한 체크박스 |
| `LabeledRadioButton` | `src/components/LabeledRadioButton/` | 레이블 클릭 영역을 포함한 라디오 버튼 |
| `CustomRangeSlider` | `src/components/CustomRangeSlider/` | 마우스·터치 드래그와 툴팁을 지원하는 범위 슬라이더 |
| `VolumeBar` | `src/components/VolumeBar/` | 음소거 토글이 포함된 볼륨 조절 바 |
| `TimeBox` | `src/components/TimeBox/` | 토론 시간표의 단일 발언·작전시간·자유토론 블록 |
| `TemplateCard` | `src/components/TemplateCard/` | 프리셋·템플릿 요약 카드 |
| `TimerProgressBar` | `src/components/TimerProgressBar/` | 타이머 진행률 막대 표시 |
| `ProsAndConsTitle` | `src/components/ProsAndConsTitle/` | 찬성/반대 진영 제목 표시 |
| `HeaderTitle` | `src/components/HeaderTitle/` | 헤더 중앙/좌측 제목 표시 |
| `HeaderTableInfo` | `src/components/HeaderTableInfo/` | 헤더 내 토론 시간표 정보 표시 |
| `LoadingIndicator` | `src/components/LoadingIndicator/` | 로딩 안내 래퍼 |
| `LoadingSpinner` | `src/components/LoadingSpinner/` | 회전 로딩 스피너 아이콘 |
| `Skeleton` | `src/components/Skeleton/` | 로딩 중 자리 표시자 스켈레톤 |
| `ErrorBoundary` | `src/components/ErrorBoundary/` | 렌더링·비동기 오류 포착 경계 및 오류/404 화면 |
| `ErrorIndicator` | `src/components/ErrorIndicator/` | 오류 상태 안내 및 재시도 표시 |
| `CompletionInfoNotice` | `src/components/CompletionInfoNotice/` | 완료·종료 화면의 정보 조회 실패 시 지연 복구 안내 |
| `GlobalSettingsProvider` | `src/components/GlobalSettingsProvider/` | 전역 설정 컨텍스트·저장소 수명 제공자 |
| `TranscriptDetail` | `src/components/TranscriptDetail/` | 속기록·AI 요약 보고서 상세 보기 공용 묶음 |
| `KeyIcon` | `src/components/KeyIcon/` | 단축키 키캡 아이콘 표시 |
| `SmallIconContainer` | `src/components/SmallIconContainer/` | 작은 아이콘 버튼 감싸기 컨테이너 |
| `icons` | `src/components/icons/` | 서비스 전용 SVG 아이콘 묶음 |
| `DesignSystemSample` | `src/components/DesignSystemSample/` | 디자인 시스템 색상 견본 Storybook 보조 컴포넌트 |

## 상태와 부수 효과

| 상태 종류                                      | 소유 위치                |
| ---------------------------------------------- | ------------------------ |
| 입력·모달·타이머 표시처럼 화면에만 필요한 상태 | 화면 또는 화면 전용 훅   |
| 화면 간 재사용하는 브라우저·UI 상태            | 공용 훅                  |
| 서버 조회·변경 상태                            | 데이터 조회·변경 전용 훅 |
| 메시지 구독과 연결 상태                        | 통신 전용 훅             |
| 여러 화면에서 공유하는 설정·저장 수명          | 앱 수명의 상태 소유자    |

이전 상태에 의존하는 변경은 함수형 setter를 사용함. DOM listener·timer·구독은 효과 종료 시 정리함. 재구독 없이 최신 콜백을 읽는 방식과 Ref의 선택 기준은 [React·UI](../conventions/react-and-ui.md#훅과-효과)가 소유함. 상태를 다른 계층으로 옮길 때 누가 생성·갱신·정리하는지 먼저 정하고, 여러 계층에 같은 권위의 상태를 복제하지 않음.

이벤트 해석·계산은 가능하면 React 밖의 순수 함수로 분리함. UI는 표시 상태와 콜백을 소비하며 통신·확인·실패 처리 책임을 명확히 구분함. 기능을 중단하거나 화면을 닫아도 계속되어야 하는 저장·정리 작업은 해당 수명의 소유자가 관리함. 입력 경계의 오류·복구는 [오류와 관측](errors-observability.md)을 따름. 기능별 제품 정책은 [위키](../wiki/README.md)를 따름.

## 공용 계약과 유틸리티

- `src/types/`는 공용 도메인 타입을 소유함. API 요청·응답 타입은 `src/apis/requests/`·`src/apis/responses/`에 두며 기능 안에서만 쓰는 Props·상태 타입은 사용 지점 가까이에 둠.
- `src/util/`은 포맷·검증·인코딩·브라우저 저장소 접근 등 재사용 순수 함수와 브라우저 경계를 소유함.
- `src/constants/`는 여러 곳에서 쓰는 정적 값의 목적별 묶음을 소유함.

새 화면은 라우트와 화면의 책임을 먼저 정하고 기능 전용 구현을 가까이에 배치함. 공용 승격 시 실제 소비 범위와 상태 소유권을 확인함.

## 헤더와 페이지 수명

역할별 헤더의 표시·배치와 데이터·인증·기능 조립을 분리함. `src/layout/components/header/`의 표시 컴포넌트는 받은 정보·조작 슬롯을 표시하며 Container와 페이지가 설정·권한·로그인 입력을 연결함. `DefaultLayout`은 `header` 슬롯을 받고 생략 시 현재 경로 역할의 대체 헤더를 사용함. 일반 화면의 제목·토론 정보는 본문이 소유함. 이전 `DefaultLayout.Header` 합성 API는 제거했음.

독립 기록 페이지가 기존 목록 UI를 이동해 재사용함. 기본 타이머와 라이브 청중의 실행 조립은 라우트 식별자에 결속해 다른 토론으로 이동하면 새로 생성하고 언어 접두어 변경·메뉴 개폐로는 재생성하지 않음. 페이지의 실제 조립·호출 입력과 UI별 예외는 [토론 제어 훅 JSDoc](../../src/page/TimerPage/hooks/useDebateControls.ts)이 소유함.

로그아웃은 페이지 수명의 중단 콜백에 위임함. 입력 차단·타이머 정지·속기 폐기를 한 경계에서 수행하고 공유·전체 화면·설정 발행과 인증 처리를 연결함. 보조 타이머의 정지 요청도 페이지에서 전달해 종료 안내 취소 후 자동으로 재개하지 않음. 공용 대화상자와 로그아웃 경고는 `useDialogFocus`의 포커스 수명을 재사용하며, 비모달 토론 메뉴의 닫기·포커스 이탈 처리는 기능 전용 훅이 소유함.
