import { Meta, StoryObj } from '@storybook/react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LinkButton from './LinkButton';

const meta: Meta<typeof LinkButton> = {
  title: 'page/LoginPage/Components/LinkButton',
  component: LinkButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <Routes>
          <Route path="/" element={<div>Login Page</div>} />
          <Route path="/table" element={<div>Table List Page</div>} />
        </Routes>
        <Story />
        <CurrentRoute />
      </>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LinkButton>;

const CurrentRoute = () => {
  const location = useLocation();
  return <div>현재 경로: {location.pathname}</div>;
};

export const Default: Story = {
  args: {
    url: '/table',
    title: '로그인',
  },
};
