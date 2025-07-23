import { Meta, StoryObj } from '@storybook/react';
import FloatingActionButton from './FloatingActionButton';
import { IoAdd } from 'react-icons/io5';

const meta: Meta<typeof FloatingActionButton> = {
  title: 'Components/FloatingActionButton',
  component: FloatingActionButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FloatingActionButton>;

export const Enabled: Story = {
  render: () => (
    <FloatingActionButton
      onClick={() => {}}
      className="transform bg-brand duration-200 ease-in-out hover:bg-brand-hover"
    >
      <span className="text-subtitle flex flex-row items-center justify-center space-x-4 p-4 text-default-black">
        <IoAdd />
        <p>추가하기</p>
      </span>
    </FloatingActionButton>
  ),
};
