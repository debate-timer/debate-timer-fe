import { Meta, StoryObj } from '@storybook/react';
import DebateVoteResultPage from './DebateVoteResultPage';

const meta: Meta<typeof DebateVoteResultPage> = {
  title: 'page/DebateVoteResultPage',
  component: DebateVoteResultPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Storybook에서 전체 화면으로 표시
    route: '/table/customize/123/end/vote/result',
    routePattern: '/table/customize/:id/end/vote/result',
  },
};

export default meta;

type Story = StoryObj<typeof DebateVoteResultPage>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <DebateVoteResultPage />
    </div>
  ),
};
