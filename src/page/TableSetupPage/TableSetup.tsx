import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { useModal } from '../../hooks/useModal';
import DebatePanel from './components/DebatePanel/DebatePanel';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import TimerCreationButton from './components/TimerCreationButton/TimerCreationButton';
import TimerCreationContent from './components/TimerCreationContent/TimerCreationContent';
import { DebateInfo } from '../../type/type';
import { useNavigate } from 'react-router-dom';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useState } from 'react';

export default function TableSetup() {
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
  const [data, setData] = useState<DebateInfo[]>([]);

  const { handleMouseDown, getDraggingStyles, DragAndDropWrapper } =
    useDragAndDrop({
      data,
      setData,
      throttleDelay: 50,
    });

  const navigate = useNavigate();

  const handleSubmitEdit = (indexToEdit: number, updatedInfo: DebateInfo) => {
    setData((prevData) =>
      prevData.map((item, index) =>
        index === indexToEdit ? updatedInfo : item,
      ),
    );
  };

  const handleSubmitDelete = (indexToRemove: number) => {
    setData((prevData) =>
      prevData.filter((_, index) => index !== indexToRemove),
    );
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <div className="flex flex-wrap items-center px-2 text-2xl font-bold md:text-3xl">
            <h1 className="mr-2">테이블 1</h1>
            <div className="mx-3 h-6 w-[2px] bg-black"></div>
            <span className="text-lg font-normal md:text-xl">의회식</span>
          </div>
        </DefaultLayout.Header.Left>

        <DefaultLayout.Header.Right>
          <div className="flex flex-wrap items-center gap-2 px-2 md:w-auto md:gap-3">
            <span className="text-sm md:text-base">토론 주제</span>
            <input
              type="text"
              className="w-full rounded-md bg-slate-100 p-2 text-base md:w-[30rem] md:text-2xl"
              placeholder="주제를 입력해주세요"
            />
          </div>
        </DefaultLayout.Header.Right>
      </DefaultLayout.Header>

      <DefaultLayout.ContentContanier>
        <PropsAndConsTitle />
        <DragAndDropWrapper>
          {data.map((info, index) => (
            <div key={info.time} style={getDraggingStyles(index)}>
              <DebatePanel
                key={index}
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
          className="h-20 w-screen bg-amber-300"
          onClick={() => navigate('/overview/1', { state: data })}
        >
          테이블 추가하기
        </button>
      </DefaultLayout.StickyFooterWrapper>

      <ProsModalWrapper>
        <TimerCreationContent
          selectedStance={'PROS'}
          initDate={data[data.length - 1]}
          onSubmit={(data) => {
            setData((prev) => [...prev, data]);
          }}
          onClose={ProsCloseModal}
        />
        ,
      </ProsModalWrapper>
      <ConsModalWrapper>
        <TimerCreationContent
          selectedStance={'CONS'}
          initDate={data[data.length - 1]}
          onSubmit={(data) => {
            setData((prev) => [...prev, data]);
          }}
          onClose={ConsCloseModal}
        />
        ,
      </ConsModalWrapper>
    </DefaultLayout>
  );
}
