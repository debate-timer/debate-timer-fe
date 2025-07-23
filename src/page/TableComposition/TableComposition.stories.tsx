import { Meta, StoryObj } from '@storybook/react';
import TableComposition from './TableComposition';

const meta: Meta<typeof TableComposition> = {
  title: 'page/TableComposition',
  component: TableComposition,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // 세션 초기화
      window.sessionStorage.removeItem('creationInfo');
      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof TableComposition>;

export const Default: Story = {};
