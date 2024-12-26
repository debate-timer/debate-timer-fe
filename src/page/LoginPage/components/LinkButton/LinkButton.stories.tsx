import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import LinkButton from './LinkButton';

const meta: Meta<typeof LinkButton> = {
  title: 'page/LoginPage/Components/LinkButton',
  component: LinkButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LinkButton>;

// 라우트 전환 결과를 표시하는 컴포넌트
const CurrentRoute = () => {
  const location = useLocation();
  return <div>현재 경로: {location.pathname}</div>;
};

export const Default: Story = {
  args: {
    url: '/table',
    title: '로그인',
  },

  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<div>Login Page</div>} />
          <Route path="/table" element={<div>Table List Page</div>} />
        </Routes>
        <Story />
        <CurrentRoute />
      </MemoryRouter>
    ),
  ],
};
