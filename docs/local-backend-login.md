# 로컬 BE 연동 테스트 (OAuth 우회 로그인)

로컬 BE(`debate-timer-be`, `local` 프로필)와 FE를 함께 띄워 테스트할 때 쓰는 방법입니다.
로컬에서는 Google OAuth 로그인이 동작하지 않으므로, 테스트 회원을 직접 넣고 local JWT secret으로 서명한 액세스 토큰을 `localStorage`에 넣어 로그인한 상태로 만듭니다.

## 1. 로컬 BE 실행

`local` 프로필은 H2 메모리 DB(`jdbc:h2:mem:database`)를 사용하므로 **BE를 재시작하면 회원·테이블 데이터가 모두 사라집니다.** 재시작 후에는 2단계부터 다시 진행하세요.

`application-local.yml`의 CORS 허용 origin은 `http://localhost:8080`뿐이라 FE 개발 서버(`3000`)의 요청과 SockJS 연결이 막힙니다. 실행 인자로 `3000`을 추가합니다.

```bash
cd ../debate_timer/debate-timer-be
sh ./gradlew bootRun --args='--cors.origin.cors-origin=http://localhost:3000,http://localhost:8080'
```

- `gradlew`에 실행 권한이 없으면 `./gradlew` 대신 `sh ./gradlew`로 실행합니다.
- `Started DebateTimerApplication` 로그가 보이면 준비된 것입니다.

## 2. FE 실행

`.env.local`의 `VITE_API_BASE_URL`이 `http://localhost:8080`인지 확인한 뒤 실행합니다.

```bash
npm run dev   # http://localhost:3000
```

## 3. 테스트 회원 생성 + 액세스 토큰 발급

```bash
node scripts/local-login-token.mjs            # 기본 이메일: local-tester@debate.local
node scripts/local-login-token.mjs me@test.dev  # 이메일 지정
```

스크립트가 하는 일:

1. H2 콘솔(`/h2-console`)로 `MEMBER` 테이블에 회원을 넣습니다. 같은 이메일이 있으면 그대로 둡니다.
   BE는 토큰의 이메일(`sub`)로 회원을 조회하므로 회원 행이 반드시 있어야 합니다.
2. local secret(`jwt.secret_key`)으로 `type: ACCESS_TOKEN` JWT(HS256)를 서명합니다.
3. `GET /api/table`로 토큰이 통과하는지 확인합니다.
4. 브라우저 콘솔에 붙여넣을 코드를 출력합니다.

환경 변수로 기본값을 바꿀 수 있습니다: `LOCAL_API_BASE_URL`, `LOCAL_JWT_SECRET`, `LOCAL_TOKEN_TTL_SECONDS`(기본 86400초).

## 4. 브라우저에 토큰 넣기

`http://localhost:3000`을 열고 개발자 도구 콘솔에 스크립트가 출력한 코드를 붙여넣습니다.

```js
localStorage.setItem('accessToken', '<accessToken>');
localStorage.setItem('memberId', '<memberId>');
location.reload();
```

FE는 `localStorage.accessToken`을 `Authorization` 헤더에 그대로 붙여 보냅니다(`src/util/accessToken.ts`, `src/apis/axiosInstance.ts`).

## 참고

- refresh token 쿠키는 없으므로 토큰이 만료되면 3~4단계를 다시 하세요.
- 청중 화면(`/live/{tableId}`)은 로그인이 필요 없으므로 시크릿 창이나 다른 브라우저로 열면 사회자와 청중을 동시에 테스트할 수 있습니다.
- 사회자 공유는 타이머 페이지(`/table/customize/{tableId}`)에서 공유 모달을 열 때 소켓이 연결됩니다.
