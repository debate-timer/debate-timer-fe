# 앱 초기화·라우팅·국제화

## 앱 시작

`src/main.tsx`가 앱 초기화를 소유함. `VITE_MOCK_API`가 활성화된 경우
`src/mocks/browser.ts`의 worker 시작 완료 후 앱을 렌더링함. 이후
`QueryClientProvider` → `GlobalSettingsProvider` → `GlobalPortal.Provider` → `RouterProvider` 순으로
조립함. Query와 Mutation의 기본 `throwOnError`는 `true`이며, 지역 오류 UI가
필요한 조회 훅과 화면이 실패를 직접 처리하는 변경 훅에서 개별 설정을 변경함.
변경 훅 예시는 로그인 실패 시 메인으로 이동하는
`src/hooks/mutations/usePostUser.ts`에 있음. API 모방과 조회 경계는
[데이터 접근](data-access.md)이 소유함.

`src/i18n.ts`가 번역 파일 로딩, 언어 감지, React 연결을 초기화함.
`src/instrument.ts`가 Sentry 초기화 경계임. 언어 변경에 따른 Sentry 태그와 분석
사용자 속성 갱신은 `src/main.tsx`에서 수행함. 분석 이벤트 정책은 이번 문서
체계에 포함하지 않음.

## 라우트 구성

`src/routes/routes.tsx`의 `APP_ROUTES`가 `path`, `element`, `requiresAuth`를 한
항목에 보관함. 인증이 필요한 항목만 `ProtectedRoute`로 감싸고, 기본 경로와
`:lang` 경로에 같은 목록을 사용함. 최상위 `src/routes/RootLayout.tsx`가
`ErrorBoundaryWrapper`, `ScrollRestoration`을 조립함.
`ErrorBoundaryWrapper`는 라우트 화면의 렌더 오류를 받음. `ScrollRestoration`은 새
화면으로 이동하면 맨 위부터 보여 주고, 뒤로가기·앞으로가기에서는 이전 스크롤
위치를 복원함. 언어 전환도 새 경로로 이동하므로 맨 위로 올라감.

`src/routes/ProtectedRoute.tsx`는 토큰이 없으면 현재 위치를 남기고 언어가 적용된
소개 경로로 `replace` 이동하고 `loginRequest`에 원래 내부 목적지를 전달함. 소개 화면의 공용 로그인 확인이 이를 소비하며 취소 전에는 OAuth를 시작하지 않음. 화면은 `useParams`, `useSearchParams`,
`useNavigate`로 라우트 입력과 이동을 처리함. 숫자 식별자는 변환 후 유효성과 존재
여부를 검사함. 언어를 보존하는 이동 경로는 `buildLangPath`로 만듦.

| 단계           | 소유 코드                         | 결과                                          |
| -------------- | --------------------------------- | --------------------------------------------- |
| 라우트 선언    | `src/routes/routes.tsx`           | 경로·화면·인증 필요 여부를 한 항목에 보관함   |
| 인증 판정      | `src/routes/ProtectedRoute.tsx`   | 미인증이면 언어별 홈으로 이동함               |
| 기능 판정      | `src/routes/FeatureFlagRoute.tsx` | 피쳐 플래그가 없으면 언어별 대시보드로 이동함 |
| 언어 정규화    | `src/routes/LanguageWrapper.tsx`  | 기본 언어 접두어를 없애고 i18n 상태를 맞춤    |
| 화면 입력 처리 | 각 `src/page/` 컴포넌트           | URL 값을 검증한 뒤 기능 훅에 전달함           |

### 피쳐 플래그

회원별로 여는 기능은 `src/types/featureFlag.ts`의 `FeatureFlag`로 표현함.
`src/hooks/useFeatureFlag.ts`가 `GET /api/member/feature-flags` 조회 결과로 보유
여부를 판정하며, 조회 중이거나 실패하면 사용할 수 없는 것으로 봄. 기능 전용
라우트는 `APP_ROUTES`의 `element`를 `FeatureFlagRoute`로 감싸고, 화면 안의
진입점은 같은 훅으로 숨김. 로그아웃하면 조회 결과를 지움. 현재 `TRANSCRIPT`가
타이머 화면의 토론 기록 컨트롤, 독립 기록 목록과 헤더 진입점, 속기록 상세 화면을
제어함. 속기록 공유 링크 화면(`transcript/shared/:shareToken`)은 공유받은
사람이 보는 화면이므로 로그인과 피쳐 플래그 없이 열림.

## 언어와 URL

- `src/i18n.ts`의 지원 언어는 `ko`, `en`이며 기본 언어는 `ko`임. 초기 감지는 경로 → 브라우저 언어이며 저장 설정의 적용은 전역 설정 계층이 소유함.
- `src/util/languageRouting.ts`는 기본 언어의 `/ko` 접두어를 없애고 다른 언어에
  `/{lang}`을 붙이는 경로 함수를 소유함.
- `src/routes/LanguageWrapper.tsx`는 URL과 i18n 상태를 맞추고 정규화 이동에
  `replace`를 사용함.
- 제품 문구의 번역 적용 범위와 버튼 이름 규칙은
  [React·UI 컨벤션](../conventions/react-and-ui.md)이 소유함.

라우트를 추가할 때 `APP_ROUTES`의 인증 여부와 언어 경로를 함께 확인함. 새
페이지가 URL 식별자를 사용하면 입력 검증과 실패 화면을 함께 정함.

경로를 정규화하거나 인증 때문에 이동할 때는 이전 URL을 다시 방문하지 않도록
`replace`를 사용함. 페이지 안에서 링크를 만들 때는 언어 접두어를 문자열로 직접
이어 붙이지 않고 `buildLangPath`를 사용함. 지원하지 않는 언어가 URL에 들어온
경우 `LanguageWrapper`와 경로 함수의 현재 처리 방식을 함께 확인함.

## 전역 설정의 언어 연결

언어 감지의 자동 localStorage 캐시를 끄고 명시 링크·직접 선택·계정/비회원 저장값을 구분함. LanguageWrapper가 공용 설정으로 i18n·문서 언어·URL을 맞추며 query·hash를 보존함. 언어 접두어만 변경하는 이동은 속기 이탈로 처리하지 않음.

## MP-04 경로·역할·로그인 복귀

소개 `/`·시간표 `/dashboard`·기록 `/records`를 각각 제공함. 시간표·기록은 인증이 필요하고 기록 목록·상세는 `TRANSCRIPT` 권한을 유지함. `CompatibilityRoute`가 인증 검사보다 먼저 `/home`과 이전 기록 탭 링크를 replace 정규화함. 소비한 `tab`만 제거하고 언어·나머지 query·hash·방문 state를 유지함.

`src/util/headerNavigation.ts`의 역할 판정을 라우트 `handle.headerRole`과 오류·기본 헤더 선택이 공유함. 기본 타이머·피드백·사회자 투표는 타이머, 라이브·투표 청중은 청중, 나머지는 일반 역할임. 헤더 데이터·조작은 페이지가 전달하며 정보가 없는 경계에서는 해당 역할의 대체 헤더를 제공함.

`useLoginPrompt`가 로그인 확인과 게스트 유지 선택을 조립하고 `src/util/loginReturn.ts`가 현재 탭의 허용 경로를 `login-return`에 보존함. 외부 경로·OAuth 재진입·제어 문자는 거절하고 목적지는 한 번 소비함. 전체 history state를 복제하지 않으며 실제 청중 종료 사유만 같은 테이블의 종료 경로에 결속해 보존함. 저장소 실패는 기본 복귀를 사용함.

OAuth 성공은 게스트 유지의 `/share` → 검증한 복귀 목적지 → `/dashboard` 순서임. 실패·로그아웃·인증 만료의 소개 목적지는 `/`임. 콜백은 replace 이동하고 기존 코드 재사용 방지를 유지함. `BackActionHandler`의 이력 재삽입은 제거했음. 일반 브라우저 뒤로 가기와 앞·뒤 이동의 스크롤 복원을 사용함. 언어 선택은 query·hash와 기존 방문 문맥을 함께 전달함.

공개 라이브·투표 링크는 `buildPublicUrl`에서 공유 호스트와 `VITE_BASE_PATH`를 조합함. 미리보기 basename을 잃거나 비생산 투표 URL에 `undefined`를 넣지 않음. Sentry는 소개를 `landing`, 대시보드·기록 목록을 기존 `table-list`로 분류함. 제품 정책과 승인 근거는 [헤더와 탐색](../wiki/feature/navigation.md)이 소유함.
