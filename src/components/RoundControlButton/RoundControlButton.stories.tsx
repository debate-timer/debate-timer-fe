import { Meta, StoryObj } from '@storybook/react';
import PrevNextButton from './RoundControlButton';

const meta: Meta<typeof PrevNextButton> = {
  title: 'Components/PrevNextButton',
  component: PrevNextButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PrevNextButton>;

export const OnPrev: Story = {
  args: {
    type: 'PREV',
    onClick: () => {},
  },
};

export const OnNext: Story = {
  args: {
    type: 'NEXT',
    onClick: () => {},
  },
};

export const OnDone: Story = {
  args: {
    type: 'DONE',
    onClick: () => {},
  },
};
