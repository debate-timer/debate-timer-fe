import TimeBox from '../TimeBox/TimeBox';
import { useModal } from '../../../../hooks/useModal';
import { useDragAndDrop } from '../../../../hooks/useDragAndDrop';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../../../components/ProsAndConsTitle/PropsAndConsTitle';
import HeaderTableInfo from '../../../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../../../components/HeaderTitle/HeaderTitle';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import { DebateTableData, TimeBoxInfo } from '../../../../type/type';
import DTEdit from '../../../../components/icons/Edit';
import DTCheck from '../../../../components/icons/Check';
import FloatingActionButton from '../../../../components/FloatingActionButton/FloatingActionButton';
import DTAdd from '../../../../components/icons/Add';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import LoadingIndicator from '../../../../components/LoadingIndicator/LoadingIndicator';

interface TimeBoxStepProps {
  initData: DebateTableData;
  isLoading: boolean;
  onTimeBoxChange: React.Dispatch<React.SetStateAction<TimeBoxInfo[]>>;
  onFinishButtonClick: () => void;
  onEditTableInfoButtonClick: () => void;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

export default function TimeBoxStep(props: TimeBoxStepProps) {
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const {
    initData,
    isLoading,
    onTimeBoxChange,
    onFinishButtonClick,
    onEditTableInfoButtonClick,
    isEdit = false,
    isSubmitting = false,
  } = props;
  const initTimeBox = initData.table;

  const [isButtonFixed, setIsButtonFixed] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const [buttonHeight, setButtonHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const { handleMouseDown, getDraggingStyles, DragAndDropWrapper } =
    useDragAndDrop({
      data: initTimeBox,
      setData: onTimeBoxChange,
      throttleDelay: 50,
    });

  const handleSubmitEdit = useCallback(
    (indexToEdit: number, updatedInfo: TimeBoxInfo) => {
      onTimeBoxChange((prevData) =>
        prevData.map((item, index) =>
          index === indexToEdit ? updatedInfo : item,
        ),
      );
    },
    [onTimeBoxChange],
  );

  const handleSubmitDelete = useCallback(
    (indexToRemove: number) => {
      onTimeBoxChange((prevData) =>
        prevData.filter((_, index) => index !== indexToRemove),
      );
    },
    [onTimeBoxChange],
  );

  const handleCopy = useCallback(
    (indexToCopy: number) => {
      onTimeBoxChange((prevData) => {
        const toCopy = prevData[indexToCopy];
        if (!toCopy) return prevData;
        const copyItem = { ...toCopy };
        return [...prevData, copyItem];
      });
    },
    [onTimeBoxChange],
  );

  const handleAddTimeBox = useCallback(
    (data: TimeBoxInfo) => {
      onTimeBoxChange((prev) => [...prev, data]);
      closeModal();
    },
    [onTimeBoxChange, closeModal],
  );

  const isSubmitButtonDisabled =
    initTimeBox.length === 0 || isLoading || isSubmitting;

  const renderTimeBoxItem = (info: TimeBoxInfo, index: number) => {
    return (
      <TimeBox
        key={index}
        info={info as TimeBoxInfo}
        prosTeamName={initData.info.prosTeamName}
        consTeamName={initData.info.consTeamName}
        eventHandlers={{
          onSubmitEdit: (updatedInfo: TimeBoxInfo) =>
            handleSubmitEdit(index, updatedInfo),
          onSubmitDelete: () => handleSubmitDelete(index),
          onSubmitCopy: () => handleCopy(index),
          onMouseDown: () => handleMouseDown(index),
        }}
      />
    );
  };

  // 레이아웃 변화 감지 및 버튼의 위치 계산
  useLayoutEffect(() => {
    if (isLoading) {
      return;
    }

    const containerElement = containerRef.current;
    const footerElement = footerRef.current;
    const buttonElement = buttonRef.current;

    if (!containerElement || !footerElement || !buttonElement) {
      return;
    }

    const calculatePosition = () => {
      // 1. Footer 높이 측정
      const newFooterHeight = footerElement.getBoundingClientRect().height;
      if (footerHeight !== newFooterHeight) {
        setFooterHeight(newFooterHeight);
      }

      // 2. 버튼의 실제 높이(offsetHeight) 측정 및 state 업데이트
      const newButtonHeight = buttonElement.offsetHeight;
      if (buttonHeight !== newButtonHeight) {
        setButtonHeight(newButtonHeight);
      }

      // 3. 스크롤 바 유무 판단
      const hasScrollBar =
        containerElement.scrollHeight > containerElement.clientHeight;

      // 4. 현재 상태와 다를 경우에만 상태 업데이트
      if (isButtonFixed !== hasScrollBar) {
        setIsButtonFixed(hasScrollBar);
      }
    };

    calculatePosition();

    const resizeObserver = new ResizeObserver(calculatePosition);
    resizeObserver.observe(containerElement);
    resizeObserver.observe(footerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    isLoading,
    initTimeBox.length,
    isButtonFixed,
    buttonHeight,
    footerHeight,
  ]);

  // 윈도우 리사이즈 감지
  useLayoutEffect(() => {
    const handleResize = () => {
      const containerElement = containerRef.current;
      if (!containerElement) {
        return;
      }

      const hasScrollBar =
        containerElement.scrollHeight > containerElement.clientHeight;
      if (isButtonFixed !== hasScrollBar) {
        setIsButtonFixed(hasScrollBar);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isButtonFixed]);

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          {!isLoading && <HeaderTableInfo name={initData.info.name} />}
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          {!isLoading && <HeaderTitle title={initData.info.agenda} />}
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        {isLoading && <LoadingIndicator />}
        {!isLoading && (
          <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col justify-start">
            <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto">
              <PropsAndConsTitle
                prosTeamName={initData.info.prosTeamName}
                consTeamName={initData.info.consTeamName}
              />

              <DragAndDropWrapper>
                {initTimeBox.length > 0 &&
                  initTimeBox.map((info, index) => (
                    <div
                      key={info.stance + info.speechType}
                      style={getDraggingStyles(index)}
                    >
                      {renderTimeBoxItem(info, index)}
                    </div>
                  ))}

                {/* 버튼이 고정될 때에만 하단 여백 추가 */}
                {isButtonFixed && (
                  <span style={{ height: `${buttonHeight}px` }}></span>
                )}
              </DragAndDropWrapper>
            </div>

            <div
              ref={buttonRef}
              className={clsx('flex items-center justify-center', {
                'fixed left-1/2 -translate-x-1/2': isButtonFixed,
                relative: !isButtonFixed,
              })}
              style={
                isButtonFixed
                  ? {
                      bottom: `${footerHeight + 32}px`,
                    }
                  : {}
              }
            >
              <FloatingActionButton
                onClick={openModal}
                className="pointer-events-auto my-[16px] bg-default-disabled/hover hover:bg-default-neutral"
              >
                <div className="flex h-[56px] w-fit flex-row items-center justify-center space-x-[12px] p-[16px]">
                  <DTAdd className="h-full p-[4px]" />
                  <p className="text-body whitespace-nowrap">타이머 추가</p>
                </div>
              </FloatingActionButton>
            </div>
          </div>
        )}
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div
          ref={footerRef}
          className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between gap-2"
        >
          <button
            onClick={onEditTableInfoButtonClick}
            className={clsx(
              'flex h-full w-full gap-[12px] rounded-full p-[24px]',
              {
                'button disabled': isLoading,
                'button enabled neutral': !isLoading,
              },
            )}
            disabled={isLoading}
          >
            <DTEdit className="h-full" />
            토론 정보 수정하기
          </button>

          <button
            onClick={onFinishButtonClick}
            className={clsx(
              'flex h-full w-full gap-[12px] rounded-full p-[24px]',
              {
                'button enabled brand': !isSubmitButtonDisabled,
                'button disabled': isSubmitButtonDisabled,
              },
            )}
            disabled={isSubmitButtonDisabled}
          >
            <DTCheck className="h-full" />
            {isEdit ? '수정 완료' : '추가하기'}
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>

      <ModalWrapper>
        <TimerCreationContent
          beforeData={initTimeBox[initTimeBox.length - 1] as TimeBoxInfo}
          prosTeamName={initData.info.prosTeamName}
          consTeamName={initData.info.consTeamName}
          onSubmit={handleAddTimeBox}
          onClose={closeModal}
        />
      </ModalWrapper>
    </DefaultLayout>
  );
}
