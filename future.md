# Node 환경 통일 이후 핵심 의존성 업데이트 계획

## 현재 진행 상태와 다음 작업

| 단계 | 상태 | 근거 |
| --- | --- | --- |
| Node — PR 1 | 완료·병합됨 | [PR #524](https://github.com/debate-timer/debate-timer-fe/pull/524), `4cc685b` |
| Storybook — PR 2 | 완료·병합됨 | [PR #526](https://github.com/debate-timer/debate-timer-fe/pull/526), `3aefc0e` |
| Vite — PR 3 | 구현·로컬 검증 완료 | [이슈 #527](https://github.com/debate-timer/debate-timer-fe/issues/527), Vite 6.4.4 → 7.3.7 → 8.3.4 순서로 검증했음 |
| React — PR 4 | Vite 이후 진행 | 완료된 Vite 단계의 `develop`을 기준으로 호환 범위를 확정함 |

Vite 작업은 Storybook 병합 커밋 `3aefc0ea893641aadecc809fda55e14f1df1b29a`의
원격·로컬 `develop`을 동기화한 뒤 `config/#527-vite-8-migration`에서 진행했음.
다음 구현은 Vite 작업 병합 후 최신 `develop`에서 시작하는 React 이전임.
React의 구체적인 목표 패치는 해당 단계 착수 시 공식 지원·peer 조건으로 확정함.

## 완료한 Node 환경 통일

Node 환경 설정을 구현하고 Windows에서 Node `24.21.0`·npm `11.19.1`로 검증했음.
CI·배포는 [`.node-version`](.node-version)의 `24.21.0`을 참조함. 로컬은
[`package.json`](package.json)의 `>=24.12.0 <25` 범위를 허용하고, Node 타입은
`^24.19.2`로 선언해 [`package-lock.json`](package-lock.json)으로 관리함.
npm 버전은 강제하지 않으며 위 버전은 이번 검증에 사용한 실행 버전임.
환경 계약과 최소 버전의 근거는 [문서 지도](docs/README.md#실행-환경-설정)를 참조함.

Node 타입은 `24.19.2`로 설치했음. 다른 직접 의존성, 기존 버전 제한과 override는
유지했음. CI·개발·미리보기·생산·Storybook workflow는 checkout 이후 공용 파일로
Node를 설정하고 기존 `npm ci`를 실행하도록 맞췄음. 공개 README와 제품 동작은
변경하지 않았음. Node PR #524가 병합된 `4cc685b`를 Storybook 단계의 기준으로
사용함. 아래 결과는 Node 단계에서 기록한 결과이며 이번 단계의 재검증과 구분함.

### 실제 검증 결과

| 검증                                        | 결과                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm ci --engine-strict --strict-peer-deps` | 최종 lockfile로 통과했음                                                             |
| `npm ls --depth=0`                          | 누락·peer 충돌 없이 통과했음                                                         |
| `npx vitest run`                            | 59개 파일·546개 항목이 통과했음                                                      |
| `npm run lint`                              | ESLint·Stylelint·타입 검사가 통과했음                                                |
| `npm run build`                             | 앱 생산 빌드가 통과했음                                                              |
| `npm run build-storybook`                   | Storybook 빌드가 통과했음                                                            |
| 앱 개발 서버                                | 진입 HTML·`src/main.tsx`·CSS·MSW worker가 HTTP 200을 반환했음                        |
| Storybook 개발 서버                         | 관리 화면·미리보기·색인·MSW worker가 HTTP 200을 반환했음. 색인 170개 항목을 확인했음 |
| Storybook 빌드 이후 앱 재확인               | 앱 서버를 재시작하고 HTML·진입 모듈·CSS의 HTTP 200을 확인했음                        |
| 설정·문서                                   | workflow 순서·옵션, 버전 일치, 상대 링크와 Git diff를 확인했음                       |

설치 시 변경하지 않은 `glob`·`uuid`·ESLint의 비권장 버전 경고와 npm 감사 결과
10건(낮음 1·보통 3·높음 6)을 관측했음. npm은 Sentry CLI·esbuild·MSW의 설치
스크립트 허용 설정이 없다는 경고도 출력했음. 설정을 추가하거나 자동 수정하지
않았으며 실제 테스트·빌드는 통과했음.

기존 Storybook 설정의 MDX 파일 부재, Storybook 내부 `eval`, 앱·Storybook의
500 kB 초과 묶음 경고를 관측했음. Node 24에서 관측한 `DEP0190`은
`--trace-deprecation`으로 Storybook 8.6.18의 `hasNPM` → `spawnSync` 호출에서
`shell: true`와 인자를 함께 전달하는 코드까지 추적했음. Node 타입 변경으로
이 코드를 수정하지 않았으며 Storybook 단계에서 다시 확인함. 이전 Node 런타임과
경고를 직접 비교하는 검증은 수행하지 않았음.

브라우저에서 타이머·청중 공유·투표·모달·입력·포커스·반응형 화면을 직접 조작하는
수동 검증은 미실행임. HTTP 확인은 화면 동작 검증을 대체하지 않음. Linux 설치,
원격 CI·Chromatic·배포, 실제 API·소켓 서버 연결과 인증을 사용하는 Sentry
sourcemap 업로드도 미실행임.

## 핵심 의존성 단계별 진행 기준

Node → Storybook → Vite → React 순서로 총 4개 PR을 진행함. 각 PR을 검증·병합한
뒤 다음 작업은 병합된 `develop`에서 새 이슈·브랜치로 시작함. 커밋·push·PR 생성·
병합·배포는 각각 요청된 권한 범위에서 수행함. Node·Storybook은 병합됐으며,
Vite는 로컬 구현·검증을 완료했음. Vite 병합 후 React 이전을 진행함.
아래에는 단계별 근거와 후속 계획을 함께 보존함.

각 단계 착수 시 공식 지원 상태, `engines`와 peer 의존성을 확인해 목표 버전을
확정함. 아래 경계 안에서 필수 호환성 변경만 포함하고 새 기능 도입은 분리함.
라이브러리 지원 때문에 목표 조정이 필요하면 수정 계획을 먼저 정리함.

### 1. Storybook — PR 2 완료

[이슈 #525](https://github.com/debate-timer/debate-timer-fe/issues/525)의 작업을
[PR #526](https://github.com/debate-timer/debate-timer-fe/pull/526)으로 완료했으며,
사용자가 2026-10-14에 `develop`으로 병합했음. 병합 커밋은 `3aefc0e`임.
React 18·Vite 6을 유지한 이전이며 Vite·React 구현은 포함하지 않았음.

#### Storybook 구현 결과

Storybook·React Vite framework·Docs·Onboarding을 `^10.6.2`, Chromatic addon을
`^5.5.1`, CLI를 `^18.12.1`로 이전했음. lockfile에는 각각 `10.6.2`, `5.5.1`,
`18.12.1`이 설치됐음. React 18·Vite 6·TypeScript 5.7과 관련 없는 직접 의존성의
선언·잠금 버전, MSW 2.12.7·MSW addon 2.0.7, 기존 제한·override를 유지했음.

Essentials·Interactions·Blocks·Test와 renderer 직접 의존성을 제거했음.
50개 Story 파일과 Preview의 타입은 framework에서 가져오고, 검증 도구는
`storybook/test`, `useArgs`는 `storybook/preview-api`로 이전했음.
viewport 목록을 `options`, Story의 화면 선택을 `globals.viewport`로 이전하고
언어·화면 크기 조합을 보존했음. 중복 builder·빈 MDX glob을 제거했으며 정적 자산,
Tailwind·MSW·Provider 조립은 유지했음. `.storybook`을 타입 검사에 포함하면서
발견한 사용하지 않는 React import도 제거했음.

npm 11.19.1은 기존 v8 잠금 항목과 새 패키지를 함께 계산할 때 충돌했고, 이를
분리한 뒤에도 React DOM shim의 선택적 peer에 React 19 타입을 선택했음.
계산 중에만 기존 직접 버전을 고정하고 shim을 명시해 그래프를 계산한 뒤 원래
선언 범위를 복원했음. 최종 manifest에는 shim 직접 의존성이나 새 override를
추가하지 않았으며 `--force`·`--legacy-peer-deps` 없이 엄격한 재설치가 통과했음.

#### Storybook 단계의 실제 검증 결과

Windows에서 Node `24.21.0`·npm `11.19.1`·Chrome headless로 검증했음.
설정·의존성 이전이므로 제품 기능이나 새 테스트는 추가하지 않고 기존 테스트와
Story의 `play`를 실행했음. 브라우저 보조 도구는 임시 폴더에만 설치했음.

| 검증 | 결과 |
| --- | --- |
| `npm ci --engine-strict --strict-peer-deps` | 최종 선언·lockfile로 통과했음 |
| `npm ls --depth=0` | 누락·peer 충돌 없이 통과했음 |
| `npx --no-install storybook doctor` | `Your Storybook project looks good!`로 통과했음 |
| `npx --no-install vitest run` | 기존과 동일한 59개 파일·546개 항목이 통과했음 |
| `npm run lint` | ESLint·Stylelint·Preview를 포함한 타입 검사가 통과했음 |
| `npm run build` | 앱 생산 빌드가 통과했음 |
| `npm run build-storybook -- --disable-telemetry` | 정적 빌드가 통과했음 |
| 색인 비교 | v8 산출물과 동일한 123개 Story·47개 문서이며 ID 추가·누락이 없었음 |
| UpdateModal | 개발·정적 빌드 각각 12개 Story의 `play`가 통과했음 |
| Docs·Controls·Actions·Interactions | 양쪽에서 Docs 렌더링, 양방향 args 반영, `onChecked`·`onClose` 기록, `play` 성공 표시를 확인했음 |
| 청중 모바일 | 양쪽의 AudienceFinishedPage·AudienceShareSimulator가 375×812였음 |
| MSW·Router·Query·Portal | 양쪽에서 서비스워커의 실제 JSON 응답과 테이블 8개 표시, 투표 조회·입력·선택·확인 모달·제출 성공을 확인했음 |
| 타이머·청중 시뮬레이터 | 양쪽에서 MSW 테이블 조회 후 가짜 소켓의 SYNC·PLAY·카운트다운·STOP·자유토론 전환·FINISHED의 종료 화면 이동을 확인했음 |
| 앱 개발 서버 재시작 | Storybook 빌드 후 재시작했으며 HTML·진입 모듈·CSS·worker가 HTTP 200이었음. 의존성 탐색 오류가 없었음 |
| Chromatic dry-run | 인증·Git/framework 감지·빌드·파일 검증·업로드 준비가 통과했음. 게시·서버 검증·시각 비교는 생략됐음 |
| Linux PR CI | [frontend-CI](https://github.com/debate-timer/debate-timer-fe/actions/runs/38541254452)에서 `npm ci`·전체 테스트·lint가 통과했음 |
| 원격 미리보기·개발 배포 | [Deploy-Preview](https://github.com/debate-timer/debate-timer-fe/actions/runs/38541254242)·[Deploy-Development](https://github.com/debate-timer/debate-timer-fe/actions/runs/38541812762)가 성공했음 |

UpdateModal은 반응형 기본값, 390×844·320×568·667×375·767×900·768×900·
1440×900의 기존 한국어·영어 조합을 확인했음. `play`의 이미지 비율·겹침·긴 설명
스크롤 검증과 함께, Portal 표시·체크박스 조작·Controls에서 args 변경·닫기를
직접 자동 조작했음. 관리 화면을 1920×1600으로 확보해 실제 iframe 크기를 확인했음.
관리 화면이 작으면 Storybook 10이 iframe 높이를 제한하는 동작도 확인했음.

MSW는 `/api/table`, `/api/polls/123/votes`의 GET·POST,
`/api/live/table/customize/5`의 응답 내용·HTTP 200·서비스워커 처리 여부를 확인했음.
투표 제출 후 최종 완료 페이지까지 연결하는 검증과 TimerPage의 전체 실행 흐름은
미실행임. 이 단계의 타이머 동작 검증은 청중 시뮬레이터 범위임.

`NODE_OPTIONS=--trace-deprecation`으로 v8의 `hasNPM → spawnSync`에서 `DEP0190`을
재현했음. v10 개발·생산 빌드에서는 해당 경고가 관측되지 않았음. 기존 MDX 부재·
Storybook 내부 `eval` 경고도 새 빌드에서 관측되지 않았으며 500 kB 초과 묶음
경고는 앱·Storybook에 남아 있음. 설치 시 ESLint 비권장 버전·설치 스크립트 허용
설정 경고와 npm 감사 7건(낮음 1·높음 6)을 관측했으며 자동 수정하지 않았음.

제한된 실행 환경에서 doctor의 내부 CLI 다운로드와 Storybook의 사용자 설정·
실행 등록 파일 쓰기가 차단됐음. 네트워크·사용자 경로 접근이 가능한 실행으로
재확인했으며 doctor는 통과했음. Git 소유권 예외는 해당 프로세스에만 적용했음.
Windows 명령 실행 오류나 실제 peer 충돌은 최종 진단에 남지 않았음.

재검증 명령과 화면 확인 기준은
[테스트·Storybook 컨벤션](docs/conventions/testing-and-storybook.md#버전-이전-시-수동-검증)에
기록했음. Chromatic 명령은
`npm run chromatic -- --dry-run --no-interactive --disable-telemetry`임.
Linux의 일반 설치·테스트·lint는 위 CI에서 확인했음. 엄격한 설치 옵션과 doctor·
Storybook 빌드·브라우저 검증은 Windows 로컬에서 수행한 결과임.
사용자는 `npm run storybook`으로 로컬 실행 후 일부 Story가 정상 동작함을
추가 확인했음. 이 확인을 전체 화면·전체 사용 흐름 검증으로 확대하지 않음.

### 2. Vite — PR 3 구현·로컬 검증 완료

2026-10-15에 [이슈 #527](https://github.com/debate-timer/debate-timer-fe/issues/527)을
`config` 레이블로 생성했음. 원격을 fetch하고 `develop`을 fast-forward 방식으로
확인한 뒤 새 브랜치를 만들었음. 기존 `future.md`는 패치·파일 사본·전용 stash로
보관한 뒤 복원했으며 원문과 SHA-256이 일치했음.

Vite 6.4.4의 기준 결과를 확보하고 7.3.7의 검증을 완료한 뒤 8.3.4로 이전했음.
최종 선언은 `^8.3.4`이며 lockfile에는 8.3.4와 Rolldown 1.2.14가 설치됐음.
다른 직접 의존성의 선언·잠금 버전과 기존 제한·override를 유지했음.
React 18.3.1·Storybook 10.6.2·Vitest 4.1.11과 기존 React·Tailwind·Sentry
플러그인을 그대로 사용하며 새 플러그인·호환성 우회 설정을 추가하지 않았음.
공용 `build.target`은 [지원 브라우저 계약](docs/conventions/react-and-ui.md#스타일과-접근성)에
맞춰 명시했으며 Storybook builder가 같은 값을 전달받는 것을 확인했음.

#### Vite 단계의 실제 검증 결과

Windows·Node 24.21.0·npm 11.19.1·Chrome headless에서 확인했음.
설정·의존성 이전이므로 새 제품 기능이나 테스트를 추가하지 않고 기존 테스트와
Story의 `play`를 실행했음. 브라우저 검증 도구와 단계별 로그는 임시 폴더에 뒀음.

| 검증 | 결과 |
| --- | --- |
| 엄격한 재설치·의존성 트리 | Vite 6·7·8 각각 `npm ci --engine-strict --strict-peer-deps`·`npm ls --depth=0`가 통과했음 |
| 전체 테스트·lint·타입 | 세 버전 모두 59개 파일·546개 항목과 `npm run lint`가 통과했음 |
| 앱·Storybook 빌드·doctor | 세 버전 모두 통과했음. Storybook 빌드는 `--disable-telemetry`로 실행했음 |
| Story 색인 | 세 버전 모두 123개 Story·47개 문서이며 ID 추가·누락이 없었음 |
| Storybook 개발·정적 화면 | 세 버전 양쪽에서 UpdateModal 12개 `play`, 양방향 args, Actions, Docs, Portal 닫기와 모바일 크기가 통과했음 |
| MSW·청중 시뮬레이터 | 세 버전 양쪽에서 테이블 8개, 투표 GET·POST·확인 모달, 가짜 소켓 SYNC·PLAY·카운트다운·STOP·자유토론·FINISHED 이동이 통과했음 |
| 앱 개발 화면 | 세 버전에서 테이블 선택, 타이머 재생·정지·Space, 여섯 차례 이동 후 종료 화면, 도움말 Esc 닫기, 투표 제출 후 완료 화면과 영어 경로를 확인했음 |
| 생산·하위 경로 화면 | Vite 7·8에서 기본 경로와 `/pr-527` 생산 빌드로 같은 앱 흐름·번역·스타일을 확인했음. API 응답은 별도 MSW 세션으로 모방했음 |
| 개발 서버·HMR | 세 버전에서 진입 HTML·모듈·CSS·worker HTTP 200과 임시 모듈의 실제 HMR 갱신이 통과했음. Vite 7·8은 Storybook 빌드 후 재시작·재검증했음 |
| proxy·SockJS·Sentry 설정 | Vite 7·8의 실제 로드된 설정과 로컬 HTTP·WebSocket 경로 재작성·upgrade가 통과했음. `global: 'window'`를 유지했음 |

Sentry는 인증 없는 생산 설정에서 sourcemap이 꺼지고, 가짜 인증값을 넣어 설정만
로드하면 hidden sourcemap·Sentry 플러그인이 켜지며 개발 모드에서는 꺼지는 것을
확인했음. 가짜 인증값으로 빌드·업로드하지 않았음. 인증 없는 최종 생산 산출물에
`.map` 파일이 없었음. 실제 sourcemap 생성·업로드·업로드 후 삭제는 미검증임.

Vite 7의 개발 Storybook 검증 중 정적 빌드가 HTML을 갱신해 화면이 새로고침되면서
args 확인이 한 차례 시간 초과됐음. 빌드 완료 후 같은 검증이 전부 통과했음.
성공 안내가 두 번 표시되는 기존 상태는 임시 검증 도구의 선택자로 처리했음.
제품 코드를 이 사유로 수정하지 않았음.

세 버전 모두 npm 감사 7건(낮음 1·높음 6), ESLint 비권장 버전·설치 스크립트 허용
안내와 큰 묶음 경고를 관측했음. Vite 8 Storybook 빌드에는 Rolldown의
`PLUGIN_TIMINGS` 안내가 추가됐으며 빌드는 통과했음. 관련 없는 정비는 하지 않았음.

구현 검증 시점에는 커밋·push·PR 생성·병합·배포를 수행하지 않았음.
Vite 7 검증 상태의 manifest·
lockfile·설정과 재적용 패치는 `%TEMP%/dt-vite-migration-20261015/`에 보관했음.
후속 PR 준비에서 승인 후 7·8 검증 상태를 별도 커밋으로 구성함. 원격 CI·Chromatic dry-run과
실제 게시·시각 비교, Linux, 지원 브라우저별 실행, 실제 API·소켓 서버와 Sentry
업로드는 이번 단계에서 미실행임. 이전 Storybook 단계의 원격 성공 기록을 이번
Vite 변경의 검증 결과로 해석하지 않음.

### 3. React — PR 4 후속 작업

- Vite PR 검증·병합 후 최신 `develop`에서 새 이슈·브랜치로 시작함.
- React·React DOM·양쪽 타입을 함께 갱신함. UI·라우팅·상태·애니메이션 라이브러리와
  Storybook·테스트 도구가 목표 React를 지원하는지 확인함.
- JSX 변환, ref 전달·정리, 폐기 API, Strict Mode의 effect·구독·timer 정리를
  확인함. 새 React 기능 도입은 버전 이전과 별도 작업으로 둠.
- 공통 검증과 주요 화면 수동 검증을 완료함. 모달·입력·포커스·반응형 화면,
  타이머·청중 공유·투표의 동작을 확인하고 실제 서버 검증 범위를 기록함.

## 공통 완료 기준

후속 React 단계와 재검증에서도 다음 명령을 실행함. Vite 단계에서는 기준 6과
이전한 7·8에서 각각 실행했음.

```text
npm ci --engine-strict --strict-peer-deps
npm ls --depth=0
npx vitest run
npm run lint
npm run build
npm run build-storybook
```

59개 테스트 파일·546개 항목을 비교 기준으로 사용하되 개수를 고정하지 않음.
증감·실패의 원인, 실제 Node·npm 버전, 기존 경고와 새 경고를 기록함.
앱·Storybook 개발 서버와 Storybook 빌드 후 앱 서버를 확인함. 변경 영향에 따라
주요 화면을 수동 검증하고 문서 링크·한국어 문장·버전 설정·Git diff를 확인함.
원격 CI·실제 서버 연결·Sentry 업로드 등 미실행 항목을 완료 보고에 명시함.
CI에서 수행하지 않는 검증은 위 명령과 해당 단계의 확인 동작을 PR에 남김.

## 남은 검증과 운영 확인

- Chromatic 실제 게시·서버 검증·시각 비교는 dry-run으로 검증하지 못한 범위임.
  이번 병합에 대응하는 `Deploy-storybook` 실행은 조회되지 않았으므로 게시 완료로
  기록하지 않음. 필요 시 workflow 실행 여부와 실제 게시 결과를 확인함.
- TimerPage의 테이블 선택·시작·정지·다음 순서·종료와 투표 제출 후 완료 화면,
  Space·도움말 Esc 닫기는 위 Vite 단계에서 로컬 모방 응답으로 확인했음.
  실제 서버 연결과 전체 키보드 포커스 이동·포커스 복원 검증은 후속 대상으로 남김.
- 실제 API·소켓 서버를 연결한 타이머·청중 공유·투표 검증과 인증을 사용하는
  Sentry sourcemap 업로드는 후속 단계에서 실행 범위를 기록함. 원격 개발 배포
  성공만으로 실제 화면·서버 연결·Sentry 업로드 성공을 단정하지 않음.
- Linux에서 엄격한 설치 옵션·doctor·Storybook 빌드까지 확인하려면 해당 명령을
  별도로 실행함. 현재 PR CI의 일반 `npm ci`·테스트·lint 성공과 구분함.
- 앱·Storybook 묶음 크기 경고, npm 감사 7건과 비권장 버전·설치 스크립트 허용
  안내는 Storybook 단계의 잔여 기록임. 후속 단계에서 재확인하고 관련 없는 정비는
  별도 작업으로 분리함.

## 별도 후속 작업과 제한 유지

TypeScript, 검사 도구, MSW, 기타 런타임 의존성과 미사용 패키지 정리는 별도
후속 작업으로 둠. 남은 각 단계의 호환성에 필수적인 변경만 해당 PR에 포함함.
현재 제한은 `typescript-eslint <8.56`, Query ESLint 5.91.4와 내부 utils 8.55.0
으로 지정한 override, MSW 2.12.7, React Query 5.100.10 이하임.

Node 갱신만으로 제한 원인이 해결됐다고 가정하지 않음. React Query 제한은
`usePreventDuplicateMutation`의 새 Mutation 인자 타입을 테스트로 검증하고
수정한 뒤 해제함. 다른 제한과 override도 원인을 검증한 뒤 별도 변경함.
`--force`·`--legacy-peer-deps`로 충돌을 덮지 않으며 lockfile을 함께 관리함.

## 착수 시 확인할 공식 안내

- [Node 지원 일정](https://nodejs.org/en/about/previous-releases)
- [Storybook 이전 안내](https://storybook.js.org/docs/releases/migration-guide)
- [Vite 6 → 7 이전](https://v7.vite.dev/guide/migration)
- [Vite 7 → 8 이전](https://vite.dev/guide/migration)
- [React 19 이전](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
