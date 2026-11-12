# 데이터 접근과 저장소

## 호출 방향

```text
page/component → Query·Mutation 훅 → Repository 선택 → API 또는 Session 구현
                                         └→ 도메인 API → request<T> → Axios
```

모든 화면이 Repository를 거쳐야 하는 것은 아님. 데이터 소스를 바꿔야 하는 토론
테이블 기능은 Repository를 사용하고, 다른 도메인은 Query·Mutation 훅에서 도메인
API를 직접 호출함. 구현 형식과 테스트 규칙은
[데이터·실시간 컨벤션](../conventions/data-and-realtime.md)이 소유함.

## HTTP 경계

`src/apis/axiosInstance.ts`가 단일 Axios 인스턴스의 base URL, timeout, JSON
헤더, credential, 인증·응답 interceptor를 소유함. request interceptor가 access
token을 붙임. 첫 401은 `_retry`로 제한하고 재발급에 성공하면 원래 요청을 다시
보냄. 재발급이 실패하면 인증 상태를 정리하고 홈으로 이동함.

계정에 결속해야 하는 요청은 `RequestOptions.expectedMemberId`에 시작 계정을 보존함. 이 값은 Axios 내부 메타데이터이며 HTTP header·body·query로 전송하지 않음. 해당 옵션이 있는 요청은 실제 전송 전·응답 수신·401 재발급 전후에 현재 회원 ID와 토큰 존재를 확인함. 계정 변경·로그아웃 시 취소하고, 이전 요청의 재발급 결과로 새 계정 토큰을 교체하거나 인증을 정리하지 않음. 같은 계정의 토큰 재발급은 허용하며 옵션 없는 기존 API의 재발급 동작은 유지함.

`src/apis/primitives.ts`의 `request<T>(method, endpoint, data, params)`가 Axios
호출과 `APIError` 변환을 담당함. 도메인 함수는 `src/apis/apis/{domain}.ts`에
있으며 공통 URL을 `src/apis/endpoints.ts`의 `ApiUrl`에서 가져옴. 성공 결과는
AxiosResponse 전체 대신 `response.data`로 반환함. 요청·응답 계약은
`src/apis/requests/`, `src/apis/responses/`에 배치함. 모든 요청 body를 별도 타입
파일에 두는 규칙은 없음.

파일 업로드처럼 기본 JSON 헤더·5초 제한 시간과 다른 요청은 다섯째 인자
`options`의 `headers`·`timeout`으로 덮어씀. FormData는 `Content-Type`을
`multipart/form-data`로 지정해야 Axios가 JSON으로 바꾸지 않고 boundary를 붙임.
`src/apis/apis/stt.ts`의 `postSonioxTranscription()`이 예시임. jsdom의
FormData·Blob 본문은 MSW가 끝까지 읽지 못하므로 이 API의 직접 MSW 테스트는
`// @vitest-environment node`에서 실행함.

`src/apis/apis/live.ts`의 `getChairmanToken()`은 `ApiUrl.live`에 인코딩된 table
ID를 붙여 `request<GetChairmanTokenResponseType>('GET', endpoint, null, null)`을
호출한 뒤 `response.data`를 반환함. 화면이 Axios 설정이나 HTTP 응답 전체를 알
필요가 없는 경계임. 새 도메인 함수를 추가하면 같은 경계를 유지하고
[직접 MSW 테스트](../conventions/data-and-realtime.md)를 작성함.

## 서버 상태

`src/hooks/query/`의 조회 훅은 배열 `queryKey`에 도메인과 매개변수를 포함함.
`enabled`로 ID·화면 조건을 반영함. 자체 오류 UI가 있는 조회는
`throwOnError: false`를 사용함. `src/hooks/mutations/`의 변경 훅은 `mutationFn`,
후속 `onSuccess`, 필요한 `onError`를 조립함. 중복 제출 차단이 필요한 변경은
`usePreventDuplicateMutation`을 사용함. 예시는
`src/hooks/query/useGetDebateTableData.ts`,
`src/hooks/mutations/useAddDebateTable.ts`에 있음.

| 작업                                       | 선택할 진입점               | 화면에 돌려주는 결과              |
| ------------------------------------------ | --------------------------- | --------------------------------- |
| 서버 데이터 조회                           | `src/hooks/query/useGet*`   | Query의 데이터·대기·오류 상태     |
| 서버 상태 변경                             | `src/hooks/mutations/use*`  | Mutation의 실행 함수·상태         |
| 데이터 소스 전환이 필요한 토론 테이블 CRUD | `getRepository()`           | API 또는 Session 구현의 공통 응답 |
| 직접 HTTP 계약 추가                        | `src/apis/apis/{domain}.ts` | 성공 body 또는 `APIError`         |

## 회원 설정과 공개 투표

회원 설정은 `GET/PATCH /api/member/settings`를 사용함. `getMemberSettings()`·`patchMemberSettings()`가 기존 HTTP 경계를 재사용하며, 응답은 `language: 'ko' | 'en' | null`·`volume: number`임. 부분 수정은 최소 한 필드가 필요하고 생략 필드는 전송하지 않음. 음량의 범위 검사·소수 1자리 반올림은 서버가 수행하며 FE API는 정규화된 최종 응답을 반환함.

설정 API는 호출 시점에 로그인 계정을 확인하고 `expectedMemberId`로 HTTP 요청·재시도·응답까지 결속함. 훅의 진입 검사와 캐시 키 분리만으로 전송 계정의 일치를 보장하지 않음. 계정 변경에 따른 취소는 호출자에게 취소 오류로 전달하고 서버 오류로 변환하지 않음.

`useGetMemberSettings(memberId)`는 `['MemberSettings', memberId]` 키로 계정별 캐시를 분리함. 회원 ID는 캐시 식별자이며 HTTP body·query로 보내지 않음. 현재 access token과 일치하는 회원 ID가 있어야 조회하며, 수동 재시도도 같은 인증 조건을 검사함. 자동 재시도·재마운트·포커스·재연결·주기 재조회를 끄고 `staleTime`·`gcTime`은 `Infinity`로 설정함.

`usePatchMemberSettings(memberId)`는 요청 시작 계정을 보존함. 성공 시 해당 계정의 진행 중 조회를 취소해 지연 조회가 최종 저장값을 되돌리지 못하게 하고, 여전히 같은 계정으로 로그인한 경우에만 전체 최종 응답을 캐시에 반영함. 같은 계정의 토큰 재발급은 허용함. 실패 시 기존 캐시를 유지하고 두 훅 모두 `throwOnError: false`로 지역 복구 상태를 제공함.

설정 훅은 아직 화면에 연결하지 않았음. 전역 적용값·500ms 저장 지연·연속 저장 순서·로그아웃 시 조회 취소와 캐시 제거는 후속 전역 설정 계층이 소유함. 비회원 값이나 조회 실패의 기본값을 서버에 자동 저장하지 않음.

공개 `GET /api/polls/{pollId}/votes`의 `GetVoterPollInfoResponseType`은 `tableInfo: { name: string; agenda: string }`를 포함함. `id`는 투표 ID이며 시간표 ID가 아님. 공개 응답에는 `voterNames`가 없고 사회자 조회의 이름 목록은 유지함. FE는 숫자 투표 ID를 인코딩해 URL 문자열로 전송하며 기존 `['VoterPoll', pollId]` 키를 유지함.

회원 설정 MSW 핸들러는 모의 인증 토큰별로 저장 상태를 분리하며 `resetMemberSettings()`로 초기화함. 토큰 문자열은 개발·테스트용 계정 구분자임. 실제 서버의 토큰 검증·계정 저장 구현을 모방하는 계약은 아님. `setup.ts`가 각 테스트 뒤 상태를 초기화하고, 공개 투표의 진행·종료·빈 정보·오류는 테스트별 핸들러로 검증함.

## Repository와 MSW

`src/repositories/DebateTableRepository.ts`가 토론 테이블 CRUD 계약과
`getRepository()` 선택을 소유함. 게스트 흐름은 `SessionDebateTableRepository`,
그 외는 `ApiDebateTableRepository`를 사용함. 두 구현은 같은 인터페이스를 따르는
인스턴스로 제공됨. 게스트 테이블 세션 저장의 브라우저 경계는
`src/util/sessionStorage.ts`가 소유함. 타이머 화면에서 쌓아 종료 화면에서 보내는
토론 기록 초안은 `src/util/transcriptDraft.ts`가 테이블별 키로 소유함. 초안은
STT 모드(`RPC`·`SONIOX`)와 Soniox 전사를 기다리는 구간을 함께 저장하고, 종료
화면은 대기 구간이 끝난 뒤 초안을 보냄.

`src/mocks/handlers/global.ts`의 `allHandlers`가 브라우저 개발 모드와 Node
테스트의 공통 핸들러 집합임. `src/mocks/browser.ts`와 `src/mocks/server.ts`는
같은 집합을 사용함. 도메인별 핸들러는 실제 `ApiUrl`을 재사용함. 테스트별 응답
변경은 `server.use()`로 해당 시나리오만 덮어씀.

API 실패의 사용자 복구와 Sentry 수집은 [오류와 관측](errors-observability.md)이
소유함.
