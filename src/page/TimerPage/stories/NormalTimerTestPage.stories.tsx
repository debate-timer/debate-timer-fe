import TimerHeader from '../../../layout/components/header/TimerHeader';
import TimerHeaderTools from '../../../layout/components/header/TimerHeaderTools';
// NormalTimerTestPage.stories.tsx
import { Meta, StoryObj } from '@storybook/react-vite';
import { TimeBoxInfo } from '../../../types/type';
import DefaultLayout from '../../../layout/defaultLayout/DefaultLayout';
import NormalTimer from '../components/NormalTimer';
import RoundControlButton from '../../../components/RoundControlButton/RoundControlButton';
const item: TimeBoxInfo = {
  boxType: 'NORMAL',
  speechType: '입론',
  stance: 'PROS',
  speaker: '케이티',
  time: 120,
  timePerTeam: null,
  timePerSpeaking: null,
  bell: null,
};

function NormalTimerTestPage() {
  return (
    <DefaultLayout
      header={
        <TimerHeader
          name="테스트 시간표"
          agenda="일반타이머 테스트입니다"
          actions={<TimerHeaderTools />}
        />
      }
    >
      {/* Header */}

      {/* Content */}
      <DefaultLayout.ContentContainer noPadding>
        <div className="flex flex-1 flex-col items-center justify-center space-y-[25px] bg-neutral-100 xl:space-y-[40px]">
          <NormalTimer
            normalTimerInstance={{
              timer: 150,
              isRunning: false,
              isAdditionalTimerOn: false,
              setTimer: () => {},
              startTimer: () => {},
              pauseTimer: () => {},
              resetTimer: () => {},
              handleChangeAdditionalTimer: () => {},
              handleCloseAdditionalTimer: () => {},
            }}
            item={item}
            teamName="찬성"
            isAdditionalTimerAvailable={false}
            answerTimer={null}
          />

          {/* NEXT 버튼만 하단에 표시 */}
          <div className="flex flex-row space-x-1 xl:space-x-8">
            <div className="flex h-[70px] w-[175px] items-center justify-center lg:w-[200px]">
              <RoundControlButton type="PREV" onClick={() => alert('이전')} />
            </div>
            <div className="flex h-[70px] w-[175px] items-center justify-center lg:w-[200px]">
              <RoundControlButton type="NEXT" onClick={() => alert('다음')} />
            </div>
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
const meta: Meta<typeof NormalTimerTestPage> = {
  title: 'page/TimerPage/NormalTimerTestPage',
  component: NormalTimerTestPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof NormalTimerTestPage>;

export const Default: Story = {
  render: () => <NormalTimerTestPage />,
};
