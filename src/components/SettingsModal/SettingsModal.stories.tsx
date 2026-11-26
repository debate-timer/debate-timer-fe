import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import SettingsModal from './SettingsModal';

const META = {
  component: SettingsModal,
  tags: ['autodocs'],
  parameters: { route: '/home' },
} satisfies Meta<typeof SettingsModal>;
export default META;
type Story = StoryObj<typeof META>;

export const Default: Story = {};

export const ShortViewportScroll: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, iframeHeight: 320 } },
    viewport: {
      options: {
        shortMobile: {
          name: '375 × 320',
          styles: { width: '375px', height: '320px' },
          type: 'mobile',
        },
      },
    },
  },
  globals: { viewport: { value: 'shortMobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: '설정' }));
    await expect(await body.findByRole('dialog')).toBeInTheDocument();
  },
};
