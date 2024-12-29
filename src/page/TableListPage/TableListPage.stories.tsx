import { Meta, StoryObj } from '@storybook/react';
import TableListPage from './TableListPage';
import { MemoryRouter } from 'react-router-dom';
import { GlobalPortal } from '../../util/GlobalPortal';

const meta: Meta<typeof TableListPage> = {
  title: 'page/TableListPage',
  component: TableListPage,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <GlobalPortal.Provider>
          <Story />
        </GlobalPortal.Provider>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TableListPage>;

export const Default: Story = {};
