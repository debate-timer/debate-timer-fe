import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { useModal } from '../../hooks/useModal';
import DebatePanel from './components/DebatePanel/DebatePanel';
import PropsAndConsTitle from './components/ProsAndConsTitle/PropsAndConsTitle';
import TimerCreationButton from './components/TimerCreationButton/TimerCreationButton';
import TimerCreationContent from './components/TimerCreationContent/TimerCreationContent';
import { useState } from 'react';
import { DebateInfo } from '../../type/type';

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
  const [data, setDate] = useState<DebateInfo[]>([]);

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
        {data.map((info) => (
          <DebatePanel key={info.time} info={info} />
        ))}

        <TimerCreationButton
          leftOnClick={ProsOpenModal}
          rightOnClick={ConsOpenModal}
        />
      </DefaultLayout.ContentContanier>
      <DefaultLayout.FixedFooterWrapper>
        <button className="h-20 w-screen bg-amber-300">버튼</button>
      </DefaultLayout.FixedFooterWrapper>
      <ProsModalWrapper>
        <TimerCreationContent
          initStance={'PROS'}
          onSubmit={(data) => {
            setDate((prev) => [...prev, data]);
          }}
          onClose={ProsCloseModal}
        />
        ,
      </ProsModalWrapper>
      <ConsModalWrapper>
        <TimerCreationContent
          initStance={'CONS'}
          onSubmit={(data) => {
            setDate((prev) => [...prev, data]);
          }}
          onClose={ConsCloseModal}
        />
        ,
      </ConsModalWrapper>
    </DefaultLayout>
  );
}
