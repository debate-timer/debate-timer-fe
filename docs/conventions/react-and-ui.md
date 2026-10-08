# React와 UI 컨벤션

## 컴포넌트와 Props

주 컴포넌트는 PascalCase 함수 선언문과 default export로 작성함. Props 객체는
같은 파일의 `interface {ComponentName}Props`로 선언하고, 함수 매개변수가 아니라
본문에서 구조분해함. HTML 요소를 감싼 공용 UI는 해당 HTML attribute interface를
확장해 나머지 props를 전달함. 단순 컨테이너의 children은 `PropsWithChildren`,
명시적 계약이 필요하면 `ReactNode`를 사용함. 근거는
`src/components/ClearableInput/ClearableInput.tsx`,
`src/components/DialogModal/DialogModal.tsx`,
`src/layout/defaultLayout/DefaultLayout.tsx`에 있음.

콜백 prop은 `on*`, 컴포넌트 내부 이벤트 처리 함수는 `handle*`로 명명함. 값과
변경 콜백을 받는 입력 컴포넌트는 controlled 방식으로 작성함. 큰 레이아웃은 합성
가능한 컴포넌트로 조립함. 로딩·오류·데이터 부재·유형별 UI는 상단 분기 또는 전용
렌더 함수로 분리함.

## 훅과 효과

사용자 훅은 `use{Feature}`로 명명하고 주 훅을 default export함. 여러 화면에서
쓰는 훅은 `src/hooks/`, 화면 전용 훅은 해당 `src/page/**/hooks/`에 둠. 선택
동작이 늘어나는 훅은 기본값 `{}`인 options 객체와 내부 기본값을 사용함.
조회·구독의 조건부 실행은 `enabled`로 제어함.

DOM 이벤트와 timer를 등록한 effect는 cleanup 또는 종료 조건에서 해제함. 이전
상태에 의존하는 변경은 함수형 setter를 사용함. effect 의존성·자식 props·외부
listener에 전달할 제어 함수는 `useCallback`으로 안정화함. 재구독 없이 최신
콜백이 필요한 경우 Ref를 동기화함. `useLayoutEffect`는 DOM 측정·전체 화면처럼
paint 전에 동기화해야 하는 작업에 한정함. 근거는
`src/hooks/useDocumentVisibility.ts`, `src/hooks/useModal.tsx`,
`src/hooks/useFullscreen.ts`에 있음.

## 스타일과 접근성

Tailwind utility와 제한된 공통 CSS를 사용함. `className` 문자열이 100자를
초과하면 `UPPER_SNAKE_CASE` 상수로 분리함. `DT*` 아이콘은 해당 아이콘 컴포넌트
파일에서 직접 import함. 다른 아이콘의 export 방식은 규정하지 않음.

사용자 클릭 동작에는 `<button>`·`<a>` 같은 시맨틱 요소를 사용함. **모든 버튼에
번역된 `aria-label`을 부여함.** `title`은 보조 설명으로만 사용함.
펼침·선택·토글·검증 상태는 해당하는 `aria-expanded`, `aria-selected`,
`aria-pressed`, `aria-invalid`로 노출함. 근거는
`src/components/DropdownMenu/DropdownMenu.tsx`,
`src/layout/components/header/LanguageSelector.tsx`,
`src/components/ClearableInput/ClearableInput.tsx`에 있음.

## 사용자 문구

제품 UI, 접근성 문구, 사용자에게 보이는 오류 문구는 `useTranslation()`의 `t()`를
거침. Story의 예시 문구와 개발 로그에는 강제하지 않음. 번역 파일과 URL 언어
동기화는 [앱·라우팅·국제화](../architecture/app-routing-i18n.md)가 소유함. 기존
코드의 하드코딩 문구나 버튼 이름 누락은 새 코드의 예외가 아님.
