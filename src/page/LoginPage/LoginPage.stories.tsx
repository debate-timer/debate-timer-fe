import { Meta, StoryObj } from '@storybook/react';
import LoginPage from './LoginPage';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof LoginPage> = {
  title: 'page/LoginPage',
  component: LoginPage,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};
