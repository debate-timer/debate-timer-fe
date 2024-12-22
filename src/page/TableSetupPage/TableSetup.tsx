import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import DebatePanel from './components/DebatePanel/DebatePanel';
import PropsAndConsTitle from './components/ProsAndConsTitle/PropsAndConsTitle';
import TimerCreationButton from './components/TimerCreationButton/TimerCreationButton';

export default function TableSetup() {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>헤더</DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>의회식</DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right>제목</DefaultLayout.Header.Right>
      </DefaultLayout.Header>
      <DefaultLayout.ContentContanier>
        <PropsAndConsTitle />
        <DebatePanel
          info={{
            stance: 'PROS' as const,
            debateType: 'OPENING' as const,
            time: 150,
            speakerNumber: 3,
          }}
        />
        <DebatePanel
          info={{
            stance: 'CONS' as const,
            debateType: 'OPENING' as const,
            time: 150,
            speakerNumber: 3,
          }}
        />
        <DebatePanel
          info={{
            stance: 'NEUTRAL' as const,
            debateType: 'TIME_OUT' as const,
            time: 150,
            speakerNumber: 3,
          }}
        />
        <TimerCreationButton leftOnClick={() => {}} rightOnClick={() => {}} />
      </DefaultLayout.ContentContanier>
      <DefaultLayout.FixedFooterWrapper>
        <button className="h-20 w-screen bg-amber-300">버튼</button>
      </DefaultLayout.FixedFooterWrapper>
    </DefaultLayout>
  );
}
