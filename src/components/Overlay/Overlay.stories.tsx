import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import Overlay from './Overlay';
import Button from '../Button/Button';

const META: Meta<typeof Overlay> = {
  title: 'Components/Overlay',
  component: Overlay,
  tags: ['autodocs'],
  args: { direction: 'none', className: 'w-64', children: '오버레이 내용' },
  render: function Example(args) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="flex min-h-64 flex-col items-center gap-2 p-6">
        <Button
          aria-label="오버레이 열기 또는 닫기"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          열기 / 닫기
        </Button>
        <Overlay {...args} isOpen={isOpen} />
      </div>
    );
  },
};
export default META;
type Story = StoryObj<typeof Overlay>;

export const None: Story = {};
export const Down: Story = { args: { direction: 'down' } };
export const Up: Story = { args: { direction: 'up' } };
export const Left: Story = { args: { direction: 'left' } };
export const Right: Story = { args: { direction: 'right' } };
export const LongContent: Story = {
  args: {
    children:
      '긴 한국어 안내와 longer English descriptions도 너비 안에서 자연스럽게 줄바꿈하여 표시합니다.',
  },
};
