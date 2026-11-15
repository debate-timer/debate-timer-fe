import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import TimeBox from './TimeBox';
import SmallIconButtonContainer from '../SmallIconContainer/SmallIconContainer';
import DTEdit from '../icons/Edit';
import DTDelete from '../icons/Delete';
import DTCopy from '../icons/Copy';

const SAMPLE_ACTIONS = (
  <div className="flex items-center gap-1.5">
    <SmallIconButtonContainer
      type="button"
      aria-label="수정하기"
      className="size-[28px] p-[8px]"
    >
      <DTEdit className="h-full" />
    </SmallIconButtonContainer>
    <SmallIconButtonContainer
      type="button"
      aria-label="삭제하기"
      className="size-[28px] p-[8px]"
    >
      <DTDelete className="h-full" />
    </SmallIconButtonContainer>
    <SmallIconButtonContainer
      type="button"
      aria-label="복사하기"
      className="size-[28px] p-[8px]"
    >
      <DTCopy className="h-full" />
    </SmallIconButtonContainer>
  </div>
);

const meta: Meta<typeof TimeBox> = {
  title: 'Components/TimeBox',
  component: TimeBox,
  tags: ['autodocs'],
  args: {
    info: {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 120,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1번',
      bell: [],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimeBox>;

// 찬성 입론
export const ProsOpening: Story = {
  args: {
    info: {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 120,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1번',
      bell: [],
    },
  },
};

// 반대 반론
export const ConsRebuttal: Story = {
  args: {
    info: {
      stance: 'CONS',
      speechType: '반론',
      boxType: 'NORMAL',
      time: 120,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1번',
      bell: [],
    },
  },
};

// 중립 작전 시간
export const NeutralTimeout: Story = {
  args: {
    info: {
      stance: 'NEUTRAL',
      speechType: '작전시간',
      boxType: 'NORMAL',
      time: 120,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1번',
      bell: [],
    },
  },
};

// 자유토론
export const NeutralCustom: Story = {
  args: {
    info: {
      stance: 'NEUTRAL',
      speechType: '자유토론',
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 120,
      timePerSpeaking: 60,
      speaker: null,
      bell: [],
    },
  },
};

// 수정 가능 상태
export const Editable: Story = {
  args: {
    actions: SAMPLE_ACTIONS,
    onDragPointerDown: fn(),
  },
};

// 긴 발언 유형·화자 문구
export const LongText: Story = {
  args: {
    info: {
      stance: 'CONS',
      speechType: '매우 긴 교차조사 및 반론 발언 유형',
      boxType: 'NORMAL',
      time: 300,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '세 번째 토론자',
      bell: [],
    },
    actions: SAMPLE_ACTIONS,
    onDragPointerDown: fn(),
  },
};

// 모바일 375px 고정 화면
export const Mobile375: Story = {
  ...Editable,
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
