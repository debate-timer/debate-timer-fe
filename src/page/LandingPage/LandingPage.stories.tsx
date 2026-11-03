import { Meta, StoryObj } from '@storybook/react-vite';
import LandingPage from './LandingPage';

const meta: Meta<typeof LandingPage> = {
  title: 'page/LandingPage',
  component: LandingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    route: '/home',
  },
};

export default meta;

type Story = StoryObj<typeof LandingPage>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      options: {
        mobile375: {
          name: 'Mobile 375',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
      },
    },
  },
  globals: { viewport: { value: 'mobile375', isRotated: false } },
};
