import { Meta, StoryObj } from '@storybook/react-vite';
import LoadingSpinner from './LoadingSpinner';

const META: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  args: { size: 'size-24', color: 'text-neutral-500' },
};
export default META;
type Story = StoryObj<typeof LoadingSpinner>;
export const Default: Story = {};
export const Brand: Story = { args: { color: 'text-brand-hover' } };
export const Small: Story = { args: { size: 'size-6' } };
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      {['size-6', 'size-10', 'size-12', 'size-24', 'size-32'].map((size) => (
        <LoadingSpinner key={size} size={size} />
      ))}
    </div>
  ),
};
