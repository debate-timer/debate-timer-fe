import { Meta, StoryObj } from '@storybook/react';
import TimerPage from './TimerPage';

const meta: Meta<typeof TimerPage> = {
  title: 'page/TimerPage',
  component: TimerPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Storybook에서 전체 화면으로 표시
  },
};

export default meta;

type Story = StoryObj<typeof TimerPage>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <TimerPage />
    </div>
  ),
};
