import TimeBox from '../TimeBox/TimeBox';
import TimerCreationButton from '../TimerCreationButton/TimerCreationButton';
import { useModal } from '../../../../hooks/useModal';
import { useDragAndDrop } from '../../../../hooks/useDragAndDrop';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../../../components/ProsAndConsTitle/PropsAndConsTitle';
import HeaderTableInfo from '../../../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../../../components/HeaderTitle/HeaderTitle';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import { DebateTableData, TimeBoxInfo } from '../../../../type/type';
import LoadingIndicator from '../../../../components/async/LoadingIndicator';

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
  const { openModal, closeModal, ModalWrapper } = useModal();

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

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          {isLoading && <HeaderTableInfo skeletonEnabled={true} />}
          {!isLoading && <HeaderTableInfo name={initData.info.name} />}
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          {isLoading && <HeaderTitle skeletonEnabled={true} />}
          {!isLoading && <HeaderTitle title={initData.info.agenda} />}
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        {isLoading && <LoadingIndicator />}
        {!isLoading && (
          <section className="mx-auto flex w-full max-w-4xl flex-col justify-center">
            <PropsAndConsTitle
              prosTeamName={initData.info.prosTeamName}
              consTeamName={initData.info.consTeamName}
            />

            <DragAndDropWrapper>
              {initTimeBox.map((info, index) => (
                <div key={index + info.stance} style={getDraggingStyles(index)}>
                  {renderTimeBoxItem(info, index)}
                </div>
              ))}
            </DragAndDropWrapper>

            <TimerCreationButton onClick={openModal} />
          </section>
        )}
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between gap-2">
          {/* TODO: Need to add a function here */}
          <button
            onClick={onEditTableInfoButtonClick}
            className={`
              h-16 w-full
              ${isLoading ? 'button disabled' : 'button enabled'}
            `}
            disabled={isLoading}
          >
            토론 정보 수정하기
          </button>

          <button
            onClick={onFinishButtonClick}
            className={`
              h-16 w-full
              ${isSubmitButtonDisabled ? 'button disabled' : 'button enabled'}
            `}
            disabled={isSubmitButtonDisabled}
          >
            {isEdit ? '수정 완료' : '추가하기'}
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>

      <ModalWrapper closeButtonColor="text-neutral-1000">
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
