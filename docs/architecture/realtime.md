# 실시간 통신

## 계층과 호출

```text
TimerPage·AudienceSharePage
  → useChairmanSocket·useAudienceSocket
  → useSocket
  → SocketManager
  → STOMP/SockJS
```

`src/apis/sockets/SocketManager.ts`가 STOMP 연결, 송수신, 재연결과 연결 이벤트를
소유함. private 생성자와 `getInstance()`로 단일 인스턴스를 제공함.
`src/hooks/sockets/useSocket.ts`가 연결 상태를 React에 노출하고, 채널별 활성
구독과 재연결용 구독 정보를 관리함. 역할별 훅은 사회자·청중의 메시지 정책을
담당함. 새 코드를 작성할 때의 명명과 검증 형식은
[데이터·실시간 컨벤션](../conventions/data-and-realtime.md)이 소유함.

## 연결과 구독의 수명

`useSocket.connect()`는 `SocketManager.connect()`에 위임함. `subscribe()`는
목적지, 콜백, 선택적 헤더를 저장하고 연결 상태에서 활성 구독을 만듦. 헤더를
함수로 주면 재구독 시 최신 값을 다시 구함. 연결 이벤트가 오면 구독 정보를 사용해
활성 구독을 복원함. 같은 목적지의 중복 활성 구독은 만들지 않음.

`useSocket`의 unmount는 자신이 만든 구독과 manager listener를 해제함. 연결
자체를 끊는 책임은 연결을 시작한 화면에 있음. 역할별 훅은 room 변경 시 이전
목적지를 구독 해제함. 근거는 `src/hooks/sockets/useSocket.ts`,
`useAudienceSocket.ts`, `useChairmanSocket.ts`에 있음.

| 역할   | 구독 목적지          | 발행·상태 책임                                                         |
| ------ | -------------------- | ---------------------------------------------------------------------- |
| 사회자 | `/chairman/{roomId}` | 동기화 요청과 교체 알림을 받고 `/app/event/{roomId}`에 이벤트를 발행함 |
| 청중   | `/room/{roomId}`     | 검증된 사회자 이벤트를 수신하고 화면 상태에 전달함                     |

`useChairmanSocket`은 새 연결에서 세션 ID와 신호 상태를 초기화하고, 사회자 교체
알림을 받으면 발행을 멈추고 연결을 끊음. `useAudienceSocket`은
`enabled: false`일 때 구독하지 않고 이전 메시지를 비움. 두 훅 모두 명시적 연결
종료에서 세션 단위 메시지 상태를 초기화함.

## 수신 계약과 순서

수신 본문은 `src/apis/sockets/util.ts`에서 `unknown`으로 파싱하고 type guard를
통과한 메시지만 상태에 반영함. 이벤트·payload 형태는
`src/apis/sockets/type.ts`가 정의함. 사회자는 발행할 `version`을 증가시키고,
청중은 이미 처리한 version보다 오래된 메시지를 무시함. 청중의 화면 상태 해석은
`src/page/AudienceSharePage/hooks/EventInterpreter.ts`가 맡음.

`CHAIRMAN_ABSENT`는 서버 알림으로 따로 기록하며 사회자 메시지 시각·version을
갱신하지 않음. 검증된 사회자 메시지는 version이 오래되어 화면에 반영하지
않더라도 마지막 수신 시각은 갱신함. version이 없는 이전 형식 메시지는 version
기준이 생기기 전까지만 반영함. 이 순서 계약은
`src/hooks/sockets/useAudienceSocket.ts`가 소유함.

## 복구와 현재 상태

`SocketManager`의 재연결은 지수 backoff와 jitter를 사용하고 횟수·시간 제한을
옵션으로 받음. 연결이 회복되면 `useSocket`이 구독을 복구함. 사회자 훅은
재연결·신규 청중의 동기화 요청·주기적 heartbeat에 현재 상태 `SYNC`를 발행함.
청중 훅은 재입장이나 탭 복귀 시 재동기화를 요청함. 연결 실패는 소켓 오류 상태로
노출함.

사회자 교체 시 발행을 중단하고 연결을 해제하는 처리는
`src/hooks/sockets/useChairmanSocket.ts`에 있음. 타이머 이벤트의 payload 생성과
화면 반영은 각 페이지의 코드가 맡음. 이 문서는 연결·구독·메시지 경계의 공통
계약만 소유함.
