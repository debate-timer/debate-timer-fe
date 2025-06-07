import { deflate, inflate } from 'pako';
import { DebateTableData } from '../type/type';

export function encodeDebateTableData(data: DebateTableData): string {
  const json = JSON.stringify(data); // Deserialize
  const compressed = deflate(json); // 압축
  const base64 = btoa(String.fromCharCode(...compressed));
  return encodeURIComponent(base64);
}

export function decodeDebateTableData(encodedData: string): DebateTableData {
  try {
    const base64 = decodeURIComponent(encodedData);
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decompressed = inflate(bytes, { to: 'string' });
    return JSON.parse(decompressed);
  } catch {
    throw new Error('데이터 처리에 실패했어요.');
  }
}

export function createTableShareUrl(
  baseUrl: string,
  data: DebateTableData,
): string {
  const encoded = encodeDebateTableData(data);
  return `${baseUrl}/share?data=${encoded}`;
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
