import { Meta, StoryObj } from '@storybook/react';
import TimeBasedTimerTitle from '../components/TimeBasedTimerTitle';

const meta: Meta<typeof TimeBasedTimerTitle> = {
  title: 'page/TimerPage/Components/TimeBasedTimerTitle',
  component: TimeBasedTimerTitle,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeBasedTimerTitle>;

export const Default: Story = {
  args: {
    children: <h1 className="text-xl font-bold text-slate-800">주도권 토론</h1>,
    width: 300,
  },
};

export const WhenTitleIsTooLong: Story = {
  args: {
    children: (
      <h1 className="truncate text-ellipsis text-xl font-bold text-slate-800">
        매우 엄청나게 완전 길어서 React 컴포넌트가 도저히 어떤 수를 써도 감당
        불가능한 것처럼 보이는 대단하고 수려한 제목
      </h1>
    ),
    width: 300,
  },
};
