import { deflate } from 'pako';
import { DebateTableData } from '../types/type';
import {
  createTableShareUrlFromEncodedData,
  createTableShareUrlFromTable,
  decodeDebateTableData,
  encodeDebateTableData,
  extractTableShareUrl,
} from './arrayEncoding';

/** 기존 표준 Base64(+/= 포함) 문자열을 생성해 하위 호환성 테스트에 사용한다. */
function encodeLegacyStandardBase64(data: DebateTableData): string {
  const compressed = deflate(JSON.stringify(data));
  let binary = '';
  compressed.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

describe('토론 테이블 인코딩 유틸리티', () => {
  const sampleData: DebateTableData = {
    info: {
      name: '나의 자유토론 테이블',
      agenda: '토론 주제',
      prosTeamName: '찬성',
      consTeamName: '반대',
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

  test('createTableShareUrlFromTable 함수는 data 쿼리 파라미터가 포함된 올바른 URL을 생성해야 한다', () => {
    const baseUrl = 'https://example.com/';
    const url = createTableShareUrlFromTable(baseUrl, sampleData);
    const parsed = new URL(url);
    const encodedData = parsed.searchParams.get('data');
    expect(encodedData).toBeTruthy();
    const decoded = decodeDebateTableData(encodedData!);
    expect(decoded).toEqual(sampleData);
  });

  test('createTableShareUrlFromEncodedData 함수도 data 쿼리 파라미터가 포함된 올바른 URL을 생성해야 한다', () => {
    const encodedData = encodeDebateTableData(sampleData);
    const url = createTableShareUrlFromEncodedData(encodedData);
    const parsed = new URL(url);
    const decodedData = parsed.searchParams.get('data');
    expect(decodedData).toBeTruthy();
    const decoded = decodeDebateTableData(decodedData!);
    expect(decoded).toEqual(sampleData);
  });

  test('정상적인 URL에서 데이터를 추출하고 디코드할 수 있어야 한다', () => {
    const url = createTableShareUrlFromTable(
      'https://example.com/',
      sampleData,
    );
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

  it('URL-safe Base64로 인코딩하며 +, /, = 문자를 포함하지 않는다', () => {
    const encoded = encodeDebateTableData(sampleData);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeDebateTableData(encoded)).toEqual(sampleData);
  });

  it('기존 표준 Base64와 encodeURIComponent 포맷의 데이터도 디코딩한다', () => {
    const rawBase64 = encodeLegacyStandardBase64(sampleData);
    expect(rawBase64).toContain('+');
    expect(rawBase64).toContain('/');
    expect(rawBase64).toContain('=');

    const legacyEncoded = encodeURIComponent(rawBase64);
    expect(decodeDebateTableData(legacyEncoded)).toEqual(sampleData);
    expect(
      extractTableShareUrl(`https://example.com/share?data=${legacyEncoded}`),
    ).toEqual(sampleData);
  });

  it('쿼리의 +가 공백으로 변환되어도 원본 시간표 데이터로 복호화한다', () => {
    const legacySample: DebateTableData = {
      ...sampleData,
      info: {
        ...sampleData.info,
        name: '기존 공유 링크 호환성 검증용 시간표 123',
      },
    };
    const rawBase64 = encodeLegacyStandardBase64(legacySample);
    expect(rawBase64).toContain('+');

    // 메신저·브라우저 주소창 등에서 %2B 대신 리터럴 +가 남아 URLSearchParams가 공백으로 읽은 상황을 재현한다.
    const corruptedUrl = `https://example.com/share?data=${rawBase64.replace(/\//g, '%2F').replace(/=/g, '%3D')}`;
    const parsedDataParam = new URL(corruptedUrl).searchParams.get('data');
    expect(parsedDataParam).toContain(' ');

    expect(decodeDebateTableData(parsedDataParam!)).toEqual(legacySample);
    expect(extractTableShareUrl(corruptedUrl)).toEqual(legacySample);
  });

  it('시간표 스키마가 아닌 JSON이나 손상된 문자열은 오류를 던진다', () => {
    const invalidSchemaJson = JSON.stringify({ hello: 'world' });
    const compressed = deflate(invalidSchemaJson);
    let binary = '';
    compressed.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const encodedInvalid = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    expect(() => decodeDebateTableData(encodedInvalid)).toThrow(
      '데이터 처리에 실패했어요.',
    );
    expect(
      extractTableShareUrl(`https://example.com/share?data=${encodedInvalid}`),
    ).toBeNull();
    expect(() => decodeDebateTableData('not-base64%%%')).toThrow(
      '데이터 처리에 실패했어요.',
    );
  });
});
