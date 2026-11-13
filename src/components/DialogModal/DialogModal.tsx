import { PropsWithChildren } from 'react';
import Button from '../Button/Button';

interface DialogButton {
  /** 호출자가 번역한 버튼 문구이며 접근 가능한 이름으로도 사용함. */
  text: string;
  onClick: () => void;
  isBold?: boolean;
}

interface DialogModalProps extends PropsWithChildren {
  left?: DialogButton;
  right?: DialogButton;
}

const CONTAINER_CLASS =
  'flex w-full max-w-[500px] flex-col overflow-hidden rounded-[20px] bg-white text-ui-body text-neutral-900';

/**
 * 확인창의 본문과 행동 버튼을 표시하며 열림·닫힘과 모달 포커스 관리는 상위에서 담당함.
 *
 * `DialogModal`은 20px 모서리의 흰 면을 사용하며 외곽 테두리·버튼 영역 배경·구분선을 두지 않음. 떠 있는 면의 그림자는 상위 모달 컨테이너가 소유함. 하단의 여백 있는 공용 `Button`은 왼쪽 보조 행동에 `neutral`(기본 `neutral-100`, 호버 `neutral-200`), 오른쪽 주요 행동에 `primary`를 사용함. `isBold`는 Label, 그 외 문구는 Body 역할로 표시함. 버튼은 같은 너비를 공유하며 좁은 영역에서는 세로로 재배치함. 본문의 내용·여백과 제목 수준은 호출자가 소유함.
 *
 * `DialogModal`은 임의의 본문과 선택적인 `left`·`right` 버튼을 표시함. 호출자가 번역한 `text`는 버튼의 접근 가능한 이름으로도 사용하며 `onClick`을 실행함. 버튼은 폼 제출을 유발하지 않으며 단일 버튼은 너비를 채움. 창의 열림·닫힘, 오버레이, 대화상자 역할·이름, 초기 포커스·순환·복귀는 상위 모달 컨테이너가 소유함. 이미 대화상자 역할을 제공하는 컨테이너 안에 중첩 역할을 추가하지 않음.
 *
 */
export default function DialogModal(props: DialogModalProps) {
  const { children, left, right } = props;
  const hasButtons = Boolean(left || right);

  return (
    <div data-testid="container" className={CONTAINER_CLASS}>
      <div className="min-w-0 wrap-break-word">{children}</div>
      {hasButtons && (
        <div className="flex w-full flex-wrap items-stretch gap-3 p-4">
          {left && (
            <Button
              data-testid="button-left"
              variant="neutral"
              className="min-w-0 flex-1 basis-40 wrap-break-word"
              aria-label={left.text}
              onClick={left.onClick}
            >
              <span className={left.isBold ? 'text-ui-label' : 'text-ui-body'}>
                {left.text}
              </span>
            </Button>
          )}
          {right && (
            <Button
              data-testid="button-right"
              className="min-w-0 flex-1 basis-40 wrap-break-word"
              aria-label={right.text}
              onClick={right.onClick}
            >
              <span className={right.isBold ? 'text-ui-label' : 'text-ui-body'}>
                {right.text}
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
