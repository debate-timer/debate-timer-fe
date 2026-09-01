import { TimeBasedStance } from '../../../type/type';
import AudienceTimeBasedTimerDisplay from './AudienceTimeBasedTimerDisplay';

export interface AudienceTimeBasedTimerProps {
  prosTeamName: string;
  consTeamName: string;
  timePerTeam: number;
  timePerSpeaking: number | null;
  prosTotalRemainingTime: number;
  consTotalRemainingTime: number;
  prosCurrentSpeakingRemainingTime: number | null;
  consCurrentSpeakingRemainingTime: number | null;
  currentTeam: TimeBasedStance;
  isRunning: boolean;
}

export default function AudienceTimeBasedTimer({
  prosTeamName,
  consTeamName,
  timePerTeam,
  timePerSpeaking,
  prosTotalRemainingTime,
  consTotalRemainingTime,
  prosCurrentSpeakingRemainingTime,
  consCurrentSpeakingRemainingTime,
  currentTeam,
  isRunning,
}: AudienceTimeBasedTimerProps) {
  return (
    <div
      className="flex h-full w-full flex-row gap-8"
      data-testid="time-based-timer-row"
    >
      <AudienceTimeBasedTimerDisplay
        team="PROS"
        teamName={prosTeamName}
        timePerTeam={timePerTeam}
        timePerSpeaking={timePerSpeaking}
        totalRemainingTime={prosTotalRemainingTime}
        currentSpeakingRemainingTime={prosCurrentSpeakingRemainingTime}
        isCurrentTeam={currentTeam === 'PROS'}
        isRunning={isRunning && currentTeam === 'PROS'}
      />
      <AudienceTimeBasedTimerDisplay
        team="CONS"
        teamName={consTeamName}
        timePerTeam={timePerTeam}
        timePerSpeaking={timePerSpeaking}
        totalRemainingTime={consTotalRemainingTime}
        currentSpeakingRemainingTime={consCurrentSpeakingRemainingTime}
        isCurrentTeam={currentTeam === 'CONS'}
        isRunning={isRunning && currentTeam === 'CONS'}
      />
    </div>
  );
}
