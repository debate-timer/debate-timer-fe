# 앱 초기화·라우팅·국제화

## 앱 시작

`src/main.tsx`가 앱 초기화를 소유함. `VITE_MOCK_API`가 활성화된 경우
`src/mocks/browser.ts`의 worker 시작 완료 후 앱을 렌더링함. 이후
`QueryClientProvider` → `GlobalPortal.Provider` → `RouterProvider` 순으로
조립함. Query와 Mutation의 기본 `throwOnError`는 `true`이며, 지역 오류 UI가
필요한 조회 훅에서 개별 설정을 변경함. API 모방과 조회 경계는
[데이터 접근](data-access.md)이 소유함.

`src/i18n.ts`가 번역 파일 로딩, 언어 감지, React 연결을 초기화함.
`src/instrument.ts`가 Sentry 초기화 경계임. 언어 변경에 따른 Sentry 태그와 분석
사용자 속성 갱신은 `src/main.tsx`에서 수행함. 분석 이벤트 정책은 이번 문서
체계에 포함하지 않음.

## 라우트 구성

`src/routes/routes.tsx`의 `appRoutes`가 `path`, `element`, `requiresAuth`를 한
항목에 보관함. 인증이 필요한 항목만 `ProtectedRoute`로 감싸고, 기본 경로와
`:lang` 경로에 같은 목록을 사용함. 최상위 `ErrorBoundaryWrapper`는 라우트 화면의
렌더 오류를 받음.

`src/routes/ProtectedRoute.tsx`는 토큰이 없으면 현재 위치를 남기고 언어가 적용된
홈 경로로 `replace` 이동함. 화면은 `useParams`, `useSearchParams`,
`useNavigate`로 라우트 입력과 이동을 처리함. 숫자 식별자는 변환 후 유효성과 존재
여부를 검사함. 언어를 보존하는 이동 경로는 `buildLangPath`로 만듦.

| 단계           | 소유 코드                        | 결과                                        |
| -------------- | -------------------------------- | ------------------------------------------- |
| 라우트 선언    | `src/routes/routes.tsx`          | 경로·화면·인증 필요 여부를 한 항목에 보관함 |
| 인증 판정      | `src/routes/ProtectedRoute.tsx`  | 미인증이면 언어별 홈으로 이동함             |
| 언어 정규화    | `src/routes/LanguageWrapper.tsx` | 기본 언어 접두어를 없애고 i18n 상태를 맞춤  |
| 화면 입력 처리 | 각 `src/page/` 컴포넌트          | URL 값을 검증한 뒤 기능 훅에 전달함         |

## 언어와 URL

- `src/i18n.ts`의 지원 언어는 `ko`, `en`이며 기본 언어는 `ko`임. 감지 순서는
  경로 → `localStorage` → 브라우저 언어임.
- `src/util/languageRouting.ts`는 기본 언어의 `/ko` 접두어를 없애고 다른 언어에
  `/{lang}`을 붙이는 경로 함수를 소유함.
- `src/routes/LanguageWrapper.tsx`는 URL과 i18n 상태를 맞추고 정규화 이동에
  `replace`를 사용함.
- 제품 문구의 번역 적용 범위와 버튼 이름 규칙은
  [React·UI 컨벤션](../conventions/react-and-ui.md)이 소유함.

라우트를 추가할 때 `appRoutes`의 인증 여부와 언어 경로를 함께 확인함. 새
페이지가 URL 식별자를 사용하면 입력 검증과 실패 화면을 함께 정함.

경로를 정규화하거나 인증 때문에 이동할 때는 이전 URL을 다시 방문하지 않도록
`replace`를 사용함. 페이지 안에서 링크를 만들 때는 언어 접두어를 문자열로 직접
이어 붙이지 않고 `buildLangPath`를 사용함. 지원하지 않는 언어가 URL에 들어온
경우 `LanguageWrapper`와 경로 함수의 현재 처리 방식을 함께 확인함.
