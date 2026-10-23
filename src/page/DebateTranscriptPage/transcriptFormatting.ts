import { Stance } from '../../types/type';
import { TranscriptLine } from '../../types/transcript';

// 같은 팀·화자가 이어서 말한 문장을 합친 하나의 발언
export interface TranscriptSpeech {
  key: string;
  stance: Stance;
  speaker: string | null;
  offsetMs: number;
  lines: TranscriptLine[];
}

export interface TranscriptGroup {
  key: string;
  timeBoxIndex: number;
  speechType: string;
  startOffsetMs: number;
  lines: TranscriptLine[];
  speeches: TranscriptSpeech[];
}

export function formatOffset(offsetMs: number): string {
  const totalSeconds = Math.floor(offsetMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 문장 단위로 인식된 줄 중 같은 팀·화자가 이어지는 줄을 하나의 발언으로 합친다.
export function mergeSpeeches(lines: TranscriptLine[]): TranscriptSpeech[] {
  return lines.reduce<TranscriptSpeech[]>((speeches, line) => {
    const last = speeches[speeches.length - 1];
    if (last && last.stance === line.stance && last.speaker === line.speaker) {
      last.lines.push(line);
      return speeches;
    }
    speeches.push({
      key: `${line.timeBoxIndex}-${line.index}`,
      stance: line.stance,
      speaker: line.speaker,
      offsetMs: line.offsetMs,
      lines: [line],
    });
    return speeches;
  }, []);
}

// 시간순 발언 중 같은 타임박스가 이어지는 줄을 하나의 구간으로 묶고, 구간 안의 발언을 합친다.
export function groupTranscriptLines(
  lines: TranscriptLine[],
): TranscriptGroup[] {
  const timeBoxGroups = lines.reduce<Omit<TranscriptGroup, 'speeches'>[]>(
    (groups, line) => {
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
    },
    [],
  );
  return timeBoxGroups.map((group) => ({
    ...group,
    speeches: mergeSpeeches(group.lines),
  }));
}
