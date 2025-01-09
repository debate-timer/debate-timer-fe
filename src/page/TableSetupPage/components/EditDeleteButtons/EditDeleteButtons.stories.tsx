import { Meta, StoryObj } from '@storybook/react';
import EditDeleteButtons from './EditDeleteButtons';
import { DebateInfo } from '../../../../type/type';
import { MemoryRouter } from 'react-router-dom';
import { GlobalPortal } from '../../../../util/GlobalPortal';

const meta: Meta<typeof EditDeleteButtons> = {
  title: 'page/TableSetup/components/EditDeleteButtons',
  component: EditDeleteButtons,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <GlobalPortal.Provider>
          <div className="h-screen">
            <Story />
          </div>
        </GlobalPortal.Provider>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof EditDeleteButtons>;

const mockInfo: DebateInfo = {
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
