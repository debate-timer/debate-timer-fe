import { deflate, inflate } from 'pako';

export function encodeArrayCompressed<T>(data: T[]): string {
  const json = JSON.stringify(data);
  const compressed = deflate(json); // 압축
  const base64 = btoa(String.fromCharCode(...compressed));
  return encodeURIComponent(base64);
}

export function decodeArrayCompressed<T>(encoded: string): T[] {
  const base64 = decodeURIComponent(encoded);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decompressed = inflate(bytes, { to: 'string' });
  return JSON.parse(decompressed) as T[];
}

export function createEncodedURL<T>(base: string, data: T[]): string {
  const encoded = encodeArrayCompressed(data);
  return `${base}?data=${encoded}`;
}
