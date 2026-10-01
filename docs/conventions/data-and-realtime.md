# 데이터와 실시간 통신 컨벤션

## Query와 Mutation

조회 훅은 `src/hooks/query/useGet*.ts`에서 `useQuery`를 감쌈. 배열 `queryKey`에
도메인 식별자와 매개변수를 넣고, `enabled`에 ID 유효성·화면 상태를 반영함. 자체
오류 UI가 필요한 조회는 `throwOnError: false`로 전역 Boundary 전파를 막음.
근거는 `src/hooks/query/useGetDebateTableData.ts`, `useGetPollInfo.ts`,
`useGetOrganizationTemplates.ts`에 있음.

변경 훅은 `src/hooks/mutations/`에서 `mutationFn`과 성공·실패 후 동작을 조립함.
성공 후 이동이나 화면 상태 변경은 호출자가 넘긴 `onSuccess`에 위임함. 중복 요청
방지가 필요한 변경은 `usePreventDuplicateMutation`을 사용함. 근거는
`src/hooks/mutations/useAddDebateTable.ts`, `useCreatePoll.ts`,
`usePostVoterPollInfo.ts`에 있음. 호출 방향은
[데이터 접근](../architecture/data-access.md)이 소유함.

## HTTP와 도메인 API

- HTTP는 단일 `axiosInstance` → `request<T>` → `src/apis/apis/{domain}.ts`
  순서로 호출함. 상위 API가 Axios를 직접 조립하지 않음.
- method는 제한된 literal union을 사용함. access token과 첫 401 재시도,
  `APIError` 변환은 하위 경계가 담당함.
- 도메인 함수 이름은 `get*`, `post*`, `put*`, `patch*`, `delete*`로 시작함. 함수
  위에 `// METHOD /api/...` 계약을 적음.
- 공통 URL은 `ApiUrl`에서 만들고 동적 segment만 함수에서 붙임. 동적
  path·query·공유 payload 문자열은 `encodeURIComponent`로 인코딩함.
- API 함수는 `response.data`를 반환함. 계약 타입은
  method+domain+`RequestType`/`ResponseType` 이름을 사용함. 모든 body를 별도
  파일로 분리하도록 강제하지 않음.
- **모든 도메인 API 함수**에 URL, method, parameter, 반환 body를 검증하는 직접
  MSW 테스트를 둠.

근거는 `src/apis/axiosInstance.ts`, `src/apis/primitives.ts`,
`src/apis/apis/live.ts`, `src/apis/apis/poll.ts`, `src/apis/apis/live.test.ts`에
있음.

## MSW와 Repository

MSW handler는 도메인별 `{domain}Handlers` 배열에 두고 실제 `ApiUrl`을 재사용함.
`http.{method}`와 `HttpResponse`로 응답하고 path param·query·body를 검사함.
복잡한 body·response는 API 계약 타입을 재사용함. 브라우저와 Node 테스트는
`src/mocks/handlers/global.ts`의 같은 `allHandlers`를 시작점으로 사용함.
테스트별 사례는 `server.use()`로 재정의함.

대체 데이터 소스가 필요한 기능은 공통 Repository interface와 구현 클래스를
분리함. 토론 테이블은 `getRepository()`가 게스트 여부에 따라 API·Session 구현을
선택함. 구현 인스턴스는 파일에서 한 번 생성함. 근거는
`src/repositories/DebateTableRepository.ts`, `ApiDebateTableRepository.ts`,
`SessionDebateTableRepository.ts`에 있음.

## 소켓 경계

소켓 이벤트·payload는 `src/apis/sockets/type.ts`의 유한 타입으로 표현함. 수신
값은 `unknown`에서 `src/apis/sockets/util.ts`의 검사 함수를 거친 뒤 사용함. 새
역할별 React 훅은 `useSocket`을 통해 연결·구독을 다루고, 옵션이 필요하면 기본값
`{}`인 options 객체를 사용함. 연결·구독 수명, version, 재연결과 상태 동기화의
계약은 [실시간 통신](../architecture/realtime.md)이 소유함.
