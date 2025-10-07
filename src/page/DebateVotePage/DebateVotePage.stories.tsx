import { Meta, StoryObj } from '@storybook/react';
import DebateVotePage from './DebateVotePage';

const meta: Meta<typeof DebateVotePage> = {
  title: 'page/DebateVotePage',
  component: DebateVotePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Storybook에서 전체 화면으로 표시
  },
};

export default meta;

type Story = StoryObj<typeof DebateVotePage>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <DebateVotePage />
    </div>
  ),
};
