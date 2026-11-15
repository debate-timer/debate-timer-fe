import { Meta, StoryObj } from '@storybook/react-vite';
import { PiBroadcast } from 'react-icons/pi';
import Chip from './Chip';

const META: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { children: '상태 정보' },
};
export default META;
type Story = StoryObj<typeof Chip>;

export const Secondary: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Error: Story = { args: { variant: 'error' } };
export const Pill: Story = { args: { shape: 'pill' } };
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <PiBroadcast aria-hidden="true" />
        실시간 공유
      </>
    ),
  },
};
export const LongLabel: Story = {
  args: {
    children: 'Live sharing is currently unavailable. Please try again.',
  },
  decorators: [
    (Story) => (
      <div className="w-48">
        <Story />
      </div>
    ),
  ],
};
