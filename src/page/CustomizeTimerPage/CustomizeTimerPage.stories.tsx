import { Meta, StoryObj } from '@storybook/react';
import CustomizeTimerPage from './CustomizeTimerPage';

const meta: Meta<typeof CustomizeTimerPage> = {
  title: 'page/CustomizeTimerPage',
  component: CustomizeTimerPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Storybook에서 전체 화면으로 표시
  },
};

export default meta;

type Story = StoryObj<typeof CustomizeTimerPage>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <CustomizeTimerPage />
    </div>
  ),
};
