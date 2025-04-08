import { Meta, StoryObj } from '@storybook/react';
import AdditionalTimerController from '../components/AdditionalTimerController';

const meta: Meta<typeof AdditionalTimerController> = {
  title: 'page/CustomizeTimerPage/Components/AdditionalTimerController',
  component: AdditionalTimerController,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AdditionalTimerController>;

export const Default: Story = {
  args: {
    onStart: () => {},
    onPause: () => {},
    addOnTimer: (delta: number) => {
      console.log(delta);
    },
    isRunning: false,
  },
};
