import { Meta, StoryObj } from '@storybook/react-vite';
import TemplateCard from './TemplateCard';

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
        { name: 'CEDA 토론', data: 'sample-data-1' },
        { name: '자유토론형 시간표', data: 'sample-data-2' },
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
          data: 'sample-long-data-1',
        },
        {
          name: '준결승 교차질의 포함 확장형 시간표',
          data: 'sample-long-data-2',
        },
      ],
    },
  },
};
