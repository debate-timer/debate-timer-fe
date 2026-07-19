import { Meta, StoryObj } from '@storybook/react';
import UpdateModal from './UpdateModal';
import PatchNoteImageKorean from '../../assets/patchNote/0003_ko.png';
import PatchNoteImageEnglish from '../../assets/patchNote/0003_en.png';
import { PredefinedPatchNoteData } from '../../constants/patch_note';

const meta: Meta<typeof UpdateModal> = {
  title: 'components/UpdateModal',
  component: UpdateModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UpdateModal>;

export const Default: Story = {
  args: {
    data: {
      version: '0000',
      titleKo: '피드백 & 투표',
      titleEn: 'Feedback & Voting',
      descriptionKo:
        '토론 종료 후 피드백 & 투표 기능으로\n다양한 서비스를 이용하세요!',
      descriptionEn:
        'Use a variety of services with feedback and voting after the debate!',
      link: 'https://notion.so/',
      imageKo: PatchNoteImageKorean,
      imageEn: PatchNoteImageEnglish,
      mode: 'predefined',
    } as PredefinedPatchNoteData,
    isChecked: false,
    onChecked: () => {},
    onClose: () => {},
    onClickDetailButton: () => {},
  },
};
