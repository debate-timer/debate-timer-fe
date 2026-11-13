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

## 중도 중단 이벤트의 기본 통신

일시정지 `STOP`의 타이머 payload와 정상 종료 `FINISHED`의 `data: null` 계약을 유지함. 신규 `ABORT`는 데이터 없는 이벤트 union에 추가하며 `data: null`일 때만 수신 검증을 통과함. 의미는 공유 토글 끄기·토론 중 로그아웃에 따른 중도 중단이며 일시 연결 단절과 구분함.

사회자는 기존 `/app/event/{roomId}`에 사회자 토큰·`X-Chairman-Session`·증가하는 `version`으로 발행함. 청중 훅은 기존 `/room/{roomId}`에서 유효한 `ABORT`를 수신하고 기존 version 규칙을 거쳐 `latestMessage`로 전달함. `serverTime`·version의 기존 선택·nullable 형식과 다른 이벤트의 의미를 변경하지 않음.

MP-01의 통신 범위는 발행·수신 기반까지임. 발행 함수는 서버의 중단 성공 여부를 반환하지 않고 발행 직후 disconnect를 수행하지 않음. 청중 화면의 중단 안내·기능 정리·재연결 차단은 후속 화면 연동 범위이며 현재 `ABORT`의 null payload를 타이머나 정상 종료로 해석하지 않음.

사회자 성공 확인·재시도·종료 상태 복원·새 청중 차단·구버전 중단 안내는 후속 통신 보완 사항임. 별도 목적지·`scope`·처리 결과 이벤트·공유 세션 필드는 추가하지 않았음. 모의 테스트 통과를 실제 서버 WS 연동 완료로 해석하지 않음.

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

## MP-03 명시적 공유 제어

`useLiveShareSession`이 오버레이와 독립된 `startSharing`·`stopSharing`·재시작을 제공함. `useLiveShare`는 MP-04까지 현재 모달 기반 화면 API를 유지하는 어댑터임. 새로운 시작은 확인 이후에만 호출하며, 시작 의사를 취소하면 지연 토큰으로 연결하거나 현재 상태를 다시 발행하지 않음.

`SocketManager.publish` → `useSocket.publish` → `useChairmanSocket.sendDebateEvent`는 로컬 STOMP 발행 여부를 boolean으로 전달함. 연결 부재·교체된 사회자·잘못된 타이머 payload는 발행하지 않음. 이 값은 서버의 명령 처리 성공을 뜻하지 않음.

MP-03에서 승인한 축소 범위에 따라 `stopSharing`은 연결 중 `ABORT`를 발행한 뒤 로컬 연결·구독·자동 재연결을 정리함. 발행 실패는 지역 오류로 남기고 로컬 정리는 수행함. 토큰 대기 취소는 중단 명령 실패로 표시하지 않음. 서버 성공 확인·상태 복원·새 청중 차단·이전 서버 세션의 지연 명령 차단은 후속 계약임. 기존 `STOP`·`FINISHED`의 의미와 payload는 유지함.

청중 상태 훅의 `handleAbort: true`는 `ABORT` 수신 시 종료 상태에 `terminationReason: 'ABORT'`를 보존하고 disconnect해 재연결을 막음. 이후 메시지는 반영하지 않음. 정상 종료는 `FINISHED` 사유로 구분함. 기본값은 기존 페이지 동작을 유지하며 MP-04에서 새 종료 안내에 연결함. 새로고침 뒤의 사유 복원은 보장하지 않음.

명시적 공유의 연결 실패는 로컬 연결 정리가 소켓 오류를 초기화해도 보존함. 사용자의 재시작 전에는 다시 연결하지 않으며 이전 소켓의 늦은 연결·오류·종료 이벤트는 현재 연결에 반영하지 않음.
