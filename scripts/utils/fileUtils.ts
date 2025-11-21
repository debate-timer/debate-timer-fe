import * as fsp from 'fs/promises';
import * as path from 'path';

/** 파일을 읽어서 문자열로 반환 */
export function readFile(filePath: string): Promise<string> {
  return fsp.readFile(filePath, 'utf8');
}

/** 파일을 JSON으로 파싱 */
export async function readJSON<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath);
  return JSON.parse(content) as T;
}

/** 디렉토리가 없으면 생성하고, 파일이 없으면 빈 파일 생성 (ensureFile) */
export async function ensureFile(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);

  // 1. 디렉토리 구조 보장 (writeFile에서 mkdir을 처리하므로, 여기서는 fsp.access를 사용)
  try {
    // 디렉토리가 존재하는지 확인
    await fsp.access(dir);
  } catch {
    // 디렉토리가 없으면 생성
    await fsp.mkdir(dir, { recursive: true });
  }
  // 2. 파일이 존재하는지 확인하고, 없다면 빈 파일 생성
  try {
    await fsp.access(filePath);
  } catch {
    // 파일이 없으면 catch 블록으로 진입, 빈 JSON 파일 생성
    await fsp.writeFile(filePath, '{}', 'utf8');
  }
}

/** 문자열을 파일로 저장 */
export async function writeFile(filePath: string, data: string): Promise<void> {
  console.log(`[writeFile] 파일 쓰기 시작: ${filePath}`);
  const dir = path.dirname(filePath);

  await fsp.mkdir(dir, { recursive: true }).catch(() => {});

  await fsp.writeFile(filePath, data, 'utf8');
  console.log(`[writeFile] 파일 쓰기 완료: ${filePath}`);
}

/** JSON 데이터를 파일로 저장 */
export async function writeJSON(
  filePath: string,
  data: unknown,
): Promise<void> {
  console.log(`[writeJSON] JSON 데이터 저장 시작: ${filePath}`);
  await writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`[writeJSON] JSON 데이터 저장 완료: ${filePath}`);
}
