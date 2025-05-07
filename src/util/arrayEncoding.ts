export function encodeArrayToBase64<T>(data: T[]): string {
  const json = JSON.stringify(data);
  const utf8Bytes = new TextEncoder().encode(json);
  const base64 = btoa(String.fromCharCode(...utf8Bytes));
  return encodeURIComponent(base64);
}

export function decodeBase64ToArray<T>(encoded: string): T[] {
  const base64 = decodeURIComponent(encoded);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as T[];
}

export function createEncodedURL<T>(base: string, data: T[]): string {
  const encoded = encodeArrayToBase64(data);
  return `${base}?data=${encoded}`;
}
