import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import {
  GetTranscriptResponseType,
  GetTranscriptsResponseType,
} from '../../apis/responses/transcript';

const mockTranscript: GetTranscriptResponseType = {
  id: 1,
  tableId: 1,
  tableName: '정기토론',
  agenda: '노동시장 유연화를 확대해야 한다',
  prosTeamName: '찬성',
  consTeamName: '반대',
  status: 'DONE',
  sttMode: 'RPC',
  refining: false,
  lines: [
    {
      index: 0,
      timeBoxIndex: 0,
      speechType: '입론',
      stance: 'PROS',
      speaker: '김서연',
      offsetMs: 4000,
      text: '정규직에 대한 과도한 보호가 청년의 노동시장 진입을 막고 있습니다.',
    },
    {
      index: 1,
      timeBoxIndex: 1,
      speechType: '입론',
      stance: 'CONS',
      speaker: '박지호',
      offsetMs: 125000,
      text: '채용은 해고 비용보다 경기와 수요가 결정합니다.',
    },
  ],
  report: {
    prosArguments: [
      {
        claim: '정규직 과보호가 청년 채용을 막는다',
        evidences: [
          {
            type: 'VAGUE',
            content: '출처 없이 기업 설문을 인용',
            lineIndex: 0,
          },
        ],
      },
    ],
    consArguments: [
      {
        claim: '채용은 경기와 수요가 결정한다',
        evidences: [
          {
            type: 'LOGICAL',
            content: '경기 침체기 해고 가속 논리',
            lineIndex: 1,
          },
        ],
      },
    ],
    clashes: [
      {
        title: '해고 요건 완화가 청년 채용을 늘리는가',
        prosPosition: '해고 부담이 채용을 막는다',
        consPosition: '채용은 경기가 결정한다',
        advantage: 'CONS',
        reason: '찬성의 인과 근거가 출처 없이 제시됨',
        lineIndices: [0, 1],
      },
    ],
    keyMoments: [
      {
        lineIndex: 1,
        label: '흐름 전환',
        reason: '인과 근거 부재를 정면으로 지적함',
      },
    ],
    teamFeedback: {
      pros: {
        strengths: ['문제 제기가 명확함'],
        weaknesses: ['근거 출처 부족'],
      },
      cons: {
        strengths: ['핵심 약점을 일관되게 공략'],
        weaknesses: ['대안이 구체적이지 않음'],
      },
    },
  },
  errorMessage: null,
};

const mockTranscripts: GetTranscriptsResponseType = {
  transcripts: [
    {
      id: 2,
      tableId: 1,
      tableName: '정기토론',
      agenda: '대학 수업 과제에서 생성형 AI 사용을 허용해야 한다',
      sttMode: 'SONIOX',
      status: 'PROCESSING',
      refining: true,
      createdAt: '2026-10-23T01:39:15',
    },
    {
      id: 1,
      tableId: 1,
      tableName: '정기토론',
      agenda: '노동시장 유연화를 확대해야 한다',
      sttMode: 'RPC',
      status: 'DONE',
      refining: false,
      createdAt: '2026-10-22T20:10:00',
    },
  ],
};

export const transcriptHandlers = [
  // GET /api/transcripts
  http.get(ApiUrl.transcript, () => {
    return HttpResponse.json(mockTranscripts);
  }),

  // POST /api/transcripts/{tableId}
  http.post(ApiUrl.transcript + '/:tableId', () => {
    return HttpResponse.json({ id: 1 }, { status: 201 });
  }),

  // GET /api/transcripts/{transcriptId}
  http.get(ApiUrl.transcript + '/:transcriptId', ({ params }) => {
    return HttpResponse.json({
      ...mockTranscript,
      id: Number(params.transcriptId),
    });
  }),
];
