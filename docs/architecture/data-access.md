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

`src/apis/primitives.ts`의 `request<T>(method, endpoint, data, params)`가 Axios
호출과 `APIError` 변환을 담당함. 도메인 함수는 `src/apis/apis/{domain}.ts`에
있으며 공통 URL을 `src/apis/endpoints.ts`의 `ApiUrl`에서 가져옴. 성공 결과는
AxiosResponse 전체 대신 `response.data`로 반환함. 요청·응답 계약은
`src/apis/requests/`, `src/apis/responses/`에 배치함. 모든 요청 body를 별도 타입
파일에 두는 규칙은 없음.

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

## Repository와 MSW

`src/repositories/DebateTableRepository.ts`가 토론 테이블 CRUD 계약과
`getRepository()` 선택을 소유함. 게스트 흐름은 `SessionDebateTableRepository`,
그 외는 `ApiDebateTableRepository`를 사용함. 두 구현은 같은 인터페이스를 따르는
인스턴스로 제공됨. 세션 저장의 브라우저 경계는 `src/util/sessionStorage.ts`가
소유함.

`src/mocks/handlers/global.ts`의 `allHandlers`가 브라우저 개발 모드와 Node
테스트의 공통 핸들러 집합임. `src/mocks/browser.ts`와 `src/mocks/server.ts`는
같은 집합을 사용함. 도메인별 핸들러는 실제 `ApiUrl`을 재사용함. 테스트별 응답
변경은 `server.use()`로 해당 시나리오만 덮어씀.

API 실패의 사용자 복구와 Sentry 수집은 [오류와 관측](errors-observability.md)이
소유함.
