import type { Meta, StoryObj } from '@storybook/react';
import DTLogin from './Login';
import DTHelp from './Help';
import DTClose from './Close';
import DTHome from './Home';
import DTCheck from './Check';
import DTExpand from './Expand';
import DTDebate from './Debate';
import DTRightArrow from './RightArrow';
import DTLeftArrow from './LeftArrow';
import DTDrag from './Drag';
import DTCopy from './Copy';
import DTDelete from './Delete';

const meta: Meta<typeof DTLogin> = {
  title: 'Design System/Icons',
  component: DTLogin,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    color: {
      control: 'color',
      description: '아이콘의 색상',
    },
    className: {
      control: 'text',
      description: 'Tailwind CSS 클래스 추가 (크기도 여기에서 관리)',
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DTLogin>;

export const OnLoginIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTLogin className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">로그인</p>
    </div>
  ),
};

export const OnHomeIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTHome className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">도움말</p>
    </div>
  ),
};

export const OnHelpIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTHelp className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">도움말</p>
    </div>
  ),
};

export const OnCloseIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTClose className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">닫기</p>
    </div>
  ),
};

export const OnCheckIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTCheck className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">확인</p>
    </div>
  ),
};

export const OnExpandIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTExpand className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">확장 (더보기)</p>
    </div>
  ),
};

export const OnDebateIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTDebate className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">토론</p>
    </div>
  ),
};

export const OnRightArrowIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTRightArrow className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">우측 화살표</p>
    </div>
  ),
};

export const OnLeftArrowIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTLeftArrow className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">좌측 화살표</p>
    </div>
  ),
};

export const OnDragIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTDrag className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">드래그</p>
    </div>
  ),
};

export const OnCopyIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTCopy className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">복사</p>
    </div>
  ),
};

export const OnDeleteIcon: Story = {
  args: {
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTDelete className="size-16" {...args} />
      <p className="mt-2 text-sm text-gray-600">삭제</p>
    </div>
  ),
};
