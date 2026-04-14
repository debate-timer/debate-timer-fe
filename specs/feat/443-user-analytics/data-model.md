# Data Model: 사용자 지표 수집 시스템

## 이벤트 분류 체계 (Event Taxonomy)

### 공통 속성 (Global Properties)

모든 이벤트에 자동으로 포함되는 속성:

| 속성명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `user_type` | `'member' \| 'guest'` | 사용자 유형 (회원/비회원) | `'member'` |
| `language` | `string` | 현재 사용 언어 | `'ko'`, `'en'` |
| `page_path` | `string` | 현재 페이지 경로 | `'/home'` |

### 사용자 속성 (User Properties)

사용자에게 영구적으로 부여되는 속성 (Amplitude `identify` 호출):

| 속성명 | 타입 | 설명 | 설정 시점 |
|--------|------|------|-----------|
| `user_type` | `'member' \| 'guest'` | 사용자 유형 | 세션 시작 시, 로그인/로그아웃 시 |
| `language` | `string` | 사용 언어 | 세션 시작 시, 언어 변경 시 |

### 이벤트 목록

#### 1. 페이지 추적 (Page Tracking)

| 이벤트명 | 설명 | FR | 추가 속성 |
|----------|------|-----|-----------|
| `page_view` | 페이지 전환 시 | FR-001, FR-015 | `page_title`, `previous_page_path`, `referrer` |
| `page_leave` | 페이지 이탈 시 | FR-002 | `page_title`, `page_path`, `duration_ms` |

> 체류 시간(FR-002)은 `page_view` 진입 시각을 기록하고, 다음 라우트 전환 또는 페이지 이탈 시 `page_leave` 이벤트로 경과 시간(`duration_ms`)을 전송하여 라우트 레벨에서 측정한다. Amplitude 기본 세션 추적은 세션 레벨 지속 시간만 제공하므로 화면별 체류 시간 측정에는 부족하다.

#### 2. 회원 전환 (Conversion)

| 이벤트명 | 설명 | FR | 추가 속성 |
|----------|------|-----|-----------|
| `login_started` | 로그인 시도 (로그인 버튼 클릭) | FR-003 | `trigger_page`, `trigger_context` |
| `login_completed` | 로그인 완료 | FR-003, FR-004 | `trigger_page`, `trigger_context`, `member_id` |

**`trigger_context` 값**:
- `'landing_header'` — 랜딩 헤더 로그인 버튼
- `'landing_table_section'` — 랜딩 시간표 섹션 로그인 버튼
- `'share_save'` — 공유 링크에서 저장 시 로그인 유도
- `'timer_modal'` — 타이머 페이지 로그인 모달
- `'protected_route'` — 인증 필요 페이지 자동 리다이렉트
- `'unknown'` — 로그인 출처를 복원하지 못한 경우의 fallback

#### 3. 시간표 공유 (Sharing)

| 이벤트명 | 설명 | FR | 추가 속성 |
|----------|------|-----|-----------|
| `table_shared` | 공유 버튼 클릭 | FR-005 | `table_id` (`number \| string`, 현재 문자열 fallback은 `'guest'`) |
| `share_link_entered` | 공유 링크로 유입 (`data` 쿼리 존재 + `source !== 'template'`일 때만) | FR-006 | `referrer` |

> `share_link_entered`는 `/share` 진입 중에서도 실제 공유 링크 유입만 집계한다. 현재 구현은 `data` 쿼리 파라미터가 존재하고, 템플릿 진입을 나타내는 `source=template`이 아닐 때만 이벤트를 발화한다.

#### 4. 토론 진행 (Debate Flow)

| 이벤트명 | 설명 | FR | 추가 속성 |
|----------|------|-----|-----------|
| `timer_started` | 토론 타이머 시작 | FR-007 | `table_id` (`number \| string`, 현재 문자열 fallback은 `'guest'`), `total_rounds` |
| `debate_completed` | 토론 완료 처리 | FR-007 | `table_id` (`number \| string`, 현재 문자열 fallback은 `'guest'`), `total_rounds` |
| `debate_abandoned` | 토론 중도 이탈 | FR-008 | `table_id` (`number \| string`, 현재 문자열 fallback은 `'guest'`), `current_round`, `total_rounds`, `abandon_type` |

**`abandon_type` 값**:
- `'navigation'` — SPA 내부 라우트 변경
- `'unload'` — 탭/브라우저 닫기
- `'visibility'` — 백그라운드 전환 (모바일)

#### 5. 템플릿 (Template)

| 이벤트명 | 설명 | FR | 추가 속성 |
|----------|------|-----|-----------|
| `template_selected` | 템플릿 선택 | FR-009 | `organization_name`, `template_name`, `template_label` |
| `template_used` | 템플릿으로 실제 토론 시작 | FR-009 | `organization_name`, `template_name`, `template_label`, `table_id` (`number \| string`, 현재 문자열 fallback은 `'guest'`) |

> `template_label`은 현재 구현에서 `"{organization_name} - {template_name}"` 형식의 조합 문자열로 저장한다.

#### 6. 투표 (Poll)

| 이벤트명 | 설명 | FR | 추가 속성 |
|----------|------|-----|-----------|
| `poll_created` | 투표 생성 | FR-010 | `table_id`, `poll_id` |
| `poll_voted` | 투표 참여 | FR-010 | `poll_id`, `team` |
| `poll_result_viewed` | 투표 결과 조회 | FR-010 | `poll_id` |

#### 7. 피드백 타이머 (Feedback Timer)

| 이벤트명 | 설명 | FR | 추가 속성 |
|----------|------|-----|-----------|
| `feedback_timer_started` | 피드백 타이머 시작 | FR-011 | `table_id` |

## 엔티티 관계

```
User (Amplitude ID)
├── User Properties: { user_type, language }
├── Device ID (anonymous, auto-generated)
└── User ID (member_id, set on login)

Event
├── event_type: string (이벤트명)
├── event_properties: { ... } (이벤트별 추가 속성)
├── user_properties: { user_type, language } (글로벌)
├── timestamp: number (자동)
├── session_id: number (자동, Amplitude 세션 관리)
└── device_id / user_id (자동)

Funnel Definitions (Amplitude 대시보드에서 설정):
├── 비회원→회원 전환: login_started → login_completed
├── 토론 완주: timer_started → debate_completed
└── 템플릿 활용: template_selected → template_used
```
