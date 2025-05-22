// NormalTimerTestPage.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import NormalTimerTestPage from '../components/NormalTimerTestPage';

const meta: Meta<typeof NormalTimerTestPage> = {
  title: 'page/CustomizeTimerPage/NormalTimerTestPage',
  component: NormalTimerTestPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof NormalTimerTestPage>;

export const Default: Story = {
  render: () => <NormalTimerTestPage />,
};
