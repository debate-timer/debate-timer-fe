import { DebateTableData } from '../type/type';

export const SAMPLE_TABLE_DATA: DebateTableData = {
  info: {
    agenda: '나의 토론 주제',
    name: '나의 시간표',
    prosTeamName: '찬성',
    consTeamName: '반대',
    finishBell: true,
    warningBell: false,
  },
  table: [
    {
      boxType: 'NORMAL',
      stance: 'PROS',
      speechType: '입론',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '1번',
    },
    {
      boxType: 'NORMAL',
      stance: 'CONS',
      speechType: '입론',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '1번',
    },
    {
      boxType: 'NORMAL',
      stance: 'PROS',
      speechType: '반론',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '2번',
    },
    {
      boxType: 'NORMAL',
      stance: 'CONS',
      speechType: '반론',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '2번',
    },
    {
      boxType: 'TIME_BASED',
      stance: 'NEUTRAL',
      speechType: '자유토론',
      time: null,
      timePerSpeaking: 120,
      timePerTeam: 420,
      speaker: '2번',
    },
    {
      boxType: 'NORMAL',
      stance: 'PROS',
      speechType: '최종 발언',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '3번',
    },
    {
      boxType: 'NORMAL',
      stance: 'CONS',
      speechType: '최종 발언',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '3번',
    },
  ],
} as const;
