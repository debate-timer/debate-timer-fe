import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Table from './Table';

const meta: Meta<typeof Table> = {
  title: 'page/TableListPage/Components/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Table>;

const CurrentRoute = () => {
  const location = useLocation();
  return <div>현재 경로: {location.pathname}</div>;
};

export const Default: Story = {
  args: {
    name: '테이블 1',
    type: '의회식 토론',
    duration: 30,
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/table']}>
        <Routes>
          <Route path="/table" element={<div>Table List Page</div>} />
          <Route path="/" element={<div>Table Setup Page</div>} />
        </Routes>
        <div className="flex flex-col items-center gap-4 p-4">
          <Story />
          <CurrentRoute />
        </div>
      </MemoryRouter>
    ),
  ],
};
