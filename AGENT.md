# 언어 인식 네비게이션 중앙화 구현 계획

## 목표
23개 이상 파일에서 반복되는 언어 추출 + 경로 빌드 로직을 중앙화하여 DRY 원칙 준수

## 현재 반복 패턴 (제거 대상)
```typescript
const { i18n } = useTranslation();
const currentLang = i18n.resolvedLanguage ?? i18n.language;
const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
navigate(buildLangPath('/path', lang));
```

---

## 구현 계획

### 1. Core Utility 확장 (`src/util/languageRouting.ts`)

`SupportedLang` 타입과 `getCurrentLang` 함수 추가:

```typescript
// 새로 추가
export type { SupportedLang };

export const getCurrentLang = (i18n: { resolvedLanguage?: string; language: string }): SupportedLang => {
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  return isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
};
```

### 2. React Hooks 생성 (`src/hooks/useLangNavigate.ts`)

```typescript
// useCurrentLang - 현재 언어 반환
// useLangNavigate - navigate() 대체
// useLangPath - 경로만 필요할 때
```

### 3. React 외부 유틸 (`src/util/langNavigation.ts`)

```typescript
// navigateWithLang(path) - axios interceptor 등에서 사용
// i18n 싱글톤 직접 참조
```

---

## 수정 대상 파일

### A. 신규 생성
1. `src/hooks/useLangNavigate.ts` - 훅 정의

### B. 수정
1. `src/util/languageRouting.ts` - getCurrentLang, SupportedLang export 추가
2. `src/apis/axiosInstance.ts` - navigateWithLang 사용

### C. 마이그레이션 (useLangNavigate 적용)
- `src/components/BackActionHandler.tsx`
- `src/components/ErrorBoundary/ErrorPage.tsx`
- `src/components/ErrorBoundary/NotFoundPage.tsx`
- `src/components/GoToDebateEndButton/GoToDebateEndButton.tsx`
- `src/layout/components/header/StickyTriSectionHeader.tsx`
- `src/page/DebateEndPage/DebateEndPage.tsx`
- `src/page/DebateEndPage/components/GoToOverviewButton.tsx`
- `src/page/DebateVotePage/DebateVotePage.tsx`
- `src/page/DebateVoteResultPage/DebateVoteResultPage.tsx`
- `src/page/LandingPage/hooks/useLandingPageHandlers.ts`
- `src/page/OAuthPage/OAuth.tsx`
- `src/page/TableComposition/hook/useTableFrom.tsx`
- `src/page/TableSharingPage/TableSharingPage.tsx`
- `src/page/TimerPage/components/LoginAndStoreModal.tsx`
- `src/page/TimerPage/hooks/useTimerPageModal.ts`
- `src/page/VoteParticipationPage/VoteParticipationPage.tsx`
- `src/routes/ProtectedRoute.tsx`

---

## 변경 전후 비교

### Before (각 컴포넌트)
```typescript
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { buildLangPath, DEFAULT_LANG, isSupportedLang } from '../../util/languageRouting';

const { i18n } = useTranslation();
const navigate = useNavigate();
const currentLang = i18n.resolvedLanguage ?? i18n.language;
const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
navigate(buildLangPath('/path', lang));
```

### After (각 컴포넌트)
```typescript
import { useLangNavigate } from '../../hooks/useLangNavigate';

const navigate = useLangNavigate();
navigate('/path');
```

### axios interceptor Before
```typescript
const currentLang = i18n.resolvedLanguage ?? i18n.language;
const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
window.location.href = buildLangPath('/home', lang);
```

### axios interceptor After
```typescript
import { navigateWithLang } from '../util/languageRouting';
navigateWithLang('/home');
```

---

## 검증 방법

1. **타입 체크**: `npm run type-check` 또는 `tsc --noEmit`
2. **빌드 테스트**: `npm run build`
3. **수동 테스트**:
   - 한국어 모드에서 페이지 이동 확인 (URL에 `/ko` 없음)
   - 영어 모드에서 페이지 이동 확인 (URL에 `/en` 있음)
   - 401 에러 시 홈으로 리다이렉트 확인
