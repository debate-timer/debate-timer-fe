import { Meta, StoryObj } from '@storybook/react';
import DebateEndPage from './DebateEndPage';

const meta: Meta<typeof DebateEndPage> = {
  title: 'page/DebateEndPage',
  component: DebateEndPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Storybook에서 전체 화면으로 표시
    route: '/table/customize/123/end/vote',
    routePattern: '/table/customize/:id/end/vote',
  },
};

export default meta;

type Story = StoryObj<typeof DebateEndPage>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <DebateEndPage />
    </div>
  ),
};
