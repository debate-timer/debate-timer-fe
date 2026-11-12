import type { Meta, StoryObj } from '@storybook/react-vite';
import SettingsModal from './SettingsModal';
const META = {
  component: SettingsModal,
  tags: ['autodocs'],
  parameters: { route: '/home' },
} satisfies Meta<typeof SettingsModal>;
export default META;
type Story = StoryObj<typeof META>;
export const Default: Story = {};
