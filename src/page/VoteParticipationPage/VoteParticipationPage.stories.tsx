// VoteCompletePage.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import VoteParticipationPage from './VoteParticipationPage';

const meta: Meta<typeof VoteParticipationPage> = {
  title: 'page/VoteParticipationPage',
  component: VoteParticipationPage,
  parameters: {
    layout: 'fullscreen',
    route: '/vote/123',
    routePattern: '/vote/:id',
  },
};

export default meta;
type Story = StoryObj<typeof VoteParticipationPage>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw' }}>
      <VoteParticipationPage />
    </div>
  ),
};
