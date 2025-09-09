import { Meta, StoryObj } from '@storybook/react';
import StickyTriSectionHeader from './StickyTriSectionHeader';
import HeaderTableInfo from '../../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../../components/HeaderTitle/HeaderTitle';

const meta: Meta<typeof StickyTriSectionHeader> = {
  title: 'Layout/StickyTriSectionHeader',
  component: StickyTriSectionHeader,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StickyTriSectionHeader>;

export const Default: Story = {
  render: () => (
    <StickyTriSectionHeader>
      <StickyTriSectionHeader.Left>
        <HeaderTableInfo name="테이블 이름" />
      </StickyTriSectionHeader.Left>

      <StickyTriSectionHeader.Center>
        <HeaderTitle title="토론 주제" />
      </StickyTriSectionHeader.Center>

      <StickyTriSectionHeader.Right></StickyTriSectionHeader.Right>
    </StickyTriSectionHeader>
  ),
};
