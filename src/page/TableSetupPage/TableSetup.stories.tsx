import { Meta, StoryObj } from '@storybook/react';
import TableSetup from './TableSetup';
import { GlobalPortal } from '../../util/GlobalPortal';

const meta: Meta<typeof TableSetup> = {
  title: 'page/TableSetup',
  component: TableSetup,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <GlobalPortal.Provider>
        <Story />
      </GlobalPortal.Provider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TableSetup>;

export const Default: Story = {};
