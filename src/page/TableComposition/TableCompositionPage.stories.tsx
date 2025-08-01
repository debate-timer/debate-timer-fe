import { Meta, StoryObj } from '@storybook/react';
import TableCompositionPage from './TableCompositionPage';

const meta: Meta<typeof TableCompositionPage> = {
  title: 'page/TableCompositon',
  component: TableCompositionPage,
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

type Story = StoryObj<typeof TableCompositionPage>;

export const Default: Story = {};
