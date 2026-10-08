# 오류 처리와 Sentry 관측

## 오류의 흐름

```text
외부 경계 오류 → 도메인 Error 또는 안전한 폴백
             → 지역 복구 UI 또는 라우트 ErrorBoundary
             → 필요한 오류만 Sentry 수집
```

`src/apis/primitives.ts`의 `APIError`, `src/apis/sockets/error.ts`의
`SocketError`, `src/page/AudienceSharePage/error.ts`의 기능 오류가
종류·상태·원인을 보존함. 기술적 원본은 `unknown` 또는 상세 필드에 유지하고
사용자 상태와 분리함. 화면이 복구할 수 있는 조회 실패는 `throwOnError: false`와
`isError` 분기, 다시 시도 동작으로 처리함. 근거는
`src/page/TableOverviewPage/TableOverviewPage.tsx`,
`src/page/AudienceSharePage/AudienceSharePage.tsx`에 있음.

`src/routes/routes.tsx`의 최상위 라우트는 `ErrorBoundaryWrapper`를 통해 class
`ErrorBoundary`로 화면을 감쌈. 렌더 실패 시 `ErrorPage`가 fallback과 복구 동작을
제공함. 지역 처리와 전역 fallback의 선택은 사용자에게 복구 가능한 상태인지에
따름.

| 오류·상황                              | 처리 위치                                    | 코드 근거                                             |
| -------------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| 조회 화면에서 다시 시도할 수 있는 실패 | Query 오류 상태와 화면의 복구 UI             | `src/page/TableOverviewPage/TableOverviewPage.tsx`    |
| HTTP 요청 실패                         | interceptor 수집 후 `APIError`로 상위에 전달 | `src/apis/axiosInstance.ts`, `src/apis/primitives.ts` |
| 소켓 연결·메시지 실패                  | 소켓 오류 상태 또는 화면별 실패 상태         | `src/hooks/sockets/useSocket.ts`                      |
| 렌더 실패                              | 최상위 ErrorBoundary의 fallback              | `src/components/ErrorBoundary/ErrorBoundary.tsx`      |

## 수집과 개인정보 제거

`src/apis/axiosInstance.ts`의 interceptor가 HTTP 오류의 경로, method, 상태,
기능을 바탕으로 Sentry level·tag·fingerprint를 설정함. `src/util/sentry.ts`가
URL query, 요청·응답 context를 정리하고 `src/instrument.ts`가 Replay의
개인정보를 마스킹함.

수집한 Axios 오류에는 표식을 남기고, `APIError`로 변환할 때 그 표식을 전달함.
`ErrorBoundary`는 이미 수집된 오류를 다시 전송하지 않음. 취소·오프라인·복구
가능한 인증 실패처럼 대응하지 않을 오류는 `shouldSkipApiError`에서 제외함. 렌더
오류는 별도 `render-error`로 분류함.

`src/util/sentry.ts`는 동적 숫자 ID·UUID를 정규화한 endpoint와 언어 접두어를
제거한 화면 경로로 기능을 분류함. 400·404·409·422는 warning, 핵심 화면의 5xx는
fatal, 그 밖의 API 오류는 error 수준을 사용함. `shouldSkipApiError()`는 401, 400
미만 응답, 오프라인 오류를 제외함. 수집 정책을 바꿀 때 이 분류·제외와
interceptor·Boundary의 중복 방지를 함께 확인함.

## 실패 가능한 브라우저 경계

저장소, JWT, 클립보드 같은 브라우저 경계는 실패 시 `null`, `false`, 초기값 또는
대체 API를 반환함. 근거는 `src/hooks/useBrowserStorage.tsx`, `src/util/jwt.ts`,
`src/util/clipboard.ts`에 있음. 외부 입력이 오류 객체·JSON·소켓 메시지라면 먼저
`unknown`으로 받고 검사 후 사용함.

이 문서는 Sentry 오류 관측만 소유함. 제품 분석 이벤트의 정책은 이 문서의 범위
밖임.
