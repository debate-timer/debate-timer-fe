import DebatePanel from '../DebatePanel/DebatePanel';
import TimerCreationButton from '../TimerCreationButton/TimerCreationButton';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import { useModal } from '../../../../hooks/useModal';
import { DebateInfo, Type } from '../../../../type/type';
import { useDragAndDrop } from '../../../../hooks/useDragAndDrop';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../../../components/ProsAndConsTitle/PropsAndConsTitle';
import { TableFormData } from '../../hook/useTableFrom';

interface TimeBoxStepProps {
  initData: TableFormData;
  onTimeBoxChange: React.Dispatch<React.SetStateAction<DebateInfo[]>>;
  onButtonClick: () => void;
  onAgendaChange: React.Dispatch<
    React.SetStateAction<{ name: string; agenda: string; type: Type }>
  >;
  isEdit?: boolean;
}
export default function TimeBoxStep(props: TimeBoxStepProps) {
  const {
    initData,
    onTimeBoxChange,
    onButtonClick,
    onAgendaChange,
    isEdit = false,
  } = props;
  const initAgenda = initData.info.agenda;
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

  const handleSubmitEdit = (indexToEdit: number, updatedInfo: DebateInfo) => {
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
          <div className="flex flex-wrap items-center px-2 text-2xl font-bold md:text-3xl">
            <h1 className="mr-2">{initData.info.name}</h1>
            <div className="mx-3 h-6 w-[2px] bg-black"></div>
            <span className="text-lg font-normal md:text-xl">의회식</span>
          </div>
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Right>
          <div className="flex flex-wrap items-center justify-end gap-2 p-2 md:gap-3">
            <span className="flex basis-full items-start whitespace-nowrap text-sm md:basis-auto md:text-base">
              토론 주제
            </span>
            <input
              type="text"
              value={initAgenda}
              className="w-full rounded-md bg-slate-100 p-2 text-base md:flex-1 md:text-2xl"
              placeholder="주제를 입력해주세요"
              onChange={(e) =>
                onAgendaChange((prev) => ({
                  ...prev,
                  agenda: e.target.value,
                }))
              }
            />
          </div>
        </DefaultLayout.Header.Right>
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
