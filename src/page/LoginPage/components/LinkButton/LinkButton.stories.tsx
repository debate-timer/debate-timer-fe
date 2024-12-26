import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom'; // MemoryRouter 추가
import LinkButton from './LinkButton';

const meta: Meta<typeof LinkButton> = {
  title: 'page/LoginPage/Components/LinkButton',
  component: LinkButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LinkButton>;

export const Default: Story = {
  args: {
    url: '/table',
    title: 'Go to Home',
  },

  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};
