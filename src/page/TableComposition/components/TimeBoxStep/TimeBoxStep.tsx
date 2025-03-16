import DebatePanel from '../DebatePanel/DebatePanel';
import TimerCreationButton from '../TimerCreationButton/TimerCreationButton';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import { useModal } from '../../../../hooks/useModal';
import { TimeBoxInfo } from '../../../../type/type';
import { useDragAndDrop } from '../../../../hooks/useDragAndDrop';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../../../components/ProsAndConsTitle/PropsAndConsTitle';
import { TableFormData } from '../../hook/useTableFrom';
import HeaderTableInfo from '../../../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../../../components/HeaderTitle/HeaderTitle';

interface TimeBoxStepProps {
  initData: TableFormData;
  onTimeBoxChange: React.Dispatch<React.SetStateAction<TimeBoxInfo[]>>;
  onButtonClick: () => void;
  isEdit?: boolean;
}
export default function TimeBoxStep(props: TimeBoxStepProps) {
  const { initData, onTimeBoxChange, onButtonClick, isEdit = false } = props;
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

  const isAbledSummitButton = initTimeBox.length !== 0;

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <HeaderTableInfo name={initData.info.name} type={'PARLIAMENTARY'} />
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <HeaderTitle title={initData.info.agenda} />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <section className="mx-auto flex w-full max-w-4xl flex-col justify-center">
          <PropsAndConsTitle />
          <DragAndDropWrapper>
            {initTimeBox.map((info, index) => (
              <div key={index + info.stance} style={getDraggingStyles(index)}>
                <DebatePanel
                  key={index + info.stance}
                  info={info}
                  onSubmitEdit={(updatedInfo) =>
                    handleSubmitEdit(index, updatedInfo)
                  }
                  onSubmitDelete={() => handleSubmitDelete(index)}
                  onMouseDown={() => handleMouseDown(index)}
                />
              </div>
            ))}
          </DragAndDropWrapper>

          <TimerCreationButton onClick={openModal} />
        </section>
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div className="mx-auto mb-4 w-full max-w-4xl">
          <button
            onClick={onButtonClick}
            className={`font-semibol h-16 w-full rounded-md text-lg font-semibold transition-colors duration-300 md:text-xl ${
              isAbledSummitButton
                ? 'bg-brand-main hover:bg-amber-600'
                : 'cursor-not-allowed bg-neutral-500'
            }`}
            disabled={!isAbledSummitButton}
          >
            {isEdit ? '시간표 수정 완료' : '시간표 추가 완료'}
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>

      <ModalWrapper>
        <TimerCreationContent
          beforeData={initTimeBox[initTimeBox.length - 1]}
          onSubmit={(data) => {
            onTimeBoxChange((prev) => [...prev, data]);
          }}
          onClose={closeModal}
        />
      </ModalWrapper>
    </DefaultLayout>
  );
}
