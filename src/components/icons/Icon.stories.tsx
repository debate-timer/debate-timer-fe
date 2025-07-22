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
    size: {
      control: 'number',
      description: '아이콘의 크기 (px)',
    },
    color: {
      control: 'color',
      description: '아이콘의 색상',
    },
    className: {
      control: 'text',
      description: 'Tailwind CSS 클래스 추가',
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DTLogin>;

export const OnLoginIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTLogin {...args} />
      <p className="mt-2 text-sm text-gray-600">로그인</p>
    </div>
  ),
};

export const OnHomeIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTHome {...args} />
      <p className="mt-2 text-sm text-gray-600">도움말</p>
    </div>
  ),
};

export const OnHelpIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTHelp {...args} />
      <p className="mt-2 text-sm text-gray-600">도움말</p>
    </div>
  ),
};

export const OnCloseIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTClose {...args} />
      <p className="mt-2 text-sm text-gray-600">닫기</p>
    </div>
  ),
};

export const OnCheckIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTCheck {...args} />
      <p className="mt-2 text-sm text-gray-600">확인</p>
    </div>
  ),
};

export const OnExpandIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTExpand {...args} />
      <p className="mt-2 text-sm text-gray-600">확장 (더보기)</p>
    </div>
  ),
};

export const OnDebateIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTDebate {...args} />
      <p className="mt-2 text-sm text-gray-600">토론</p>
    </div>
  ),
};

export const OnRightArrowIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTRightArrow {...args} />
      <p className="mt-2 text-sm text-gray-600">우측 화살표</p>
    </div>
  ),
};

export const OnLeftArrowIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTLeftArrow {...args} />
      <p className="mt-2 text-sm text-gray-600">좌측 화살표</p>
    </div>
  ),
};

export const OnDragIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTDrag {...args} />
      <p className="mt-2 text-sm text-gray-600">드래그</p>
    </div>
  ),
};

export const OnCopyIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTCopy {...args} />
      <p className="mt-2 text-sm text-gray-600">드래그</p>
    </div>
  ),
};

export const OnDeleteIcon: Story = {
  args: {
    size: 72,
    color: '#FECD4C',
  },
  render: (args) => (
    <div className="bg-neutral-white flex flex-col items-center rounded border p-4 shadow-sm">
      <DTDelete {...args} />
      <p className="mt-2 text-sm text-gray-600">드래그</p>
    </div>
  ),
};
