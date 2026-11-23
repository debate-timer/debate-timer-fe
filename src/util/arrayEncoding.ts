import { deflate, inflate } from 'pako';
import { DebateTableData } from '../types/type';

function bytesToBinaryString(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return binary;
}

function normalizeBase64(encodedData: string): string {
  // TemplateRow·테스트 등은 encodeURIComponent 문자열을 직접 넘기고, useSearchParams는 1차 디코딩된 문자열을 넘긴다.
  const uriDecoded = /%[0-9A-Fa-f]{2}/.test(encodedData)
    ? decodeURIComponent(encodedData)
    : encodedData;
  // URLSearchParams는 인코딩되지 않은 +를 공백으로 디코딩하므로 Base64 복원 시 +로 되돌린다.
  const standardBase64 = uriDecoded
    .trim()
    .replace(/ /g, '+')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const paddingLength = (4 - (standardBase64.length % 4)) % 4;

  return `${standardBase64}${'='.repeat(paddingLength)}`;
}

function isValidDebateTableData(value: unknown): value is DebateTableData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'info' in value &&
    typeof value.info === 'object' &&
    value.info !== null &&
    !Array.isArray(value.info) &&
    'table' in value &&
    Array.isArray(value.table)
  );
}

/** 시간표 데이터를 메신저·브라우저 링크 변형에 안전한 URL-safe Base64로 압축 인코딩한다. */
export function encodeDebateTableData(data: DebateTableData): string {
  const json = JSON.stringify(data);
  const compressed = deflate(json);
  const base64 = btoa(bytesToBinaryString(compressed));

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 신규 URL-safe Base64와 기존 표준 Base64(퍼센트 인코딩 및 공백 치환된 + 포함)를 모두 복호화한다.
 */
export function decodeDebateTableData(encodedData: string): DebateTableData {
  try {
    const base64 = normalizeBase64(encodedData);
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decompressed = inflate(bytes, { to: 'string' });
    const parsed: unknown = JSON.parse(decompressed);

    if (!isValidDebateTableData(parsed)) {
      throw new Error('Invalid debate table data');
    }

    return parsed;
  } catch {
    throw new Error('데이터 처리에 실패했어요.');
  }
}

export function createTableShareUrlFromTable(
  baseUrl: string | undefined,
  data: DebateTableData,
): string {
  const encoded = encodeDebateTableData(data);
  const resolvedBaseUrl =
    baseUrl && baseUrl.trim() !== '' ? baseUrl : window.location.origin;
  const normalizedBaseUrl = resolvedBaseUrl.replace(/\/+$/, '');
  const basePath = import.meta.env.VITE_BASE_PATH;
  const pathPrefix = basePath && basePath !== '/' ? basePath : '';
  return `${normalizedBaseUrl}${pathPrefix}/share?data=${encoded}`;
}

export function createTableShareUrlFromEncodedData(encodeData: string): string {
  const baseUrl = import.meta.env.VITE_SHARE_BASE_URL || window.location.origin;
  const resolvedBaseUrl =
    baseUrl && baseUrl.trim() !== '' ? baseUrl : window.location.origin;
  const normalizedBaseUrl = resolvedBaseUrl.replace(/\/+$/, '');
  const basePath = import.meta.env.VITE_BASE_PATH;
  const pathPrefix = basePath && basePath !== '/' ? basePath : '';
  return `${normalizedBaseUrl}${pathPrefix}/share?data=${encodeData}`;
}

export function extractTableShareUrl(url: string): DebateTableData | null {
  try {
    const parsed = new URL(url);
    const encodedData = parsed.searchParams.get('data');
    if (!encodedData) return null;
    return decodeDebateTableData(encodedData);
  } catch {
    return null;
  }
}
