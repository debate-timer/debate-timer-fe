import { Meta, StoryObj } from '@storybook/react-vite';
import DebateFeatureIndicators from './DebateFeatureIndicators';

const META: Meta<typeof DebateFeatureIndicators> = {
  title: 'Timer/DebateFeatureIndicators',
  component: DebateFeatureIndicators,
  args: {
    statuses: { share: 'inactive', transcript: 'active', answer: 'error' },
    hasTranscriptFlag: true,
  },
};
export default META;
type Story = StoryObj<typeof DebateFeatureIndicators>;

export const MixedStates: Story = {};
export const Inactive: Story = {
  args: {
    statuses: { share: 'inactive', transcript: 'inactive', answer: 'inactive' },
  },
};
export const WithoutTranscriptFlag: Story = {
  args: {
    hasTranscriptFlag: false,
  },
};
