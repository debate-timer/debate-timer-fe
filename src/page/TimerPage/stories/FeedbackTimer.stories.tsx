import { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import FeedbackTimer from '../components/FeedbackTimer';
import { useFeedbackTimer } from '../hooks/useFeedbackTimer';

// Storybook의 arg를 받아 실제 훅을 사용하는 래퍼 컴포넌트
const FeedbackTimerWrapper = (args: { initialTime: number }) => {
  const feedbackTimerInstance = useFeedbackTimer();
  const { setTimer, setDefaultTimer } = feedbackTimerInstance;

  useEffect(() => {
    // 초기 시간 설정
    setTimer(args.initialTime);
    setDefaultTimer(args.initialTime);
  }, [args.initialTime, setTimer, setDefaultTimer]);

  return <FeedbackTimer feedbackTimerInstance={feedbackTimerInstance} />;
};

const meta: Meta<typeof FeedbackTimerWrapper> = {
  title: 'page/TimerPage/Components/FeedbackTimer',
  component: FeedbackTimerWrapper,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FeedbackTimerWrapper>;

export const Default: Story = {
  args: {
    initialTime: 0, // 초기 시간 0초
  },
};
