import { Meta, StoryObj } from '@storybook/react';
import LoggedInStoreDBModal from '../components/LoggedInStoreDBModal';

const meta: Meta<typeof LoggedInStoreDBModal> = {
  title: 'page/TableSharingPage/Components/LoggedInStoreDBModal',
  component: LoggedInStoreDBModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoggedInStoreDBModal>;

export const Default: Story = {
  args: {
    onContinue: () => {},
    onSave: () => {},
  },
};
