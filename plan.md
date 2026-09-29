# 문서 개편 계획

## 구조

```text
표식: +신설, ~개편·이관
~README.md: 서비스·실행
~AGENTS.md: 에이전트 진입
docs/
├─+README.md: 색인·권위·읽기 경로
├─~CONSTITUTION.md: 불변 원칙
├─architecture/
│ ├─+overview.md: 구조·의존성
│ ├─+ui-state.md: React UI·상태
│ ├─+data-access.md: 데이터 접근
│ ├─~realtime.md: 소켓 동기화
│ └─+errors.md: 오류·관측
├─conventions/
│ ├─+typescript.md: TS 규칙
│ ├─+react.md: React 규칙
│ └─+quality.md: 품질 규칙
└─workflows/
  ├─+development.md: 개발 절차
  ├─~local-login.md: 로컬 인증
  └─~analytics.md: 지표 운영
```

## 순서

1. 결정 확정과 권위 수립
2. `conventions.md` 분할·코드 연결
3. 기존 문서 압축·이동, 진입점 정합화
4. 500자 권장·700자 상한, 명사형·링크 검증

## 결정

- Constitution: `docs` 이관/현 위치
- Speckit: 단일 흐름과 `specs/` 추적/무시
- 조사 산출물 4종: 삭제/보관
- 기존 장문 3종: 분할/700자 예외
