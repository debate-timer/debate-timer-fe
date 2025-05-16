import {
  encodeArrayCompressed,
  decodeArrayCompressed,
  createEncodedURL,
  extractDecodedArrayFromURL,
} from './arrayEncoding';

describe('압축된 배열 인코딩 유틸리티', () => {
  const sampleData = [
    {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 180,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: null,
    },
    {
      stance: 'CONS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 180,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: null,
    },
    {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 180,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: null,
    },
  ];

  test('encode와 decode는 데이터의 무결성을 검증한다 ', () => {
    const encoded = encodeArrayCompressed(sampleData);
    const decoded = decodeArrayCompressed(encoded);
    expect(decoded).toEqual(sampleData);
  });

  test('인코딩된 문자열은 URL에서 안전하게 사용할 수 있는 지 확인해야한다.', () => {
    const encoded = encodeArrayCompressed(sampleData);
    expect(() => decodeURIComponent(encoded)).not.toThrow();
  });

  test('createEncodedURL 함수는 data 쿼리 파라미터가 포함된 올바른 URL을 생성해야 한다', () => {
    const baseUrl = 'https://example.com/';
    const url = createEncodedURL(baseUrl, sampleData);
    const parsed = new URL(url);
    const encodedData = parsed.searchParams.get('data');
    expect(encodedData).toBeTruthy();
    const decoded = decodeArrayCompressed(encodedData!);
    expect(decoded).toEqual(sampleData);
  });

  test('정상적인 URL에서 데이터를 추출하고 디코드할 수 있어야 한다', () => {
    const url = createEncodedURL('https://example.com/', sampleData);
    const result = extractDecodedArrayFromURL(url);
    expect(result).toEqual(sampleData);
  });

  test('data 파라미터가 없으면 null을 반환해야 한다', () => {
    const url = 'https://example.com/';
    const result = extractDecodedArrayFromURL(url);
    expect(result).toBeNull();
  });

  test('잘못된 URL이 들어오면 null을 반환해야 한다', () => {
    const invalidURL = 'not-a-valid-url';
    const result = extractDecodedArrayFromURL(invalidURL);
    expect(result).toBeNull();
  });
});
