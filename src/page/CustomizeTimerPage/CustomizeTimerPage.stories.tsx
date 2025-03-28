import { Meta, StoryObj } from '@storybook/react';
import FreediscussionTimerPage from './CustomizeTimerPage';

const meta: Meta<typeof FreediscussionTimerPage> = {
  title: 'page/CustomizeTimerPage',
  component: FreediscussionTimerPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Storybook에서 전체 화면으로 표시
  },
};

export default meta;

type Story = StoryObj<typeof FreediscussionTimerPage>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <FreediscussionTimerPage />
    </div>
  ),
};
