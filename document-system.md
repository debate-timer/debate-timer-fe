# Debate Timer FE 현행 문서 체계 분석

이 문서는 2026-09-29 기준으로 이 저장소의 문서와 문서 생성 체계를 조사해, **현재 무엇이 어디에 있고 어떤 관계로 동작하는지** 정리한 현황 문서다. 목표 문서 체계를 제안하거나 새 규칙을 부과하는 문서가 아니다. 앞서 작성한 `criteria.md`는 Hilit-Android의 체계를 분석한 외부 비교 기준이며, 이 문서에서는 현행 체계의 구성요소로만 다룬다.

## 1. 조사 범위

요청된 다음 경로의 파일을 모두 조사했다.

- `.agent/`: 에이전트 공통 Speckit 워크플로와 Gemini/Codex 전용 절차
- `.agents/`: 설치된 에이전트 스킬과 세부 참고 문서
- `.claude/`: Claude 명령, 스킬 연결 파일, 로컬 권한 설정
- `.codex/`: Codex용 Speckit 프롬프트
- `.specify/`: Constitution, 산출물 템플릿, 생성·탐색 스크립트
- `docs/`: 저장소에 지속 보관되는 주제 문서

문서의 진입점·생성·배포·외부 동기화를 파악하기 위해 다음 파일도 추가로 조사했다.

- `README.md`, `AGENTS.md`, `criteria.md`
- `.gitignore`, `package.json`, `skills-lock.json`
- `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*.md`, `.github/workflows/*`
- `notion_sync.py`

설정·스크립트·코드 파일은 문서 내용을 담는 파일은 아니지만, 문서의 생성 위치와 수명 주기 또는 외부 협업 흐름을 결정하는 경우 조사 범위에 포함했다.

## 2. 전체 구조

```text
debate-timer-fe/
├── README.md                         사람을 위한 프로젝트 소개와 실행 안내
├── AGENTS.md                         에이전트용 프로젝트 규칙과 작업 진입점
├── criteria.md                       Hilit-Android 문서 체계 비교 기준
├── docs/                             지속 보관되는 주제별 설명·운영 문서
│   ├── analytics-dashboard.md
│   ├── live-share-timer-sync.md
│   └── local-backend-login.md
├── .specify/                         Speckit의 정책·템플릿·자동화 핵심
│   ├── memory/constitution.md
│   ├── templates/*.md
│   └── scripts/bash/*.sh
├── .claude/                          Claude용 명령과 스킬 연결
│   ├── commands/speckits/*.md
│   ├── commands/pr-develop.md
│   ├── skills/*
│   └── settings.local.json
├── .codex/prompts/*.md               Claude 명령을 가리키는 Codex용 요약 프롬프트
├── .agent/                           별도 에이전트 워크플로 모음
│   ├── workflows/*.md                Speckit 및 PR 절차의 독립 요약본
│   ├── gemini/*.md                   명세·계획·작업 인계·평가 절차
│   └── codex/*.md                    구현·구현 평가 절차
├── .agents/skills/                   재사용 가능한 외부·로컬 전문 지식
├── skills-lock.json                  설치된 스킬의 출처와 해시
├── .github/                          이슈·PR 템플릿과 자동화 워크플로
└── specs/                            기능별 임시 설계 산출물 대상 경로
                                       (현재 없음, .gitignore로 제외)
```

조사 시점의 규모는 다음과 같다. 파일 수는 Markdown 이외의 설정·스크립트·스킬 예제 자산도 포함한다.

| 경로        | 전체 파일 | Markdown | 주된 성격                                 |
| ----------- | --------: | -------: | ----------------------------------------- |
| `.agent/`   |        21 |       21 | 워크플로 및 전용 에이전트 실행 지침       |
| `.agents/`  |       131 |      128 | 프론트엔드·React·Remotion 스킬 지식베이스 |
| `.claude/`  |        15 |       10 | 정식 명령, 스킬 연결, 로컬 설정           |
| `.codex/`   |         7 |        7 | Speckit 명령 요약 어댑터                  |
| `.specify/` |        11 |        6 | 정책, 템플릿, Bash 자동화                 |
| `docs/`     |         3 |        3 | 프로젝트 고유의 장기 보관 문서            |
| `.github/`  |        18 |        9 | 협업 양식과 CI·배포·동기화 자동화         |

현재 체계는 단일 문서 포털이 아니라 다음 네 종류가 함께 놓인 구조다.

1. 프로젝트를 설명하고 규율하는 문서: `README.md`, `AGENTS.md`, Constitution, `docs/`
2. 기능 개발 중 문서를 생성하는 체계: `.specify/`, Speckit 명령, 무시된 `specs/`
3. 에이전트별 실행 인터페이스: `.claude/`, `.codex/`, `.agent/`
4. 작업 때 선택적으로 불러오는 범용 지식: `.agents/skills/`

## 3. 문서 계층별 역할

### 3.1 저장소 루트의 진입 문서

| 문서          | 주 독자               | 현재 역할                                                                                                                                                                                                       |
| ------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`   | 사람                  | 서비스 소개, 기술 스택, 실행·빌드 방법, 배포 URL, 브랜치 개요, 기여자와 외부 링크를 제공한다.                                                                                                                   |
| `AGENTS.md`   | 에이전트와 개발자     | 기술 스택, 코드 구조·규칙, TDD, 주요 명령, Speckit 순서, Git 규칙을 한 파일에 요약한다. Speckit의 상세 명령 위치를 `.claude/commands/speckits/`, 상위 개발 원칙을 `.specify/memory/constitution.md`로 지정한다. |
| `criteria.md` | 문서 체계 개편 담당자 | Hilit-Android 문서 체계에서 추출한 비교 기준이다. 현재 프로젝트의 규범이나 구현 사실을 선언하지 않는다.                                                                                                         |

`README.md`와 `AGENTS.md`는 각각 사람과 에이전트의 첫 진입점이지만 서로를 연결하지 않는다. `docs/`의 문서 목록이나 작업별 읽기 경로를 제공하는 저장소 전체 문서 인덱스도 현재 없다.

### 3.2 프로젝트 정책: Constitution

`.specify/memory/constitution.md`는 다음 내용을 하나의 프로젝트 헌장으로 관리한다.

- 계층화된 디렉터리 구조와 의존 방향
- TypeScript·React 코드 스타일과 이름 규칙
- Red-Green-Refactor를 포함한 의무 TDD
- 모든 사용자 노출 문자열에 대한 i18n 우선 원칙
- 기술 스택과 품질 게이트
- 기능 개발 및 Git 절차
- 헌장 변경의 합의와 버전 관리

현재 버전은 `2.0.0`이며, 문서가 모든 코드와 리뷰의 기준이라고 선언한다. 동시에 기능 개발 중 생성되는 `specs/`의 문서는 기능 완료 시점까지만 유지하는 임시 문서로 정의하고 원격 저장소에 올리지 않도록 한다. 실제 `.gitignore`도 `/specs`를 제외하며, 조사 시점에 `specs/` 디렉터리는 없다.

### 3.3 장기 보관 주제 문서: `docs/`

`docs/`는 하위 분류나 인덱스 없이 세 문서가 평면으로 배치되어 있다.

| 문서                       | 문서 유형          | 다루는 내용                                                                                                            |
| -------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `analytics-dashboard.md`   | 분석 운영 가이드   | Amplitude 대시보드의 이벤트·공통 속성, 핵심 차트와 퍼널의 계산·해석·주의점을 설명한다.                                 |
| `live-share-timer-sync.md` | 동작·아키텍처 계약 | 진행자·서버·관전자 사이의 STOMP 타이머 메시지, 버전 정렬, 지연 보정, 0초 권위, 재연결·백그라운드 복구 정책을 정의한다. |
| `local-backend-login.md`   | 로컬 개발 절차     | 로컬 백엔드와 프론트엔드 실행, H2 데이터, CORS, 개발 JWT 발급, 토큰 저장과 환경 설정 절차를 설명한다.                  |

세 문서는 각각 구체적이고 사람이 읽을 수 있는 설명을 갖지만 공통 머리말 형식, 상태 표시, 소유자, 최종 검증일, 관련 코드·상위 문서 링크 규칙은 없다. 분석 가이드, 기술 계약, 운영 절차라는 서로 다른 유형도 디렉터리나 메타데이터로 구분되지 않는다.

## 4. Speckit 문서 생성 체계

### 4.1 구성요소

`.specify/`는 문서가 아니라 **문서를 만드는 체계의 핵심**이다.

| 구성                               | 역할                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `memory/constitution.md`           | 계획과 구현이 따라야 할 프로젝트 원칙                                         |
| `templates/spec-template.md`       | 사용자 스토리, Given/When/Then, 요구사항, 엔터티, 측정 가능한 성공 기준       |
| `templates/plan-template.md`       | 기술 맥락, Constitution 점검, 설계 산출물과 소스 구조, 복잡성 예외            |
| `templates/tasks-template.md`      | 단계·사용자 스토리별 `T### [P] [US#]` 작업 목록                               |
| `templates/checklist-template.md`  | 요구사항 품질을 검사하는 `CHK###` 체크리스트                                  |
| `templates/agent-file-template.md` | 계획에서 추출한 기술·구조·명령을 에이전트 문서에 반영하는 형식                |
| `scripts/bash/*.sh`                | 브랜치와 기능 경로 탐색, 사전 조건 검사, 명세·계획 초기화, 에이전트 문서 갱신 |

스크립트가 기대하는 표준 기능 문서 경로는 다음과 같다.

```text
specs/{type}/{NNN}-{slug}/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
├── tasks.md
└── checklists/
    ├── requirements.md
    └── {domain}.md
```

브랜치 `feat/#96-social-login`은 `specs/feat/096-*`처럼 유형과 이슈 번호로 기능 디렉터리에 연결된다. `create-new-feature.sh`가 디렉터리와 초기 명세를 만들고, `setup-plan.sh`가 계획 템플릿을 복사하며, `check-prerequisites.sh`가 단계별 필수·선택 산출물을 확인한다.

`update-agent-context.sh`는 `plan.md`의 기술 정보를 읽어 `CLAUDE.md`, `GEMINI.md`, `AGENTS.md` 등 여러 에이전트 컨텍스트를 만들거나 갱신할 수 있다. 현재 저장소에는 이 스크립트가 대상으로 삼는 문서 중 `AGENTS.md`만 존재하며, 현재 Speckit 명령에서 이 스크립트를 직접 호출하는 연결은 확인되지 않는다.

### 4.2 선언된 작업 순서와 실제 산출물 흐름

`AGENTS.md`는 다음 순서를 안내한다.

```text
specify → clarify → plan → tasks → analyze → implement → checklist
```

상세 명령이 실제로 형성하는 흐름은 조금 다르다.

```text
GitHub issue 및 type/#issue-slug 브랜치
    ↓
specify: spec.md + checklists/requirements.md
    ↓
clarify: 질문 결과를 spec.md에 반영
    ↓
plan: plan.md + research/data-model/contracts/quickstart 등
    ├── tasks로 인계
    └── 추가 checklist로 인계 가능
    ↓
tasks: tasks.md
    ├── analyze: spec·plan·tasks·constitution 정합성 보고(파일 수정 없음)
    └── implement: 체크리스트 확인 후 작업 실행·완료 표시
```

즉 `checklist`는 마지막 단계만이 아니다. `specify`가 이미 요구사항 체크리스트를 생성하고, `plan`도 추가 체크리스트로 인계할 수 있으며, `implement`는 존재하는 체크리스트의 미완료 여부를 진입 조건으로 검사한다.

### 4.3 명령이 노출되는 위치

| 기능                          | `.claude/commands` | `.codex/prompts`           | `.agent/workflows` |
| ----------------------------- | ------------------ | -------------------------- | ------------------ |
| specify, clarify, plan, tasks | 상세 원본          | 짧은 실행 요약과 원본 경로 | 별도 요약본        |
| analyze, implement, checklist | 상세 원본          | 짧은 실행 요약과 원본 경로 | 별도 요약본        |
| constitution, taskstoissues   | 상세 원본          | 없음                       | 별도 요약본        |
| PR 생성                       | `pr-develop.md`    | 없음                       | `pr-develop.md`    |

`AGENTS.md`가 상세 명령 위치로 `.claude/commands/speckits/`를 지정하고, `.codex/prompts/*`도 각각 그 파일을 “Full workflow details”로 연결한다. 따라서 이 두 경로 사이에서는 `.claude` 문서가 상세 원본이고 `.codex`가 어댑터라는 관계가 드러난다. 반면 `.agent/workflows/*`는 원본을 링크하지 않고 같은 절차를 다시 기술한 독립 사본이다.

## 5. 별도의 Gemini 계획 → Codex 구현 체계

`.agent/gemini/`와 `.agent/codex/`에는 위 Speckit 명령군과 다른 두 에이전트 연계 절차가 있다.

```text
Gemini
  specify → clarify → plan → tasks → analyze → Gemini evaluate
                                      │          (구현 준비도 감사)
                                      └─ tasks/ 아래 구현 인계 문서 생성
                                                    ↓ 통과 후 인계
Codex
  implement → Codex evaluate
```

Gemini 측은 먼저 사람이 `feature-request-template.md`를 채우게 하고, 모호함을 추측하지 않고 질문으로 해소한 뒤 명세·계획·작업을 만든다. 이 체계가 기대하는 경로는 표준 Speckit과 달리 `specs/spec.md`, `specs/plan.md`, `specs/data-model.md`, `specs/tasks.md`, `specs/tasks/00-project-overview.md`처럼 `specs/` 바로 아래에 놓인다. 여기서 `analyze`는 읽기 전용 정합성 검사가 아니라 개별 구현 인계 문서를 만드는 단계다.

Codex 측은 이 인계 문서를 받아 단일 작업·작업 묶음·전체 작업 범위로 구현하고, 별도 세션에서 계획 정렬·규칙 준수·범위·TDD·검증·인계 품질을 평가한다. 이 문서들은 모든 셸 명령과 파일 변경마다 승인을 요구하는 자체 승인 모델도 포함한다.

따라서 현재 저장소에는 이름이 같은 `specify`, `analyze`, `evaluate` 등이 반드시 같은 의미를 갖지 않는 두 흐름이 병존한다. 특히 표준 Speckit과 Gemini/Codex 체계는 `specs/` 내부 레이아웃도 서로 호환되지 않는다.

## 6. 에이전트 스킬 지식베이스

`.agents/skills/`는 이 프로젝트의 결정 기록이 아니라, 특정 종류의 작업에 적용하는 범용 전문 지식 묶음이다.

| 스킬                          |                      구성 | 범위                                         |
| ----------------------------- | ------------------------: | -------------------------------------------- |
| `frontend-fundamentals`       |              Markdown 5개 | 코드 품질, 번들링, 접근성, 디버깅            |
| `vercel-react-best-practices` |             Markdown 72개 | React 성능 규칙, 개별 규칙 문서와 통합본     |
| `vercel-composition-patterns` |             Markdown 13개 | 컴포넌트 합성, 상태·API 설계, React 19 패턴  |
| `remotion-best-practices`     | Markdown 38개와 코드 자산 | Remotion 영상·오디오·자막·미디어·렌더링 패턴 |

각 스킬의 `SKILL.md`가 어떤 요청에서 어떤 참고 문서를 읽을지 라우팅한다. Vercel 스킬은 개별 `rules/*.md`와 이를 모은 `AGENTS.md`를 함께 포함한다. `.claude/skills/*`는 실제 내용을 복제하지 않고 `../../.agents/skills/{name}`을 가리키는 한 줄 연결 파일이며, `skills-lock.json`은 GitHub 또는 로컬 출처와 계산된 해시를 기록한다.

이 스킬들은 양이 많지만 저장소 고유 아키텍처나 제품 정책의 원본은 아니다. 현재 `AGENTS.md`에는 스킬과 프로젝트 고유 규칙이 충돌할 때의 명시적 우선순위나 스킬별 적용 조건이 기재되어 있지 않다.

`.claude/settings.local.json`은 `git mv`를 허용하는 개인 실행 설정이다. 조사 시점에 Git 추적 대상이 아니며, 공유 문서 체계보다는 로컬 도구 설정에 해당한다.

## 7. GitHub·Notion 협업 문서

`.github/`는 저장소 안 문서를 읽는 체계라기보다 작업 요청과 결과를 구조화하는 협업 표면이다.

- 이슈 템플릿은 `chore`, `deploy`, `design`, `docs`, `feat`, `fix`, `hotfix`, `refactor`의 8종이며, 제목 접두사·라벨과 Description·마감 기한을 제공한다.
- PR 템플릿은 연관 이슈, 작업 내용, 선택적 스크린샷, 리뷰 요구사항을 받는다.
- `CI.yml`은 PR에서 테스트와 린트를 실행한다.
- 개발·프리뷰·프로덕션·Storybook 배포 워크플로가 결과물을 배포하고 일부는 PR 또는 Discord에 상태를 알린다.
- `Notion_Sync.yml`과 `notion_sync.py`는 새 이슈와 PR 상태를 Notion 데이터베이스 항목에 동기화한다. Markdown 문서 본문을 Notion과 동기화하는 구조는 아니다.

현재 CI에는 Markdown 형식, 내부 링크, 문서 최신성, 코드와 문서 간 계약을 검사하는 단계가 없다.

## 8. 현재 확인되는 권위와 읽기 경로

저장소 전체를 포괄하는 명시적 문서 우선순위는 없다. 문서가 직접 선언하거나 서로를 연결한 범위에서 확인되는 관계는 다음과 같다.

1. `AGENTS.md`는 에이전트의 저장소 진입점이며, 프로젝트 원칙으로 Constitution을, Speckit 상세 실행법으로 `.claude/commands/speckits/*`를 가리킨다.
2. Constitution은 모든 코드와 리뷰가 따라야 할 원칙을 선언한다.
3. `.codex/prompts/*`는 `.claude/commands/speckits/*`를 상세 원본으로 가리킨다.
4. `.specify/templates/*`는 명령이 생성하는 문서의 형식을 제공한다.
5. `.agents/skills/*`는 관련 작업에서 선택적으로 읽는 범용 참고 자료다.
6. `docs/*`는 개별 주제의 프로젝트 사실을 담지만 `AGENTS.md`, Constitution, 코드 규칙과의 권위 관계가 선언되어 있지 않다.

사람에게는 `README.md` 이후 어디를 읽어야 하는지 안내가 없고, 에이전트에게도 기능 종류별 `docs/*` 필수 읽기 경로가 없다. 결과적으로 필요한 문서의 발견은 파일명 검색이나 사전 지식에 의존한다.

## 9. 구조상 중복·불일치·공백

다음은 개선안이 아니라 조사 과정에서 확인한 현행 상태다.

### 9.1 체계와 권위

- `.agent`와 `.agents`는 이름이 매우 비슷하지만 각각 워크플로와 스킬을 담당한다. 루트 인덱스가 없어 역할 차이가 경로만으로 전달된다.
- 프로젝트 전체의 권위 순서, 문서 유형, 소유자, 갱신 조건을 선언하는 문서가 없다.
- `docs/`에는 기술 계약·운영 절차·분석 가이드가 혼재하지만 인덱스와 분류 체계가 없다.
- 코드 변경 때 어떤 장기 문서를 함께 갱신해야 하는지 연결하는 규칙이나 검증이 없다.

### 9.2 워크플로 중복과 의미 차이

- Speckit 절차는 `.claude/commands`, `.agent/workflows`, `.codex/prompts`에 세 형태로 존재한다. `.codex`는 원본 링크가 있지만 `.agent/workflows`는 독립 사본이어서 변경 시 동기화 장치가 없다.
- `.agent/gemini`와 `.agent/codex`는 별도의 명세·인계·구현 체계를 구성하며, 표준 Speckit과 산출물 경로와 명령 의미가 다르다.
- 표준 Speckit의 `analyze`는 파일을 고치지 않는 정합성 보고인 반면 Gemini의 `analyze`는 `tasks/`에 구현 인계 문서를 생성한다.
- `AGENTS.md`는 `checklist`를 구현 뒤 마지막 단계로 나열하지만, 실제 `specify`는 첫 단계에서 체크리스트를 만들고 `implement`는 체크리스트 완료 상태를 진입 조건으로 사용한다.

### 9.3 규칙 간 충돌 또는 드리프트

- Constitution과 `AGENTS.md`는 모든 기능 구현에 TDD를 요구하지만, `.specify/templates/tasks-template.md`와 `.claude/commands/speckits/tasks.md`는 명시적으로 요청된 경우에만 테스트 작업을 생성하도록 적혀 있다.
- 브랜치 규칙은 `README.md`의 `feature/*`, `AGENTS.md`와 Codex 프롬프트의 `feat/#{issue}-{slug}`, 정식 Speckit의 `{type}/#{issue}-{slug}`로 서로 다르다.
- 분석 도구는 `README.md`와 Constitution에서 GA4/ReactGA로, `docs/analytics-dashboard.md`에서는 Amplitude로 설명된다. `package.json`에는 두 라이브러리가 모두 있어 각 문서가 현재 상태·이행 상태·병행 상태 중 무엇을 나타내는지 문서만으로 확정할 수 없다.
- `.specify/templates/plan-template.md`와 Constitution 갱신 명령은 존재하지 않는 `.specify/templates/commands/*`를 참조한다. 실제 상세 명령은 `.claude/commands/speckits/*`에 있다.
- Remotion 스킬의 `SKILL.md`는 존재하지 않는 `rules/sound-effects.md`를 가리키며 실제 파일명은 `rules/sfx.md`다. 그 밖에도 스킬 통합본과 일부 규칙 문서에서 해결되지 않는 상대 링크가 확인된다.

### 9.4 문서 수명 주기와 외부 접근성

- `specs/`는 자동화의 핵심 산출물 위치이지만 전부 Git에서 제외되므로 과거 기능의 명세·계획·결정 근거가 저장소에 남지 않는다.
- 정식 `specify` 명령은 GitHub 이슈 본문에 `specs/{type}/.../spec.md` 경로를 적도록 하지만, 해당 파일은 원격 저장소에 올라가지 않으므로 원격 이슈에서 실제 문서로 접근할 수 없다.
- 임시 `specs/`에서 장기 보관할 가치가 있는 결정이나 계약을 `docs/`로 승격하는 조건과 절차가 없다.
- GitHub/Notion 자동화는 이슈와 PR의 상태를 동기화하지만 저장소 문서의 색인·검증·게시에는 관여하지 않는다.

## 10. 현행 체계 요약

현재 저장소는 개별 문서의 내용과 에이전트 자동화 자산은 풍부하다. 특히 Speckit은 명세·계획·작업·체크리스트를 생성하는 템플릿과 스크립트를 갖추고 있고, `docs/`의 세 문서도 각 주제에서는 구체적인 실무 정보를 제공한다. 외부 스킬은 프론트엔드 작업에 적용할 상세 참고 지식을 폭넓게 제공한다.

반면 이 요소들을 하나의 문서 체계로 묶는 인덱스, 권위 순서, 문서 유형별 위치, 작업별 필수 읽기 경로, 장기 보관 기준은 없다. 같은 Speckit 절차의 복수 표현과 별도 Gemini/Codex 절차가 병존하고, 일부 정책·템플릿·기술 설명은 서로 다른 상태를 나타낸다. 따라서 현행 체계는 **자료와 자동화는 많지만, 발견·권위·수명 주기·동기화 규칙은 분산된 상태**로 요약할 수 있다.
