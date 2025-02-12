import DebatePanel from '../DebatePanel/DebatePanel';
import TimerCreationButton from '../TimerCreationButton/TimerCreationButton';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import { useModal } from '../../../../hooks/useModal';
import { DebateInfo } from '../../../../type/type';
import { useDragAndDrop } from '../../../../hooks/useDragAndDrop';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../../../components/ProsAndConsTitle/PropsAndConsTitle';
import { TableFormData } from '../../hook/useTableFrom';
import { IoMdHome } from 'react-icons/io';
import useLogout from '../../../../hooks/mutations/useLogout';
import { useNavigate } from 'react-router-dom';

interface TimeBoxStepProps {
  initData: TableFormData;
  onTimeBoxChange: React.Dispatch<React.SetStateAction<DebateInfo[]>>;
  onButtonClick: () => void;
  isEdit?: boolean;
}
export default function TimeBoxStep(props: TimeBoxStepProps) {
  const { initData, onTimeBoxChange, onButtonClick, isEdit = false } = props;
  const { mutate: logoutMutate } = useLogout(() => navigate('/login'));

  const navigate = useNavigate();
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
          <div className="flex flex-wrap items-center text-2xl font-bold md:text-3xl">
            <h1 className="mr-2">
              {initData === undefined || initData!.info.name.trim() === ''
                ? '테이블 이름 없음'
                : initData!.info.name}
            </h1>
            <div className="mx-3 h-6 w-[2px] bg-black"></div>
            <span className="text-lg font-normal md:text-xl">의회식</span>
          </div>
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <div className="flex flex-col items-center">
            <h1 className="text-m md:text-lg">토론 주제</h1>
            <h1 className="max-w-md truncate text-xl font-bold md:text-2xl">
              {initData === undefined || initData.info.agenda.trim() === ''
                ? '주제 없음'
                : initData.info.agenda}
            </h1>
          </div>
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right>
          <button
            onClick={() => {
              navigate('/');
            }}
            className="rounded-full bg-slate-300 px-2 py-1 font-bold text-zinc-900 hover:bg-zinc-400"
          >
            <div className="flex flex-row items-center space-x-4">
              <IoMdHome size={24} />
              <h1>홈 화면</h1>
            </div>
          </button>
          <button
            onClick={() => logoutMutate()}
            className="rounded-full bg-slate-300 px-2 py-1 font-bold text-zinc-900 hover:bg-zinc-400"
          >
            <div className="flex flex-row items-center space-x-4">
              <h2>로그아웃</h2>
            </div>
          </button>
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
