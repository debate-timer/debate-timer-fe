import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GeneralHeader from './GeneralHeader';
import TimerHeader from './TimerHeader';
import TimerHeaderTools from './TimerHeaderTools';
import AudienceHeaderContainer from './AudienceHeaderContainer';
import GeneralHeaderContainer from './GeneralHeaderContainer';

const META: Meta<typeof GeneralHeader> = {
  title: 'Layout/RoleHeaders',
  component: GeneralHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { isMember: false, canViewRecords: false, onRequireLogin: fn() },
};
export default META;
type Story = StoryObj<typeof META>;

export const General: Story = { render: () => <GeneralHeaderContainer /> };
export const MemberWithoutRecords: Story = {
  args: { isMember: true, canViewRecords: false },
};
export const Timer: Story = {
  render: () => (
    <TimerHeader
      name="정기 토론"
      agenda="생성형 AI의 교육 활용을 허용해야 한다"
      actions={<TimerHeaderTools />}
    />
  ),
};
export const Audience: Story = {
  render: () => (
    <AudienceHeaderContainer
      name="공개 토론"
      agenda="모두가 함께 보는 토론 주제"
    />
  ),
};
export const LongInfo: Story = {
  render: () => (
    <TimerHeader
      name={'아주 긴 시간표 이름 '.repeat(12)}
      agenda={'줄임 없이 전체 내용을 확인할 수 있는 긴 토론 주제입니다. '.repeat(
        12,
      )}
      actions={<TimerHeaderTools />}
    />
  ),
};
export const MissingInfo: Story = { render: () => <AudienceHeaderContainer /> };
export const Mobile: Story = {
  ...General,
  parameters: {
    viewport: {
      options: {
        mobile375: {
          name: 'Mobile 375',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
      },
    },
  },
  globals: { viewport: { value: 'mobile375', isRotated: false } },
};
