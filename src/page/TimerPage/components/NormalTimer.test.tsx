import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NormalTimer from './NormalTimer';
import { TimeBoxInfo } from '../../../type/type';

const mockNormalTimerInstance = {
  timer: 120,
  isAdditionalTimerOn: false,
  isRunning: false,
  handleChangeAdditionalTimer: vi.fn(),
  handleCloseAdditionalTimer: vi.fn(),
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resetTimer: vi.fn(),
  setTimer: vi.fn(),
};

const baseItem: TimeBoxInfo = {
  stance: 'PROS',
  speechType: '입론',
  bell: null,
  boxType: 'NORMAL',
  time: 120,
  timePerTeam: null,
  timePerSpeaking: null,
  speaker: null,
};

function renderNormalTimer(
  teamName: string | null,
  speaker: string | null,
  speechType = '입론',
) {
  const item: TimeBoxInfo = { ...baseItem, speaker, speechType };
  return render(
    <NormalTimer
      normalTimerInstance={mockNormalTimerInstance}
      isAdditionalTimerAvailable={false}
      item={item}
      teamName={teamName}
    />,
  );
}

describe('NormalTimer - 두 줄 레이아웃 (US2)', () => {
  it('팀명만 있을 때 팀명이 표시되고 토론자 줄은 렌더링되지 않는다', () => {
    renderNormalTimer('찬성', null);

    expect(screen.getByText('찬성 팀')).toBeInTheDocument();
    expect(screen.queryByText(/토론자/)).not.toBeInTheDocument();
  });

  it('토론자만 있을 때 토론자 정보가 표시되고 팀명 줄은 렌더링되지 않는다', () => {
    renderNormalTimer(null, '발언자 1');

    expect(screen.getByText('발언자 1 토론자')).toBeInTheDocument();
    expect(screen.queryByText(/찬성/)).not.toBeInTheDocument();
  });

  it('팀명과 토론자 모두 있을 때 각각 독립된 DOM 요소로 렌더링된다', () => {
    renderNormalTimer('찬성', '발언자 1');

    const teamEl = screen.getByText('찬성 팀');
    const speakerEl = screen.getByText('발언자 1 토론자');

    expect(teamEl).toBeInTheDocument();
    expect(speakerEl).toBeInTheDocument();
    expect(teamEl).not.toBe(speakerEl);
  });

  it('팀명과 토론자 모두 없으면 팀 정보 영역이 렌더링되지 않는다', () => {
    renderNormalTimer(null, null);

    expect(screen.queryByText(/팀$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/토론자/)).not.toBeInTheDocument();
  });

  it('팀명 요소에 truncate 클래스가 존재한다', () => {
    renderNormalTimer('A very long team name', null);

    const teamEl = screen.getByText('A very long team name 팀');
    expect(teamEl).toHaveClass('truncate');
  });

  it('토론자 요소에는 truncate 클래스가 존재하지 않는다', () => {
    renderNormalTimer(null, '발언자 1');

    const speakerEl = screen.getByText('발언자 1 토론자');
    expect(speakerEl).not.toHaveClass('truncate');
  });
});

describe('NormalTimer - 순서명 정렬 (US3)', () => {
  it('한글 순서명 렌더링 시 h1 요소에 text-center 클래스가 존재한다', () => {
    renderNormalTimer(null, null, '입론');

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('text-center');
  });

  it('영어 순서명 렌더링 시 h1 요소에 text-center 클래스가 존재한다', () => {
    renderNormalTimer(null, null, 'Opening Statement');

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('text-center');
  });
});
