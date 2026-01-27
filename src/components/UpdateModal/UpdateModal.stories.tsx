import { Meta, StoryObj } from '@storybook/react';
import UpdateModal from './UpdateModal'; // 이미지 임포트는 아래와 같이
import PatchNoteImage from '../assets/patchNote/0001.png';
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
      title: '피드백 & 투표',
      description:
        '토론 종료 후 피드백 & 투표 기능으로\n다양한 서비스를 이용하세요!',
      link: 'https://notion.so/',
      image: PatchNoteImage,
    } as PredefinedPatchNoteData,
    isChecked: false,
    onChecked: () => {},
  },
};
