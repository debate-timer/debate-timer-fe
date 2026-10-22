import { TranscriptLine } from '../../types/transcript';

export interface TranscriptGroup {
  key: string;
  timeBoxIndex: number;
  speechType: string;
  startOffsetMs: number;
  lines: TranscriptLine[];
}

export function formatOffset(offsetMs: number): string {
  const totalSeconds = Math.floor(offsetMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 시간순 발언 중 같은 타임박스가 이어지는 줄을 하나의 구간으로 묶는다.
export function groupTranscriptLines(
  lines: TranscriptLine[],
): TranscriptGroup[] {
  return lines.reduce<TranscriptGroup[]>((groups, line) => {
    const last = groups[groups.length - 1];
    if (last && last.timeBoxIndex === line.timeBoxIndex) {
      last.lines.push(line);
      return groups;
    }
    groups.push({
      key: `${line.timeBoxIndex}-${line.index}`,
      timeBoxIndex: line.timeBoxIndex,
      speechType: line.speechType,
      startOffsetMs: line.offsetMs,
      lines: [line],
    });
    return groups;
  }, []);
}
