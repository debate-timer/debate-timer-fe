import { DebateTableData } from '../type/type';
import {
  createTableShareUrl,
  decodeDebateTableData,
  encodeDebateTableData,
  extractTableShareUrl,
} from './arrayEncoding';

describe('토론 테이블 인코딩 유틸리티', () => {
  const sampleData: DebateTableData = {
    info: {
      name: '나의 자유토론 테이블',
      agenda: '토론 주제',
      prosTeamName: '찬성',
      consTeamName: '반대',
      warningBell: true,
      finishBell: true,
    },
    table: [
      {
        stance: 'NEUTRAL',
        speechType: '자유토론',
        boxType: 'TIME_BASED',
        time: null,
        timePerTeam: 60,
        timePerSpeaking: 33,
        speaker: null,
        bell: null,
      },
      {
        stance: 'NEUTRAL',
        speechType: '자유토론',
        boxType: 'TIME_BASED',
        time: null,
        timePerTeam: 35,
        timePerSpeaking: null,
        speaker: null,
        bell: null,
      },
      {
        stance: 'PROS',
        speechType: '입론',
        boxType: 'NORMAL',
        time: 120,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: '발언자 1',
        bell: null,
      },
      {
        stance: 'PROS',
        speechType: '입론',
        boxType: 'NORMAL',
        time: 120,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: '발언자 1',
        bell: null,
      },
      {
        stance: 'NEUTRAL',
        speechType: '작전 시간',
        boxType: 'NORMAL',
        time: 60,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: null,
        bell: null,
      },
      {
        stance: 'CONS',
        speechType: '최종 발언',
        boxType: 'NORMAL',
        time: 120,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: '발언자 2',
        bell: null,
      },
      {
        stance: 'PROS',
        speechType: '최종 발언',
        boxType: 'NORMAL',
        time: 120,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: '발언자 2',
        bell: null,
      },
    ],
  };

  test('encode와 decode는 데이터의 무결성을 검증한다 ', () => {
    const encoded = encodeDebateTableData(sampleData);
    const decoded = decodeDebateTableData(encoded);
    expect(decoded).toEqual(sampleData);
  });

  test('인코딩된 문자열은 URL에서 안전하게 사용할 수 있는 지 확인해야한다.', () => {
    const encoded = encodeDebateTableData(sampleData);
    expect(() => decodeURIComponent(encoded)).not.toThrow();
  });

  test('createEncodedURL 함수는 data 쿼리 파라미터가 포함된 올바른 URL을 생성해야 한다', () => {
    const baseUrl = 'https://example.com/';
    const url = createTableShareUrl(baseUrl, sampleData);
    const parsed = new URL(url);
    const encodedData = parsed.searchParams.get('data');
    expect(encodedData).toBeTruthy();
    const decoded = decodeDebateTableData(encodedData!);
    expect(decoded).toEqual(sampleData);
  });

  test('정상적인 URL에서 데이터를 추출하고 디코드할 수 있어야 한다', () => {
    const url = createTableShareUrl('https://example.com/', sampleData);
    const result = extractTableShareUrl(url);
    expect(result).toEqual(sampleData);
  });

  test('data 파라미터가 없으면 null을 반환해야 한다', () => {
    const url = 'https://example.com/';
    const result = extractTableShareUrl(url);
    expect(result).toBeNull();
  });

  test('잘못된 URL이 들어오면 null을 반환해야 한다', () => {
    const invalidURL = 'not-a-valid-url';
    const result = extractTableShareUrl(invalidURL);
    expect(result).toBeNull();
  });
});
