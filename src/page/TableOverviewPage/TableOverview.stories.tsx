import { Meta, StoryObj } from '@storybook/react';
import TableOverview from './TableOverview';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DebateInfo } from '../../type/type';

const meta: Meta<typeof TableOverview> = {
  title: 'page/TableOverview',
  component: TableOverview,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/overview',
            state: [
              {
                stance: 'PROS',
                debateType: 'OPENING',
                time: 150,
                speakerNumber: 1,
              },
              {
                stance: 'CONS',
                debateType: 'REBUTTAL',
                time: 180,
                speakerNumber: 2,
              },
            ] as DebateInfo[],
          },
        ]}
      >
        <Routes>
          <Route path="/overview" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TableOverview>;

export const Default: Story = {};
