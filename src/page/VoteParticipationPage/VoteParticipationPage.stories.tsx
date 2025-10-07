import { Meta, StoryObj } from '@storybook/react';
import VoteParticipationPage from './VoteParticipationPage';

const meta: Meta<typeof VoteParticipationPage> = {
  title: 'page/VoteParticipationPage',
  component: VoteParticipationPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Storybook에서 전체 화면으로 표시
  },
};

export default meta;

type Story = StoryObj<typeof VoteParticipationPage>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <VoteParticipationPage />
    </div>
  ),
};
