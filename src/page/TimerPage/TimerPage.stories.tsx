import { Meta, StoryObj } from '@storybook/react';
import TimerPage from './TimerPage';
import { GlobalPortal } from '../../util/GlobalPortal';

const meta: Meta<typeof TimerPage> = {
  title: 'page/TimerPage',
  component: TimerPage,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <GlobalPortal.Provider>
        <Story />
      </GlobalPortal.Provider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TimerPage>;

export const Default: Story = {};
