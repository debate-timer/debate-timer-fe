import { Meta, StoryObj } from '@storybook/react';
import LoginPage from './LoginPage'; // LoginPage 컴포넌트 경로에 맞게 변경
import { MemoryRouter } from 'react-router-dom'; // 라우터 관련 오류 해결을 위해 사용

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/LoginPage', // Storybook 내에서 나타날 위치
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
