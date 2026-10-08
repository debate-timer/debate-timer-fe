# 구조와 UI 책임

## 적용 범위와 흐름

라우트 화면이 필요한 상태와 동작을 조립하고, 공용 UI가 표시 계약을 제공하며,
훅이 재사용 가능한 상태·부수 효과를 맡음. HTTP·소켓의 구체적 경계는
[데이터 접근](data-access.md)과 [실시간 통신](realtime.md)이 소유함. 코드를
작성할 때의 형식은
[TypeScript·구조](../conventions/typescript-and-structure.md)와
[React·UI](../conventions/react-and-ui.md)를 따름.

```text
라우트 → page → 기능 전용 components/hooks → 공용 components/hooks
                                   └→ 데이터 훅·Repository·API
layout → 공용 화면 틀
```

## 화면과 공용 UI

| 위치                              | 책임                             | 현재 근거                                       |
| --------------------------------- | -------------------------------- | ----------------------------------------------- |
| `src/page/{PageName}/`            | 라우트 단위 화면과 기능 조립     | `src/page/TimerPage/TimerPage.tsx`              |
| `src/page/{PageName}/components/` | 해당 화면에서 쓰는 UI            | `src/page/TableComposition/components/TimeBox/` |
| `src/page/{PageName}/hooks/`      | 해당 화면의 상태·효과            | `src/page/TimerPage/hooks/useTimerPageState.ts` |
| `src/components/{Component}/`     | 화면 간 재사용 UI                | `src/components/DialogModal/DialogModal.tsx`    |
| `src/layout/`                     | Header·Content·Footer 등 화면 틀 | `src/layout/defaultLayout/DefaultLayout.tsx`    |

페이지가 라우트 입력, 데이터 훅, 로컬 상태를 연결함. 기능에만 필요한
UI·훅·Story는 페이지 안에 두고, 둘 이상의 화면에서 쓰는 계약을 공용 위치로 올림.
큰 레이아웃은 `DefaultLayout` 같은 합성 API로 조립함. `src/util/GlobalPortal/`은
화면 트리 밖에 렌더링해야 하는 UI의 포털을 제공함.

### 배치 판단

1. URL의 식별자나 화면 이동에 묶인 조립은 `page/`가 소유함.
2. 한 화면에서만 쓰는 표시와 상태는 해당 페이지의 `components/`·`hooks/`가
   소유함.
3. 다른 화면에서도 같은 호출 계약이 필요해지면 `src/components/`·`src/hooks/`로
   올림.
4. UI 없이 계산 가능한 변환·검증은 `src/util/` 또는 기능 안의 순수 함수가
   소유함.

예를 들어 토론 테이블 화면이 여러 입력·타이머를 조립할 때 페이지가 전체 흐름을
소유하고, `TimeBox`는 기능 안의 UI를 맡음. `DialogModal`은 화면과 무관한 표시
계약이므로 공용 컴포넌트에 있음. 공유 범위보다 폴더 이름을 먼저 정하지 않음.

## 상태와 부수 효과

`src/hooks/`는 범용 React 훅, `src/page/**/hooks/`는 기능 상태와 이벤트 해석을
소유함. `src/hooks/query/`와 `src/hooks/mutations/`는 서버 상태의 별도 경계임.
이전 상태에 의존하는 변경은 함수형 setter를 사용하고, DOM listener·timer·구독은
효과의 종료 시점에 정리함. 재구독 없이 최신 콜백을 사용해야 하면 Ref에 동기화함.
실제 예시는 `src/hooks/useDocumentVisibility.ts`,
`src/page/TimerPage/hooks/useTimerPageState.ts`,
`src/hooks/sockets/useAudienceSocket.ts`에 있음.

`src/page/AudienceSharePage/hooks/AudienceScreenState.ts`와
`EventInterpreter.ts`처럼 해석·계산이 React 없이 가능한 부분은 순수 함수로
분리함. 화면은 그 결과를 받아 UI 상태를 결정함. 입력 경계의 오류·복구는
[오류와 관측](errors-observability.md)이 소유함.

| 상태 종류                                      | 소유 위치              | 근거                                                           |
| ---------------------------------------------- | ---------------------- | -------------------------------------------------------------- |
| 입력·모달·타이머 표시처럼 화면에만 필요한 상태 | 화면 또는 화면 전용 훅 | `src/page/TimerPage/hooks/useTimerPageState.ts`                |
| 화면 간 재사용하는 브라우저·UI 상태            | 공용 훅                | `src/hooks/useModal.tsx`, `src/hooks/useDocumentVisibility.ts` |
| 서버 조회·변경 상태                            | Query·Mutation 훅      | `src/hooks/query/`, `src/hooks/mutations/`                     |
| 메시지 구독과 연결 상태                        | 소켓 훅                | `src/hooks/sockets/`                                           |

상태를 다른 계층으로 옮길 때는 누가 생성·갱신·정리하는지 먼저 결정함. 같은
상태를 페이지와 공용 훅이 각각 복제해 권위 있는 값을 둘로 만들지 않음.

## 공용 계약과 유틸리티

- `src/types/`는 공용 도메인 타입을 소유함. API 요청·응답 타입은
  `src/apis/requests/`·`src/apis/responses/`가 소유하고, 기능 안에서만 쓰는
  Props·상태 타입은 사용 지점 가까이에 둠.
- `src/util/`은 포맷, 검증, 인코딩, 브라우저 저장소 접근 같은 재사용 함수를
  소유함. `src/util/tableValidation.ts`, `src/util/formatting.ts`,
  `src/util/sessionStorage.ts`가 근거임.
- `src/constants/`는 여러 곳에서 쓰는 오류·URL·정적 값의 목적별 묶음을 소유함.

새 화면을 추가할 때는 라우트와 화면의 책임을 먼저 정하고, 기능 전용 구현을 화면
가까이에 배치함. 공용으로 승격하는 경우 실제 소비 범위와 상태 소유권을 확인함.
