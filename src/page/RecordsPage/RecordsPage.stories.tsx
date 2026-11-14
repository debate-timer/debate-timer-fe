import { Meta, StoryObj } from '@storybook/react-vite';
import RecordsPage from './RecordsPage';

const META: Meta<typeof RecordsPage> = {
  title: 'page/RecordsPage',
  component: RecordsPage,
  parameters: { layout: 'fullscreen', route: '/records' },
  tags: ['autodocs'],
};
export default META;
type Story = StoryObj<typeof META>;
export const Default: Story = {};
