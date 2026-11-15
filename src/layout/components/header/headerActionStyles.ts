/**
 * 헤더의 좁은 조작 영역에 적용하는 스타일 묶음.
 * 공용 버튼의 동작·상태 표현을 재사용하면서 높이 44px과 neutral-300 테두리를 유지함.
 * 충돌하는 utility에만 important를 적용해 CSS 생성 순서에 의존하지 않음.
 */
const HEADER_ACTION_BASE_CLASS =
  'min-h-11! border-neutral-300! focus-visible:outline-offset-2!';

export const HEADER_BUTTON_CLASS = `${HEADER_ACTION_BASE_CLASS} px-4! py-2!`;
export const HEADER_ICON_BUTTON_CLASS = `${HEADER_ACTION_BASE_CLASS} size-11! [&>svg]:size-6!`;
