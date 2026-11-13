# 멀티 디바이스 속기록 결정 기록

현행 정책은 [속기록 설계 - 멀티 디바이스 기반](../feature/transcript-multi-device.md)에서 관리하며, 결정 기록의 작성·상태 관리는 [위키 유지보수 기준](../maintenance.md#결정-기록을-남기는-조건)을 따름.

### TRANSCRIPT-MULTI-DEVICE-DEC-001 — V2 분리와 턴별 후보 선택 방식

- 결정일: 2026-11-12, 상태: 승인임. 작업: `debate-timer-be`의 `feat/multi-device-recording-v2` 브랜치이며 PR 생성 전임.
- 승인 근거: 계획 대화에서 사용자가 청중 기기 녹음 수집과 턴별 최고 품질 선택을 요청하고, 아래 세 선택지를 고른 뒤 계획의 구현을 요청했음.
- 이 승인은 FE 구현·서버 운영 배포의 증거가 아님.

| 결정 | 이유·한계 | 현행 정책 |
| --- | --- | --- |
| 기존 속기 코드를 수정하지 않고 V2 API·서비스·테이블로 분리함 | 이후 V1·V2 중 하나로 전환할 수 있도록 함께 걷어낼 수 있어야 함 | [목적과 제공 기능](../feature/transcript-multi-device.md#목적과-제공-기능) |
| 품질은 기기가 계산한 Web Audio 지표를 서버가 범위·크기 검증한 뒤 점수화함 | 서버 ffmpeg 분석은 1GB 인스턴스의 CPU·메모리 부담과 인프라 변경이 크고, 모든 후보 전사 후 비교는 비용이 기기 수만큼 늘어남. 지표 조작 가능성은 받아들임 | [후보 선택](../feature/transcript-multi-device.md#후보-선택) |
| 청중은 세션 참가 코드로 기기 토큰을 받아 업로드함 | `roomId`만으로 참가하면 추측 가능한 테이블 ID로 누구나 올릴 수 있음 | [녹음 세션과 권한](../feature/transcript-multi-device.md#녹음-세션과-권한) |
| 종료 후 서버가 턴 전사 결과로 속기록을 만들고 FE는 상태를 폴링함 | FE가 결과를 모아 기존 생성 API로 제출하는 방식보다 FE 로직이 단순함 | [기본 동작](../feature/transcript-multi-device.md#기본-동작) |
