import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranscriptLine } from '../../types/transcript';
import TranscriptDetail from './TranscriptDetail';

const LINE: TranscriptLine = {
  index: 0,
  timeBoxIndex: 0,
  speechType: '입론',
  stance: 'PROS',
  speaker: null,
  offsetMs: 1000,
  text: '찬성 입론입니다.',
};

function renderDetail(props: {
  lines: TranscriptLine[];
  errorMessage: string | null;
}) {
  render(
    <TranscriptDetail
      tableName="정기토론"
      agenda="특별사면 폐지"
      status="FAILED"
      report={null}
      {...props}
    />,
  );
}

describe('토론 기록 상세', () => {
  describe('실패한 기록', () => {
    it('발언이 없으면 속기록 탭에 기록을 만들지 못했다고 알리고 사유를 보여준다', () => {
      renderDetail({ lines: [], errorMessage: '전사된 발언이 없습니다.' });

      expect(
        screen.getByText('토론 기록을 만들지 못했어요'),
      ).toBeInTheDocument();
      expect(screen.getByText('전사된 발언이 없습니다.')).toBeInTheDocument();
    });

    it('발언이 있고 분석만 실패했으면 속기록은 그대로 보여주고 보고서 탭에서 실패를 알린다', async () => {
      const user = userEvent.setup();
      renderDetail({ lines: [LINE], errorMessage: '분석 실패' });

      expect(screen.getByText('찬성 입론입니다.')).toBeInTheDocument();
      expect(
        screen.queryByText('토론 기록을 만들지 못했어요'),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: '분석 보고서' }));

      expect(
        screen.getByText('분석 보고서를 만들지 못했어요'),
      ).toBeInTheDocument();
    });
  });
});
