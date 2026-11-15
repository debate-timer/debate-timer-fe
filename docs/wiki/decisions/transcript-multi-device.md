# 멀티 디바이스 속기록 결정 기록

현행 정책은 [속기록 설계 - 멀티 디바이스 기반](../feature/transcript-multi-device.md)에서 관리하며, 결정 기록의 작성·상태 관리는 [위키 유지보수 기준](../maintenance.md#결정-기록을-남기는-조건)을 따름.

### TRANSCRIPT-MULTI-DEVICE-DEC-001 — V2 분리와 턴별 후보 선택 방식

- 결정일: 2026-11-12, 상태: 승인임. 작업: BE 구현 [debate-timer-be PR #330](https://github.com/debate-timer/debate-timer-be/pull/330), 설계 문서 [PR #566](https://github.com/debate-timer/debate-timer-fe/pull/566)임.
- 승인 근거: 계획 대화에서 사용자가 청중 기기 녹음 수집과 턴별 최고 품질 선택을 요청하고, 아래 세 선택지를 고른 뒤 계획의 구현을 요청했음.
- 이 승인은 FE 구현·서버 운영 배포의 증거가 아님.

| 결정 | 이유·한계 | 현행 정책 |
| --- | --- | --- |
| 기존 속기 코드를 수정하지 않고 V2 API·서비스·테이블로 분리함 | 이후 V1·V2 중 하나로 전환할 수 있도록 함께 걷어낼 수 있어야 함 | [목적과 제공 기능](../feature/transcript-multi-device.md#목적과-제공-기능) |
| 품질은 기기가 계산한 Web Audio 지표를 서버가 범위·크기 검증한 뒤 점수화함 | 서버 ffmpeg 분석은 1GB 인스턴스의 CPU·메모리 부담과 인프라 변경이 크고, 모든 후보 전사 후 비교는 비용이 기기 수만큼 늘어남. 지표 조작 가능성은 받아들임 | [후보 선택](../feature/transcript-multi-device.md#후보-선택) |
| 청중은 세션 참가 코드로 기기 토큰을 받아 업로드함 | `roomId`만으로 참가하면 추측 가능한 테이블 ID로 누구나 올릴 수 있음 | [녹음 세션과 권한](../feature/transcript-multi-device.md#녹음-세션과-권한) |
| 종료 후 서버가 턴 전사 결과로 속기록을 만들고 FE는 상태를 폴링함 | FE가 결과를 모아 기존 생성 API로 제출하는 방식보다 FE 로직이 단순함 | [기본 동작](../feature/transcript-multi-device.md#기본-동작) |

### TRANSCRIPT-MULTI-DEVICE-DEC-002 — 기기 토큰 무효를 재참가로 복구

- 결정일: 2026-11-15, 상태: 승인임. 작업: BE [debate-timer-be PR #330](https://github.com/debate-timer/debate-timer-be/pull/330) 리뷰 반영, FE #577임.
- 승인 근거: PR #330 리뷰(녹음 중 업로드 간격만으로 기기를 지우는 문제)와 무중단 배포 스크립트 검토 대화에서, 사용자가 이 문제를 기기의 재참가·재업로드로 반영하도록 요청했음.
- 이 승인은 서버 운영 배포의 증거가 아님.

| 결정 | 이유·한계 | 현행 정책 |
| --- | --- | --- |
| 업로드가 `403 INVALID_RECORDING_DEVICE`면 사회자는 `host-device`, 청중은 참가 코드로 다시 참가해 같은 턴을 한 번만 다시 올림. 녹음 중 생존 신호로 토큰을 유지하는 방식은 쓰지 않음 | 10분 무활동 정리, 서버 재시작, 무중단 배포의 nginx 전환은 모두 서버가 기기 토큰을 잃는 같은 상황이라 한 경로로 복구함. 기기 목록을 DB로 옮기거나 생존 신호 API를 추가하는 비용을 피함. 지워진 기기는 턴 마감 판단에서 빠져 늦게 다시 올린 녹음이 버려질 수 있고, 이전 앱이 모으던 마감 전 턴의 후보는 잃음 | [기기 토큰 무효와 재참가](../feature/transcript-multi-device.md#기기-토큰-무효와-재참가) |
