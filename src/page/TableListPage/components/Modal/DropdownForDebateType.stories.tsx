import { Meta, StoryObj } from '@storybook/react';
import DropdownForDebateType from './DropdownForDebateType';
import { GlobalPortal } from '../../../../util/GlobalPortal';

const meta: Meta<typeof DropdownForDebateType> = {
  title: 'page/TableListPage/Components/DropdownForDebateType',
  component: DropdownForDebateType,
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

type Story = StoryObj<typeof DropdownForDebateType>;

export const Default: Story = {};
