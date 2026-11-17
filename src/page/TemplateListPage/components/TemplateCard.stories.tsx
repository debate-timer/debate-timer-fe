import { Meta, StoryObj } from '@storybook/react-vite';
import TemplateCard from './TemplateCard';
import { encodeDebateTableData } from '../../../util/arrayEncoding';

const SAMPLE_DATA = encodeDebateTableData({
  info: { name: '예시 시간표', agenda: '', prosTeamName: '', consTeamName: '' },
  table: [
    {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 180,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: null,
      bell: null,
    },
    {
      stance: 'NEUTRAL',
      speechType: '자유토론',
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 600,
      timePerSpeaking: 60,
      speaker: null,
      bell: null,
    },
  ],
});

const meta: Meta<typeof TemplateCard> = {
  title: 'page/TemplateListPage/components/TemplateCard',
  component: TemplateCard,
  tags: ['autodocs'],
  args: {
    className: 'max-w-sm',
    organization: {
      organization: '한토막',
      category: 'DEBATE_CLUB',
      affiliation: '한양대학교',
      iconPath: '',
      templates: [
        { name: 'CEDA 토론', data: SAMPLE_DATA },
        { name: '자유토론형 시간표', data: SAMPLE_DATA },
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof TemplateCard>;

export const Default: Story = {};

export const LongContent: Story = {
  args: {
    organization: {
      organization: '전국 대학생 연합 토론 동아리 협의회',
      category: 'TOURNAMENT',
      affiliation: '수도권 및 지방 거점 대학교 연합 소속',
      iconPath: '',
      templates: [
        {
          name: '2026 전국 대학생 의회식 자유토론 결승전 공식 시간표',
          data: SAMPLE_DATA,
        },
        {
          name: '준결승 교차질의 포함 확장형 시간표',
          data: SAMPLE_DATA,
        },
      ],
    },
  },
};
