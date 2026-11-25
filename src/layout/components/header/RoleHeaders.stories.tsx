import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GeneralHeader from './GeneralHeader';
import TimerHeader from './TimerHeader';
import TimerHeaderTools from './TimerHeaderTools';
import AudienceHeaderContainer from './AudienceHeaderContainer';
import GeneralHeaderContainer from './GeneralHeaderContainer';
import LanguageSelector from './LanguageSelector';
import HeaderLoginButton from './HeaderLoginButton';
import SettingsModal from '../../../components/SettingsModal/SettingsModal';
import { HEADER_ICON_BUTTON_CLASS } from './headerActionStyles';

const SAMPLE_INQUIRIES = [
  { label: '일반 문의', url: 'https://example.com/general' },
  { label: '템플릿 추가 요청', url: 'https://example.com/template' },
  { label: '단체/제휴 문의', url: 'https://example.com/partnership' },
];

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
export const MobileWithInquiries: Story = {
  ...Mobile,
  args: {
    isMember: true,
    canViewRecords: true,
    inquiries: SAMPLE_INQUIRIES,
    actions: (
      <>
        <LanguageSelector />
        <SettingsModal triggerClassName={HEADER_ICON_BUTTON_CLASS} />
        <HeaderLoginButton label="Google 로그인" onClick={fn()} />
      </>
    ),
  },
  render: (args) => <GeneralHeader {...args} />,
};
