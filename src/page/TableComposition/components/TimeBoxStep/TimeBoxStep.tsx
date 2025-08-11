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
import { useLayoutEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const addButtonClasses = isButtonFixed ? 'sticky bottom-[16px]' : 'relative';

  const { handleMouseDown, getDraggingStyles, DragAndDropWrapper } =
    useDragAndDrop({
      data: initTimeBox,
      setData: onTimeBoxChange,
      throttleDelay: 50,
    });

  const handleSubmitEdit = (indexToEdit: number, updatedInfo: TimeBoxInfo) => {
    onTimeBoxChange((prevData) =>
      prevData.map((item, index) =>
        index === indexToEdit ? updatedInfo : item,
      ),
    );
  };

  const handleSubmitDelete = (indexToRemove: number) => {
    onTimeBoxChange((prevData) =>
      prevData.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleCopy = (indexToCopy: number) => {
    onTimeBoxChange((prevData) => {
      const toCopy = prevData[indexToCopy];
      if (!toCopy) return prevData;
      const copyItem = { ...toCopy };
      return [...prevData, copyItem];
    });
  };

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

  // 스크롤 바가 생기면, 타임박스 추가 버튼을 화면 중앙 하단에 고정
  useLayoutEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const hasScrollbar =
        entry.target.scrollHeight > entry.target.clientHeight;
      setIsButtonFixed(hasScrollbar);
    });

    observer.observe(containerElement);

    return () => observer.disconnect();
  }, []);

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
          <div
            ref={containerRef}
            className="relative mx-auto flex h-full w-full max-w-4xl flex-col justify-start"
          >
            <PropsAndConsTitle
              prosTeamName={initData.info.prosTeamName}
              consTeamName={initData.info.consTeamName}
            />

            <DragAndDropWrapper>
              {initTimeBox.length > 0 &&
                initTimeBox.map((info, index) => (
                  <div
                    key={crypto.randomUUID()}
                    style={getDraggingStyles(index)}
                  >
                    {renderTimeBoxItem(info, index)}
                  </div>
                ))}

              {/* 타임박스 추가 버튼이 화면 중앙 하단에 고정될 때, 
            타임박스가 가려지지 않게 타임박스 추가 버튼 높이만큼의 여백을 추가 */}
              {isButtonFixed && <span className="h-[32px]"></span>}
            </DragAndDropWrapper>

            <div
              className={`
              pointer-events-none flex w-full items-center justify-center
              ${addButtonClasses}
            `}
            >
              <FloatingActionButton
                onClick={openModal}
                className="pointer-events-auto my-[16px] bg-default-disabled/hover hover:bg-default-neutral"
              >
                <div className="text-body flex h-[56px] flex-row items-center justify-center gap-[12px] p-[16px]">
                  <DTAdd className="h-full p-[4px]" />
                  타이머 추가
                </div>
              </FloatingActionButton>
            </div>
          </div>
        )}
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div className="relative mx-auto mb-8 mt-2 flex w-full max-w-4xl items-center justify-between gap-2">
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
                'button disabled': !isSubmitButtonDisabled,
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
          onSubmit={(data) => {
            onTimeBoxChange((prev) => [...prev, data]);
          }}
          onClose={closeModal}
        />
      </ModalWrapper>
    </DefaultLayout>
  );
}
