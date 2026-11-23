# 승패 투표

## 목적과 제공 기능

토론 종료 후 사회자가 승패 투표를 생성해 QR 코드로 공유하고, 청중이 찬성·반대 진영에 투표한 뒤 사회자가 투표를 마감해 승리 진영과 득표 세부 결과를 확인하는 기능임. 사회자용 투표 생성·진행·마감·결과 확인 흐름과 청중용 투표 참여·완료 안내 흐름을 다룸.

**지식 상태:** 헤더 역할·공개 조회 응답 정규화·투표 완료 화면의 캐시 재사용은 MP-04([SHARED-DEC-001](../decisions/shared.md#shared-dec-001--mp-04-헤더탐색청중-완료-연결))에서 승인된 확정 정책이고, 청중 투표 참여 조회의 지역 복구(`retry: false`, `throwOnError: false`, 5초 타임아웃 유지)는 2026-11-23 이슈 수정 대화에서 사용자가 확정한 정책임. 그 외 화면·API 동작은 코드와 테스트에서 확인한 사실이며 별도 정책 승인으로 확대하지 않음. 상태의 효력은 [위키 유지보수 기준](../maintenance.md#지식의-상태와-근거)을 따름.

HTTP 경계와 공개 투표 응답·캐시 계약은 [데이터 접근](../../architecture/data-access.md#회원-설정과-공개-투표), 오류 수집과 지역 복구 원칙은 [오류와 관측](../../architecture/errors-observability.md)이 소유함. 역할별 헤더와 완료 화면 탐색 정책은 [헤더와 탐색](navigation.md)이 소유함.

## 주요 개념과 관계

| 개념 | 의미 |
| --- | --- |
| 투표(`pollId`) | 특정 토론 시간표(`tableId`)에 대해 생성된 승패 투표 세션 식별자임 |
| 투표 상태(`status`) | `PROGRESS`(진행 중)와 `DONE`(마감 완료) 두 상태를 가짐 |
| 진영(`TeamKey`) | 투표 대상인 찬성(`PROS`) 또는 반대(`CONS`) 진영임. 결과 집계에서 득표수가 같으면 무승부(`null`)로 판정함 |
| 참여 코드(`participateCode`) | 청중 공개 투표 조회 응답에 포함되어 투표 제출 요청(`VoterPollInfo`)에 함께 전송하는 코드 문자열임 |
| 사회자 투표 정보(`PollInfo`) | 투표 상태, 찬성·반대 팀명, 총투표수·진영별 득표수, 참여자 이름 목록(`voterNames`)을 포함하는 사회자 전용 응답 정보임 |
| 청중 공개 투표 정보(`GetVoterPollInfoResponseType`) | 투표 상태, 팀명, 득표 집계, `participateCode`, 토론 정보(`tableInfo: { id, name, agenda }`)를 포함하며 `voterNames`는 제외된 공개 응답 정보임 |

도메인 타입은 [공용 타입](../../../src/types/type.ts), API 함수와 응답 계약은 [투표 API](../../../src/apis/apis/poll.ts)와 [투표 응답 타입](../../../src/apis/responses/poll.ts)이 근거임.

## 기본 동작

1. 사회자가 토론 종료 화면([DebateEndPage](../../../src/page/DebateEndPage/DebateEndPage.tsx))에서 승패 투표 카드를 누르면 `POST /api/polls/{tableId}`로 투표를 생성하고 사회자 투표 진행 화면(`/table/customize/{tableId}/end/vote/{pollId}`)으로 이동함.
2. 사회자 투표 진행 화면([DebateVotePage](../../../src/page/DebateVotePage/DebateVotePage.tsx))은 청중 참여 URL(`/vote/{pollId}`)을 담은 QR 코드를 표시하고, 5초 간격으로 `GET /api/polls/{pollId}`를 조회해 참여자 수와 참여자 이름 목록을 갱신함.
3. 청중이 QR 코드로 투표 참여 화면([VoteParticipationPage](../../../src/page/VoteParticipationPage/VoteParticipationPage.tsx))에 접속하면 `GET /api/polls/{pollId}/votes`로 투표·토론 정보를 조회함. 참여자 이름을 입력하고 찬성 또는 반대 팀을 선택한 뒤 확인 모달을 거쳐 `POST /api/polls/{pollId}/votes`로 제출하면 완료 화면(`/vote/end?pollId={pollId}`)으로 이동함.
4. 사회자가 투표 결과 보기 버튼을 눌러 마감 확인 모달에서 마감하기를 선택하면 `PATCH /api/polls/{pollId}`로 투표를 마감하고 결과 화면(`/table/customize/{tableId}/end/vote/{pollId}/result`)으로 이동함.
5. 사회자 투표 결과 화면([DebateVoteResultPage](../../../src/page/DebateVoteResultPage/DebateVoteResultPage.tsx))은 최종 득표수를 비교해 승리 팀 또는 무승부 카드를 먼저 표시하고, 세부 결과 확인 모달에서 재확인을 거치면 진영별 득표 막대와 인원수를 공개함.

## 조건별 정책과 예외

별도 표시가 없는 항목은 **구현에서 확인한 사실**임.

### API 계약과 데이터 정규화

**확정 정책:** 공개 투표 조회(`GET /api/polls/{pollId}/votes`)의 서버 응답은 `tableInfo: { id: number; name: string; agenda: string | null }`를 포함하고 참여자 이름 목록(`voterNames`)은 포함하지 않음. `getVoterPollInfo()`는 `pollId`를 `encodeURIComponent`로 인코딩해 요청하고 응답의 `tableInfo.agenda`가 `null`이면 빈 문자열(`''`)로 변환해 반환함. 근거는 [데이터 접근](../../architecture/data-access.md#회원-설정과-공개-투표)과 [공개 투표 API 테스트](../../../src/apis/apis/poll.test.ts)임.

| API 함수 | 메서드·경로 | 요청·응답 계약 | 사용 훅·진입점 |
| --- | --- | --- | --- |
| `postPoll(tableId)` | `POST /api/polls/{tableId}` | 본문 없이 요청하고 생성된 투표 `id`·`status`·팀명을 담은 `PostPollResponseType`을 반환함 | [useCreatePoll](../../../src/hooks/mutations/useCreatePoll.ts) (`usePostPoll`) |
| `getPollInfo(pollId)` | `GET /api/polls/{pollId}` | 득표 집계와 `voterNames`를 포함한 `GetPollResponseType`을 반환함 | [useGetPollInfo](../../../src/hooks/query/useGetPollInfo.ts) |
| `patchEndPoll(pollId)` | `PATCH /api/polls/{pollId}` | 본문 없이 투표를 마감하고 `PatchPollResponseType`을 반환함 | [useFetchEndPoll](../../../src/hooks/mutations/useFetchEndPoll.ts) |
| `getVoterPollInfo(pollId)` | `GET /api/polls/{pollId}/votes` | `participateCode`·집계·`tableInfo`를 포함한 공개 응답에서 `agenda: null`을 `''`로 정규화해 반환함 | [useGetVoterPollInfo](../../../src/hooks/query/useGetVoterPollInfo.ts), [useGetCompletionInfo](../../../src/hooks/query/useGetCompletionInfo.ts) |
| `postVoterPollInfo(pollId, voterInfo)` | `POST /api/polls/{pollId}/votes` | `{ name, participateCode, team }`을 전송하고 `PostVoterPollInfoResponseType`을 반환함 | [usePostVoterPollInfo](../../../src/hooks/mutations/usePostVoterPollInfo.ts) |

- 서버 OpenAPI 명세는 사회자용 API 3종(`POST /api/polls/{tableId}`, `GET /api/polls/{pollId}`, `PATCH /api/polls/{pollId}`)에 `Authorization` 헤더를 필수로 요구하고, 청중용 API 2종(`GET/POST /api/polls/{pollId}/votes`)은 인증 헤더가 없는 공개 API로 정의함.
- 서버 OpenAPI 명세에서 `tableInfo.agenda`는 투표 생성 시점의 토론 주제 스냅샷으로 설명되며 스키마에는 `string`으로만 표기되어 있으나, FE(`GetVoterPollInfoResponseType`)는 주제가 없는 시간표의 `null` 응답 가능성을 포함해 `string | null`로 받고 `''`로 정규화함.
- 투표 생성·마감·청중 제출의 세 변경 훅(`usePostPoll`, `useFetchEndPoll`, `usePostVoterPollInfo`)은 모두 `usePreventDuplicateMutation`을 사용해 300ms 내 중복 호출을 차단함.
- 사회자 조회 훅 `useGetPollInfo`는 `['Poll', pollId]` 캐시 키를, 청중 조회 훅 `useGetVoterPollInfo`와 완료 정보 훅 `useGetCompletionInfo('poll', pollId)`는 `['VoterPoll', pollId]` 캐시 키를 사용함.

근거: [투표 API](../../../src/apis/apis/poll.ts), [투표 응답 타입](../../../src/apis/responses/poll.ts), [MSW 핸들러](../../../src/mocks/handlers/poll.ts).

### 사회자 투표 생성과 진행 화면

**확정 정책:** 사회자 투표 진행 경로(`/table/customize/:tableId/end/vote/:pollId`)는 인증 보호(`requiresAuth: true`) 대상이며 타이머 역할 헤더(`TimerHeader`)를 표시함. 근거는 [헤더와 탐색](navigation.md#기본-동작)과 [라우트 정의](../../../src/routes/routes.tsx)임.

- 토론 종료 화면([DebateEndPage](../../../src/page/DebateEndPage/DebateEndPage.tsx))에서 승패 투표 카드 클릭 시 `postPoll(tableId)` 성공 콜백으로 `poll_created` 분석 이벤트(`{ table_id, poll_id }`)를 기록하고 투표 진행 화면으로 이동함.
- 진행 화면([DebateVotePage](../../../src/page/DebateVotePage/DebateVotePage.tsx))은 `tableId`와 `pollId`를 모두 `parsePositiveId`(양의 안전한 정수)로 검증함. 하나라도 유효하지 않으면 API 조회를 비활성화하고 `"유효하지 않은 투표 링크입니다."` 문구와 홈 이동 버튼을 가진 `ErrorIndicator`를 표시함.
- 유효한 식별자일 때 `useGetDebateTableData`로 헤더의 토론 이름·주제를 표시하고, `useGetPollInfo(pollId, { refetchInterval: 5000, enabled: isArgsValid })`로 5초마다 투표 정보를 폴링함.
- QR 코드는 `buildPublicUrl('/vote/${pollId}')`로 생성한 공개 참여 주소를 인코딩함.
- 우측 참여자 영역은 `voterNames.length`로 참여 인원수를 표시하며, 로딩이 끝난 뒤 `voterNames`가 비어 있으면 `"등록된 토론자가 없어요."`를, 1명 이상이면 이름 목록을 순서대로 렌더링함.
- 하단 `투표 결과 보기` 버튼을 누르면 마감 확인 모달(`"투표를 마감하시겠습니까?"`, `"투표를 마감하면 더이상 표를 받을 수 없습니다!"`)을 염. `마감하기` 클릭 시 `patchEndPoll(pollId)`를 호출하며, 성공 시 모달을 닫고 결과 화면으로 이동함. 실패 시 모달을 닫고 브라우저 `alert`로 `"투표 종료에 실패했습니다."`를 표시함.

근거: [DebateEndPage](../../../src/page/DebateEndPage/DebateEndPage.tsx), [DebateVotePage](../../../src/page/DebateVotePage/DebateVotePage.tsx).

### 사회자 투표 결과 화면

- 사회자 투표 결과 경로(`/table/customize/:tableId/end/vote/:pollId/result`)는 인증 보호(`requiresAuth: true`) 대상이며 `DefaultLayout`의 기본 일반 헤더를 사용함.
- 결과 화면([DebateVoteResultPage](../../../src/page/DebateVoteResultPage/DebateVoteResultPage.tsx))은 `rawPollId`·`rawTableId`가 존재하고 `Number.isNaN`이 아닌지 검사해 유효하지 않으면 `"유효하지 않은 투표 결과 링크입니다."`와 홈 이동 `ErrorIndicator`를 표시함. 진행·참여 화면과 달리 `parsePositiveId` 대신 `Number`·`Number.isNaN` 검사를 사용함.
- 결과 조회(`useGetPollInfo(pollId, { enabled: isArgsValid })`)가 처음 성공하면 `poll_result_viewed` 분석 이벤트(`{ poll_id }`)를 마운트 수명당 1회 기록함.
- 승패 판정(`getWinner`)은 `prosCount > consCount`이면 찬성(`PROS`), `consCount > prosCount`이면 반대(`CONS`), 같으면 무승부(`null`, 표시명 `"무승부"`)를 반환함. 팀명이 비어 있으면 `"찬성팀"`·`"반대팀"` 기본 문구를, 득표수가 없으면 `0`을 사용함.
- [WinnerCard](../../../src/page/DebateVoteResultPage/components/WinnerCard.tsx)는 승리 진영이 있을 때 진영별 스타일과 상단 왕관 이미지를 표시하고, 무승부(`teamkey === null`)일 때는 중립 스타일만 표시하며 왕관을 숨김.
- 하단에는 `토론 종료 화면으로 돌아가기`와 `세부 결과 확인하기` 두 버튼을 제공하며 로딩 중에는 둘 다 비활성화함.
- 브라우저 뒤로 가기(`popstate` 이벤트)가 발생하거나 `토론 종료 화면으로 돌아가기`를 누르면 이미 마감된 투표 진행 화면으로 되돌아가지 않도록 `/table/customize/${tableId}/end`로 `replace: true` 이동함.
- `세부 결과 확인하기`를 누르면 먼저 `"정말로 세부 결과를 공개할까요?"` 확인 모달을 표시함. `네`를 누르면 같은 모달 안에서 닫기 버튼을 활성화하고 [VoteDetailResult](../../../src/page/DebateVoteResultPage/components/VoteDetailResult.tsx)로 전환함. 모달을 닫으면 확인 상태(`isConfirmed`)를 `false`로 초기화함.
- 세부 결과는 찬성·반대 각각의 [VoteBar](../../../src/page/DebateVoteResultPage/components/VoteBar.tsx)에 전체 득표(`pros.count + cons.count`) 대비 비율 막대 애니메이션과 `AnimatedCounter` 인원수를 표시하고, 하단 `홈으로 돌아가기` 버튼으로 현재 언어의 루트 경로(`/`)로 이동함.

근거: [DebateVoteResultPage](../../../src/page/DebateVoteResultPage/DebateVoteResultPage.tsx), [WinnerCard](../../../src/page/DebateVoteResultPage/components/WinnerCard.tsx), [VoteDetailResult](../../../src/page/DebateVoteResultPage/components/VoteDetailResult.tsx), [VoteBar](../../../src/page/DebateVoteResultPage/components/VoteBar.tsx).

### 청중 투표 참여와 완료 화면

**확정 정책:** 청중 투표 참여(`/vote/:id`)와 완료(`/vote/end`)는 비회원 접근(`requiresAuth: false`)을 허용하고 청중 헤더(`AudienceHeaderContainer`)를 표시함. 완료 화면은 `pollId` query가 유효할 때 `['VoterPoll', pollId]` 캐시를 우선 재사용하고, 캐시가 없을 때만 공개 조회 API를 자동 재시도 없이 1회 호출함. 조회 실패 시에도 `"투표가 완료되었습니다."` 안내를 유지하고 헤더 아래에 수동 재시도 배너(`CompletionInfoNotice`)를 제공함. 근거는 [헤더와 탐색](navigation.md#완료종료-안내)과 [데이터 접근](../../architecture/data-access.md#완료-화면의-공개-정보)임.

**확정 정책 (2026-11-23 사용자 승인):** 청중 투표 참여 조회 훅([useGetVoterPollInfo](../../../src/hooks/query/useGetVoterPollInfo.ts))은 전역 5초 타임아웃(`5000ms`)을 유지하되 `retry: false`와 `throwOnError: false`를 설정함. 조회 실패나 타임아웃(`ECONNABORTED`)이 발생해도 전역 `ErrorBoundary`로 전파하거나 자동 반복 재시도하지 않고, 화면의 지역 `ErrorIndicator`를 통해 사용자가 수동 재시도(`refetch`)로 복구함. 근거는 2026-11-23 Sentry 이슈 `DEBATETIMER-WEB-1K` 수정 계획에 대한 사용자 결정과 [투표 참여 훅 테스트](../../../src/hooks/query/useGetVoterPollInfo.test.tsx), [투표 참여 페이지 테스트](../../../src/page/VoteParticipationPage/VoteParticipationPage.test.tsx)임.

- 참여 화면([VoteParticipationPage](../../../src/page/VoteParticipationPage/VoteParticipationPage.tsx))은 URL `:id`를 `parsePositiveId`로 검증함. 유효하지 않으면 조회를 실행하지 않고 `"유효하지 않은 투표 링크입니다."`와 홈 이동 버튼을 가진 `ErrorIndicator`를 표시함.
- 조회 성공 전이나 실패 상태에서도 `AudienceHeaderContainer`를 유지하며, 데이터가 없으면 헤더가 기본 대체 문구(`"시간표 이름 없음"`, `"주제 없음"`)를 표시함.
- 참여자는 `ClearableInput`에 이름을 입력하고 찬성·반대 [VoteTeamButton](../../../src/page/VoteParticipationPage/components/VoteTeamButton.tsx) 중 하나를 선택함. 한쪽 진영을 선택하면 선택된 버튼만 진영 강조 스타일과 `aria-pressed="true"`를 유지하고 반대쪽은 비활성 색상으로 전환됨.
- 하단 `투표완료` 버튼은 `participantName.trim().length > 0`이고 `selectedTeam !== null`일 때만 활성화함.
- `투표완료` 클릭 시 확인 모달(`"투표를 제출하시겠습니까?"`, `"(제출 후에는 변경이 불가능 합니다.)"`)을 표시함. `다시 투표하기`는 모달만 닫고 입력 상태를 유지하며, `제출하기`는 `poll_voted` 분석 이벤트(`{ poll_id, team }`)를 기록한 뒤 `{ name: participantName.trim(), participateCode: data?.participateCode ?? '', team: selectedTeam }`으로 `postVoterPollInfo`를 호출하고 모달을 닫음.
- 제출 성공 시 현재 언어의 `/vote/end?pollId=${pollId}`([VoteCompletePage](../../../src/page/VoteCompletePage/VoteCompletePage.tsx))로 이동함.

근거: [VoteParticipationPage](../../../src/page/VoteParticipationPage/VoteParticipationPage.tsx), [VoteTeamButton](../../../src/page/VoteParticipationPage/components/VoteTeamButton.tsx), [VoteCompletePage](../../../src/page/VoteCompletePage/VoteCompletePage.tsx), [useGetCompletionInfo](../../../src/hooks/query/useGetCompletionInfo.ts).

### 현재 구현의 예외 처리 경계

**구현에서 확인한 사실:**

- 사회자용 `useGetPollInfo`([useGetPollInfo.ts](../../../src/hooks/query/useGetPollInfo.ts))는 `throwOnError: false`를 별도 지정하지 않음. `DebateVotePage`와 `DebateVoteResultPage`에 `isError` 분기(`ErrorIndicator`)가 작성되어 있으나, 앱 전역 `QueryClient` 기본값(`queries.throwOnError: true`)에서는 초기 조회 실패 시 지역 `isError` 분기 대신 상위 `ErrorBoundary`로 전파됨.
- 서버 OpenAPI 명세상 청중 공개 조회(`GET /api/polls/{pollId}/votes`)의 `404` 실패 사유는 `POLL_NOT_FOUND`(`"투표를 찾을 수 없습니다."`)와 `TABLE_NOT_FOUND`(`"토론 테이블을 찾을 수 없습니다."`)임. FE는 사유별 서버 메시지를 개별 표시하지 않고 참여 화면의 `ErrorIndicator` 또는 완료 화면의 `CompletionInfoNotice`로 공통 복구 UI를 제공함.
- 서버 OpenAPI 명세상 청중 투표 제출(`POST /api/polls/{pollId}/votes`)의 `400` 실패 사유는 `INVALID_POLL_PARTICIPANT_CODE`(`"잘못된 투표참여 코드입니다"`), `ALREADY_DONE_POLL`(`"이미 완료된 투표 입니다"`), `INVALID_POLL_PARTICIPANT_NAME`(`"잘못된 투표자 이름입니다"`), `ALREADY_VOTED_PARTICIPANT`(`"이미 참여한 투표자 입니다"`)임. 공개 조회 응답의 `status`가 `'DONE'`이어도 `VoteParticipationPage`는 화면 진입 시 별도 마감 안내로 분기하거나 입력을 잠그지 않으며, `usePostVoterPollInfo`([usePostVoterPollInfo.ts](../../../src/hooks/mutations/usePostVoterPollInfo.ts))에도 별도 `onError`나 `throwOnError: false`가 없어 마감된 투표 제출·중복 참여 등의 `400` 실패는 전역 설정(`mutations.throwOnError: true`)에 따라 상위 `ErrorBoundary`로 전파됨.

## 인접 기능과의 경계

| 기능 | 승패 투표와의 경계 |
| --- | --- |
| 토론 종료 화면 | 사회자의 투표 생성(`POST /api/polls/{tableId}`) 진입점과 결과 확인 후 복귀 목적지(`/table/customize/{tableId}/end`)를 제공함. 피드백 타이머·속기록 배너는 해당 기능이 소유함 |
| 헤더와 탐색 | 사회자 투표 진행의 타이머 헤더, 결과 화면의 일반 헤더, 청중 참여·완료의 청중 헤더 역할과 완료 화면 캐시 재사용 정책은 [헤더와 탐색](navigation.md)이 소유함 |
| 오류와 관측 | `/vote` 및 `/table/customize/.../end/vote` 경로의 API 오류를 Sentry `feature: 'vote'` 태그로 분류하는 규칙은 [오류와 관측](../../architecture/errors-observability.md)이 소유함 |

## 검증 근거와 한계

- API 계약과 `agenda: null` 정규화, `voterNames` 제외는 [공개 투표 API 테스트](../../../src/apis/apis/poll.test.ts)에서 검증함.
- 청중 투표 조회 실패 시 단일 요청(`retry: false`)과 지역 복구 UI(`throwOnError: false`, `ErrorIndicator` 재시도)는 [투표 참여 훅 테스트](../../../src/hooks/query/useGetVoterPollInfo.test.tsx)와 [투표 참여 페이지 테스트](../../../src/page/VoteParticipationPage/VoteParticipationPage.test.tsx)에서 검증함.
- 투표 완료 화면의 캐시 재사용, 잘못된 `pollId` 방어, 새로고침 조회 실패 시 완료 안내 유지와 재시도 배너는 [완료 정보 훅 테스트](../../../src/hooks/query/useGetCompletionInfo.test.tsx)와 [투표 완료 페이지 테스트](../../../src/page/VoteCompletePage/VoteCompletePage.test.tsx)에서 검증함.
- 각 화면의 상태별 UI 구성은 [DebateVotePage Story](../../../src/page/DebateVotePage/DebateVotePage.stories.tsx), [DebateVoteResultPage Story](../../../src/page/DebateVoteResultPage/DebateVoteResultPage.stories.tsx), [VoteParticipationPage Story](../../../src/page/VoteParticipationPage/VoteParticipationPage.stories.tsx), [VoteCompletePage Story](../../../src/page/VoteCompletePage/VoteCompletePage.stories.tsx)에서 확인함.
- 사회자 투표 진행·결과 화면(`DebateVotePage`, `DebateVoteResultPage`)의 전용 단위·통합 테스트 파일은 아직 없으며 Story와 MSW 핸들러 기반 수동 검증 범위로 남아 있음.
