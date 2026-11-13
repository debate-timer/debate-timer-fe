import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Button from './Button';
import DTEdit from '../icons/Edit';

const META: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: '시작하기', 'aria-label': '시작하기', onClick: fn() },
};
export default META;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Neutral: Story = { args: { variant: 'neutral' } };
export const Large: Story = { args: { size: 'large' } };
export const Icon: Story = {
  args: {
    shape: 'icon',
    variant: 'neutral',
    children: <DTEdit aria-hidden="true" />,
    'aria-label': '수정하기',
  },
};
export const LargeIcon: Story = { args: { ...Icon.args, size: 'large' } };
export const FooterButtons: Story = {
  render: () => (
    <div className="flex w-[min(800px,calc(100vw-32px))] gap-2">
      <Button size="large" shape="icon" variant="neutral" aria-label="수정하기">
        <DTEdit aria-hidden="true" />
      </Button>
      <Button size="large" className="min-w-0 flex-1" aria-label="토론하기">
        토론하기
      </Button>
    </div>
  ),
};
export const Dark: Story = {
  args: { variant: 'dark' },
  decorators: [
    (Story) => (
      <div className="bg-brand p-6">
        <Story />
      </div>
    ),
  ],
};
export const Light: Story = {
  args: { variant: 'light' },
  decorators: Dark.decorators,
};
export const Text: Story = { args: { variant: 'text' } };
export const Disabled: Story = { args: { disabled: true } };
export const LongLabel: Story = {
  args: {
    children: '로그인 없이 새로운 토론을 시작하기',
    'aria-label': '로그인 없이 새로운 토론을 시작하기',
  },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
};
