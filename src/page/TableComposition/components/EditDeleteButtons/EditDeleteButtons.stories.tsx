import { Meta, StoryObj } from '@storybook/react';
import EditDeleteButtons from './EditDeleteButtons';
import { ParliamentaryTimeBoxInfo } from '../../../../type/type';

const meta: Meta<typeof EditDeleteButtons> = {
  title: 'page/TableSetup/components/EditDeleteButtons',
  component: EditDeleteButtons,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof EditDeleteButtons>;

const mockInfo: ParliamentaryTimeBoxInfo = {
  stance: 'PROS',
  type: 'OPENING',
  time: 150,
  speakerNumber: 1,
};

export const Default: Story = {
  args: {
    info: mockInfo,
    onSubmitEdit: () => {},
    onSubmitDelete: () => {},
  },
};
