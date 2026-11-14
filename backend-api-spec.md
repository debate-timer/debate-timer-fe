# 헤더 개선 백엔드 API 요청 명세

[전체 작업 계획](master-plan.md)의 MP-01·B-01~B-04를 백엔드 협의용 요청·응답 명세로 정리한 문서임.
아래 신규 경로·필드명·상태 코드·WebSocket 형식은 **제안**임. 다만 2026-11-14 서버 코드 대조와 사용자 승인으로 B-02의 명시적 `null` 처리와 B-04의 `tableInfo.id`·nullable `agenda`를 수용했음. 나머지 제안은 서버의 확정 계약이나 구현 완료를 의미하지 않음.
2026-11-12 사용자 정정에 따라 일시정지 `STOP`·정상 토론 종료 `FINISHED`는 기존 계약을 유지하고 중도 중단 `ABORT`만 신규 이벤트로 추가함.
HTTP 비교 기준은 [개발 서버 OpenAPI](https://api.dev.debate-timer.com/docs/openapi3.yaml)의 `info.version: 0.0.1`임. 이 YAML에는 WS 명세가 없어 소켓 전송 형식은 현재 FE 계약과 대조한 제안임.

## 1. 요청 범위와 공통 형식

| 구분 | API | 요청 목적 |
| --- | --- | --- |
| B-01·신규 HTTP | `GET /api/member/settings` | 로그인한 본인의 언어·음량 설정 조회 |
| B-02·신규 HTTP | `PATCH /api/member/settings` | 본인 설정 부분 수정 |
| B-03·WS 확장 | 기존 이벤트에 `ABORT` 추가 | 중도 중단과 청중 통지. 기존 `STOP`·`FINISHED` 유지 |
| B-04·기존 HTTP 확장 | `GET /api/polls/{pollId}/votes` | 기존 응답에 시간표 이름·주제 추가 |

- HTTP body는 JSON이며 성공 시 별도 wrapper 없이 객체를 반환하는 안임.
- `number`는 JSON 숫자임. ID·개수·version·epoch ms는 정수로 취급하며 FE에서 정확히 표현 가능한 안전 정수 범위를 사용함. 실제 ID 허용 범위는 서버와 확인함.
- 필수 필드는 항상 포함하고, nullable 필드는 표에 `null`을 명시함. 선택 필드의 생략과 명시적 `null`은 구분함.
- 회원 HTTP 요청의 `Authorization: string`은 필수임. 현재 FE는 access token 원문을 보내므로 `Bearer` 접두어 변경은 별도 합의가 필요함. 근거는 [Axios 설정](src/apis/axiosInstance.ts)임.
- HTTP 오류의 현재 FE 계약은 `{ "message": string }`임. 아래 상태 코드 매핑은 제안이며 서버의 실제 오류 계약과 합의함. 근거는 [오류 응답 타입](src/apis/responses/global.ts)임.

## 2. B-01 — 회원 설정 조회

`GET /api/member/settings` — 인증된 본인의 설정만 조회함.

### Request

| 위치 | 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| Header | `Authorization` | `string` | 예 | 회원 access token |

Path parameter·query parameter·request body는 없음. 다른 회원의 ID도 받지 않음.

### Response

성공은 `200 OK`를 제안함.

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `language` | `"ko" \| "en" \| null` | 예 | 직접 선택해 저장한 언어임. 신규 회원·미선택은 `null`임 |
| `volume` | `number` | 예 | `0`~`1`의 유한값, 소수 1자리임. 저장값 누락 시 `0.5`임 |

```json
{
  "language": null,
  "volume": 0.5
}
```

언어가 `null`이면 FE에서 지원하는 브라우저 언어 → 한국어 순으로 적용하며 자동 감지값을 계정에 저장하지 않음.
응답의 두 필드는 누락하지 않는 안임. 기존 저장값의 미지원 언어·잘못된 음량에 대한 보정 또는 오류 정책은 서버와 확정함.

## 3. B-02 — 회원 설정 부분 수정

`PATCH /api/member/settings` — 인증된 본인의 언어·음량만 부분 수정함.

### Request

| 위치 | 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| Header | `Authorization` | `string` | 예 | 회원 access token |
| Header | `Content-Type` | `"application/json"` | 예 | JSON body |
| Body | `language` | `"ko" \| "en" \| null` | 선택 | 직접 선택한 언어임. `null`은 기존 값 유지임 |
| Body | `volume` | `number \| null` | 선택 | `null`은 기존 값 유지임. 숫자는 `0`~`1`의 유한값이며 두 번째 소수 자리에서 반올림해 소수 1자리로 저장함 |

두 body 필드 중 하나 이상은 `null`이 아닌 유효한 변경값이어야 함. 생략 필드와 명시적 `null` 필드는 기존 값을 유지함. 아래는 음량만 수정하는 예시임.

```json
{
  "volume": 0.74
}
```

`{ "language": "en" }` 및 `{ "language": "ko", "volume": 0.7 }`도 허용함.
`{ "language": null, "volume": 0.7 }`과 `{ "language": "en", "volume": null }`도 허용하며 `null` 필드는 수정하지 않음. body 자체가 `null`인 요청, 빈 body·빈 객체, 유효한 변경값 없이 모든 필드가 생략·`null`인 요청, 미지원 언어, 문자열 음량, 범위 밖 음량은 거절하는 안임. 범위 검사를 반올림보다 먼저 수행하며 `1.04`를 `1.0`으로 보정해 허용하지 않음.
두 필드를 함께 보내면 전체 유효성 확인 후 함께 반영하는 안임. 일부 필드만 저장한 뒤 성공하는 동작은 피함.

### Response

성공은 `200 OK`와 **두 필드를 모두 포함한 최종 설정**을 제안함. 필드 타입·기본값은 B-01 Response와 동일함.

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `language` | `"ko" \| "en" \| null` | 예 | 수정 후 저장된 언어 또는 기존 미선택 상태 |
| `volume` | `number` | 예 | 수정 후 저장된 정규화 음량 또는 기존 음량 |

```json
{
  "language": null,
  "volume": 0.7
}
```

위 예시는 언어 미선택 회원이 음량만 수정한 결과임. 동일 요청의 재시도는 같은 최종값을 만들어야 함.
FE는 계정별 저장 요청을 순서대로 보내며, 서버는 생략·`null` 필드를 덮어쓰지 않아야 함. 다른 기기의 실시간 설정 동기화는 요청하지 않음.
링크 진입 언어·자동 감지 언어·답변 시간·공유·속기 상태는 저장 대상에 포함하지 않음.

## 4. B-03 — 중도 중단 ABORT 이벤트 추가

기존 이벤트 전송 구조에 데이터 없는 `ABORT`를 추가하는 안임. 신규 이벤트 종류는 `ABORT` 하나이며, 기존 일시정지·정상 종료의 이름·payload·의미는 유지함.

| 이벤트 | 구분 | 의미·payload |
| --- | --- | --- |
| `STOP` | 기존 유지 | 타이머 일시정지임. 기존 `TimerDataPayload`를 그대로 사용함 |
| `FINISHED` | 기존 유지 | 정상 토론 종료임. 기존 `data: null`을 그대로 사용함 |
| `ABORT` | 신규 | 중도 중단임. `data: null`로 추가하는 안임 |

공유 토글 끄기·토론 중 로그아웃의 공유 정리에 `ABORT`를 사용함. 공유만 중단할 때 사회자 타이머·속기는 유지하고, 로그아웃은 별도의 로컬 정리를 수행함. 일시 연결 단절은 종료 이벤트로 변환하지 않음.

### Request — 사회자 중단 명령

기존 STOMP SEND 목적지 `/app/event/{roomId}`와 사회자 인증 헤더를 재사용하는 안임.

| 위치 | 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| Destination | `roomId` | `string` | 예 | 기존 룸 ID의 URL 문자열 표현임. FE 내부에서는 현재 `number`를 사용함 |
| STOMP Header | `Authorization` | `string` | 예 | 기존 사회자 발행용 `chairmanToken`임. 회원 HTTP access token과 구분함 |
| STOMP Header | `X-Chairman-Session` | `string` | 예 | 기존 사회자 세션 ID임. 현재 활성 사회자인지 서버에서 검증함 |
| Body | `eventType` | `"ABORT"` | 예 | 신규 중도 중단 이벤트 |
| Body | `data` | `null` | 예 | 기존 데이터 없는 이벤트와 같은 구조 |
| Body | `version` | `number` | 예·신규 발행안 | 현재 사회자가 발행 순서대로 증가시키는 기존 정수값을 재사용함 |

`version`은 기존 공용 FE 타입에서 선택 필드이지만 현재 사회자 발행 함수는 항상 포함함. 기존 이벤트의 선택·nullable 계약을 변경하지 않고 신규 `ABORT` 발행에 포함하는 안임.

`SEND /app/event/12` body 예시임.

```json
{
  "eventType": "ABORT",
  "data": null,
  "version": 1794441600000
}
```

### Response — 청중 중단 통지

서버가 중단을 확정한 뒤 기존 `/room/{roomId}` 채널로 `ABORT`를 통지하는 안임.

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `eventType` | `"ABORT"` | 예 | 확정한 중도 중단 이벤트 |
| `data` | `null` | 예 | 기존 데이터 없는 이벤트와 같은 구조 |
| `version` | `number` | 예·신규 통지안 | 기존 메시지 순서 규칙으로 요청의 version을 전달함 |
| `serverTime` | `number` | 예·신규 통지안 | 서버 중계 시각, Unix epoch milliseconds임. 현재 공용 타입은 선택·nullable이나 신규 통지에는 포함하는 안임 |

`SUBSCRIBE /room/12` 수신 예시임.

```json
{
  "eventType": "ABORT",
  "data": null,
  "version": 1794441600000,
  "serverTime": 1794441600100
}
```

`STOP`을 공유 정상 종료로 재정의하지 않으며 `FINISHED`를 대체하지 않음. 앞선 초안의 `scope`, `ShareState`, `SHARE_CONTROL_RESULT`, `SHARE_STATUS`는 필수 계약에서 제외함.

### 성공 확인·실패·상태 복원 협의

- 현재 사회자는 `/chairman/{roomId}`, 청중은 `/room/{roomId}`를 구독함. 청중 broadcast만으로 사회자가 중단 성공을 확인할 수는 없으므로, 사회자에게 처리된 `ABORT`를 확인시키는 수신 경로와 요청 식별 방식을 합의함. 새로운 이벤트 이름을 필수로 요구하지 않음.
- STOMP 전송 성공·receipt만으로 서버의 중단 확정을 판단하지 않음. 서버 처리 결과 확인 후 연결·구독을 정리하고 자동 재연결을 차단함. 대기 제한 시간 초과는 결과 불명으로 취급함.
- 중복 `ABORT`는 같은 공유를 여러 번 종료하지 않게 처리함. 이미 `FINISHED`로 종료된 공유에 늦은 `ABORT`가 도착해 정상 종료 사유를 바꾸지 않도록 최종 상태를 보존함.
- 기존 사회자 세션 검증으로 교체된 사회자의 중단을 거절함. 재공유 전후의 세션 식별과 오래된 명령·종료 이벤트 차단 방식은 서버와 확인함. 별도 `shareSessionId` 필드를 이 문서에서 확정하지 않음.
- 새 청중·재연결·종료 화면 새로고침에서도 종료 여부·사유를 복원할 기존 상태 전달 방식과 보존 기간을 확인함. 종료 이후의 `SYNC`·heartbeat가 공유를 되살리지 않게 함. 별도 HTTP 종료 API는 신설하지 않음.
- 현재 FE 검증기는 `ABORT`를 거절하므로 FE·서버 양쪽에 이벤트 처리를 추가해야 함. `ABORT` 미지원 구버전 청중의 중단 안내와 배포 순서는 별도 합의함. 기존 `STOP`·`FINISHED`는 회귀 검증 대상으로 유지함.

## 5. B-04 — 투표 청중 정보 응답 확장

`GET /api/polls/{pollId}/votes` — 기존 공개 조회에 `tableInfo`만 추가함. 투표 완료 화면도 같은 API를 사용함.

### Request

| 위치 | 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| Path | `pollId` | `string` | 예 | 숫자 투표 ID의 URL 문자열 표현임. OpenAPI 경로 타입을 따르며 시간표 ID가 아님 |

인증은 필요하지 않음. Query parameter·request body는 없음. 소유자 전용 시간표 API의 권한은 변경하지 않음.

### Response

성공은 기존 조회와 같이 `200 OK`를 사용하며, OpenAPI에 선언된 기존 공개 응답 필드를 유지함. 기존 schema에는 `required` 배열이 없어 필수성을 선언한 것으로 보지 않으며, 실제 반환 보장은 백엔드와 확인함.

| 필드 | 타입 | 구분 | 설명 |
| --- | --- | --- | --- |
| `id` | `number` | 기존 | 투표 ID |
| `status` | `"PROGRESS" \| "DONE"` | 기존 | 투표 진행·종료 |
| `prosTeamName` | `string` | 기존 | 찬성 팀 이름 |
| `consTeamName` | `string` | 기존 | 반대 팀 이름 |
| `totalCount` | `number` | 기존 | 전체 투표 수 |
| `prosCount` | `number` | 기존 | 찬성 투표 수 |
| `consCount` | `number` | 기존 | 반대 투표 수 |
| `participateCode` | `string` | 기존 | 기존 참여 코드 |
| `tableInfo` | `object` | 신규·필수 제안 | 헤더 표시용 공개 정보 |
| `tableInfo.id` | `number` | 서버 구현 수용 | 시간표 ID임. 최상위 투표 ID와 구분함 |
| `tableInfo.name` | `string` | 신규·필수 제안 | 시간표 이름임. 빈 값은 빈 문자열을 제안함 |
| `tableInfo.agenda` | `string \| null` | 서버 구현 수용 | 토론 주제임. FE API 함수가 `null`을 빈 문자열로 변환함 |

```json
{
  "id": 7,
  "status": "DONE",
  "prosTeamName": "찬성",
  "consTeamName": "반대",
  "totalCount": 10,
  "prosCount": 6,
  "consCount": 4,
  "participateCode": "existing-participation-code",
  "tableInfo": {
    "id": 12,
    "name": "정기 토론회",
    "agenda": "교내 스마트폰 사용을 허용해야 하는가"
  }
}
```

기존 필드 근거는 OpenAPI의 `api-polls-pollId-votes1646192664` schema임. 공개 청중 응답에는 `voterNames`가 없으며, 인증이 필요한 사회자 조회에만 선언돼 있음. [FE 공개 응답 타입](src/apis/responses/poll.ts)도 이름 목록을 포함하지 않으며 백엔드 공개 API에 이름 목록 추가를 요구하지 않음.
표의 상태 union은 기존 설명과 FE 도메인 타입을 따른 의미상의 제한임. OpenAPI는 상태를 `string`, ID·개수를 `number`로 선언하며 enum·정수·범위 제약은 명시하지 않음. 실제 보장 범위는 백엔드와 확인함. 기존 필드의 공개 범위와 반환 의미는 유지함.
종료된 투표도 조회 가능해야 함. 조회 가능 기간·삭제·만료 처리와 시간표 삭제 후 공개 정보 보존 여부를 합의함. `agenda`의 `null`은 허용하며 `name`의 빈 값 정책은 서버와 최종 확인함.
별도 완료 화면 API·신규 `tableId` 요청 매개변수·신규 참가자 개인정보는 추가하지 않음. 공개 응답의 `tableInfo.id`는 기존 서버 구현을 수용함. `pollId` 공개 조회만으로 특정 사용자의 투표 완료 여부를 판정하지 않음.

## 6. 실패 응답과 백엔드 확인 사항

HTTP 실패 body의 필드는 `message: string`을 필수로 사용하는 안임. 아래 상태 코드는 협의 대상임.

| 대상 | 상태·결과 제안 | 조건 |
| --- | --- | --- |
| B-01·B-02 | `401` | 회원 인증 없음·만료 |
| B-02 | `400` | 빈 요청·잘못된 타입·body 자체가 `null`·유효한 변경값 없음·미지원 언어·범위 밖 음량 |
| B-04 | `400` / `404` / `410` | 잘못된 ID / 대상 없음·삭제 / 보존 기간 만료. 서버의 구분 가능 범위를 확인함 |
| 전체 HTTP | `500` 계열 | 서버 처리 실패 |
| B-03 | 기존 WS 오류 계약과 합의 | 인증 오류·권한 없음·사회자 교체·대상 없음·오래된 공유 세션·잘못된 명령·이미 종료 |

- B-03의 구체 오류 코드·요청 식별·오류 전달 방식과 연결 오류·명령 거절의 구분을 확정함. 별도 `REJECTED`·`ALREADY_ENDED` 응답 enum은 확정하지 않음.
- 서버는 종료 상태 확정 → 청중 통지를 수행하고 FE는 결과 확인 → 연결·구독 정리 순서로 처리함. 응답 유실 시 상태 복원 방식은 B-03의 협의 사항임.
- 기존 라이브 `GET /api/live/table/customize/{tableId}`에는 이미 이름·주제가 있으므로 필드 추가는 없음. 정상 종료·공유 중단 후 조회 가능 기간과 실패 계약만 확인함.
- 공유 시작·재활성화의 허용 조건, 인증 만료·탭 닫기·오프라인 시 서버의 사회자 부재·유효시간 정리를 확인함. 재공유 링크 재사용·기존 청중 재입장 경험 개편은 범위 밖임.
- STT·로그아웃·토론 기록 API는 재사용함. 문의 접수 API·전사 취소/삭제 API·공유 중단 HTTP API는 신설하지 않음.
- 인도물은 확정 명세, 요청·응답·이벤트 예시, 권한·오류·상태 전이·구버전 호환 방안과 검증 가능한 환경임.

설정의 목표 정책과 미확정 질문은 [전역 설정 위키](docs/wiki/feature/settings.md)를 따름. 공유·투표의 별도 기능 위키는 현재 없음. 제품 근거는 전체 작업 계획, 현재 기술 계약은 [데이터 접근](docs/architecture/data-access.md)·[실시간 통신](docs/architecture/realtime.md)을 사용함. 합의 후 확정 계약은 해당 소유 문서에 반영함.
