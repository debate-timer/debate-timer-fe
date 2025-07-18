import { Meta, StoryObj } from '@storybook/react';
import ShareModal from './ShareModal';
import { createTableShareUrl } from '../../util/arrayEncoding';

const meta: Meta<typeof ShareModal> = {
  title: 'components/ShareModal',
  component: ShareModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ShareModal>;

const shareUrl = createTableShareUrl('https://localhost:6006', {
  info: {
    agenda: '토론 주제',
    prosTeamName: '짜장',
    consTeamName: '짬뽕',
    finishBell: true,
    warningBell: false,
    name: '테이블 이름',
  },
  table: [
    {
      stance: 'PROS',
      boxType: 'NORMAL',
      speechType: '입론',
      speaker: '발언자',
      time: 60,
      timePerSpeaking: null,
      timePerTeam: null,
    },
    {
      stance: 'CONS',
      boxType: 'NORMAL',
      speechType: '입론',
      speaker: '발언자',
      time: 60,
      timePerSpeaking: null,
      timePerTeam: null,
    },
    {
      stance: 'NEUTRAL',
      boxType: 'TIME_BASED',
      speechType: '자유토론',
      speaker: null,
      time: null,
      timePerSpeaking: 60,
      timePerTeam: 120,
    },
  ],
});

// When QR code is ready
export const OnQRCodeReady: Story = {
  args: {
    shareUrl: shareUrl,
    copyState: false,
    isLoading: false,
    isError: false,
    onRefetch: () => {},
    onCopyClicked: () => {
      navigator.clipboard.writeText(shareUrl);
    },
  },
};

// When QR code is not ready
export const OnLoadingData: Story = {
  args: {
    shareUrl: '',
    copyState: false,
    isLoading: true,
    isError: false,
    onRefetch: () => {},
    onCopyClicked: () => {},
  },
};

// When failed to process share URL
export const OnFailure: Story = {
  args: {
    shareUrl: '',
    copyState: false,
    isLoading: false,
    isError: true,
    onRefetch: () => {},
    onCopyClicked: () => {},
  },
};
