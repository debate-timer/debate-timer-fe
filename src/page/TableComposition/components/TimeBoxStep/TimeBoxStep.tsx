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
  const {
    openModal: ProsOpenModal,
    closeModal: ProsCloseModal,
    ModalWrapper: ProsModalWrapper,
  } = useModal();
  const {
    openModal: ConsOpenModal,
    closeModal: ConsCloseModal,
    ModalWrapper: ConsModalWrapper,
  } = useModal();

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

      <DefaultLayout.ContentContanier>
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

        <TimerCreationButton
          leftOnClick={ProsOpenModal}
          rightOnClick={ConsOpenModal}
        />
      </DefaultLayout.ContentContanier>

      <DefaultLayout.StickyFooterWrapper>
        <button
          className={`h-20 w-screen text-2xl font-semibold transition duration-300 ${
            isAbledSummitButton
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'cursor-not-allowed bg-gray-400'
          }`}
          onClick={onButtonClick}
          disabled={!isAbledSummitButton}
        >
          {isEdit ? '테이블 수정하기' : '테이블 추가하기'}
        </button>
      </DefaultLayout.StickyFooterWrapper>

      <ProsModalWrapper>
        <TimerCreationContent
          selectedStance={'PROS'}
          initDate={initTimeBox[initTimeBox.length - 1]}
          onSubmit={(data) => {
            onTimeBoxChange((prev) => [...prev, data]);
          }}
          onClose={ProsCloseModal}
        />
        ,
      </ProsModalWrapper>
      <ConsModalWrapper>
        <TimerCreationContent
          selectedStance={'CONS'}
          initDate={initTimeBox[initTimeBox.length - 1]}
          onSubmit={(data) => {
            onTimeBoxChange((prev) => [...prev, data]);
          }}
          onClose={ConsCloseModal}
        />
        ,
      </ConsModalWrapper>
    </DefaultLayout>
  );
}
