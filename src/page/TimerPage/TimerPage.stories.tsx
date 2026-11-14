import { Meta, StoryObj } from '@storybook/react-vite';
import TimerPage from './TimerPage';

const META: Meta<typeof TimerPage> = {
  title: 'Timer/IntegratedPage',
  component: TimerPage,
  parameters: {
    layout: 'fullscreen',
    route: '/table/customize/5',
    routePattern: '/table/customize/:id',
  },
  tags: ['autodocs'],
};
export default META;
type Story = StoryObj<typeof META>;
export const Default: Story = {};
