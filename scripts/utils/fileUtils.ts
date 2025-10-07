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

/** 특정 확장자 파일들을 재귀적으로 찾기 */
export async function getAllFiles(
  dir: string,
  ext: string,
  fileList: string[] = [],
): Promise<string[]> {
  try {
    // 비동기적으로 디렉토리 내용 읽기
    const entries = await fsp.readdir(dir, { withFileTypes: true });

    // 모든 재귀 호출을 Promise.all로 병렬 처리
    const promises = entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // 디렉토리인 경우, 비동기 재귀 호출을 하고 결과 병합
        const nestedFiles = await getAllFiles(fullPath, ext);
        fileList.push(...nestedFiles);
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        // 파일인 경우, 리스트에 추가
        fileList.push(fullPath);
      }
    });

    // 모든 비동기 작업(하위 디렉토리 순회)이 완료될 때까지 기다림
    await Promise.all(promises);
  } catch (err) {
    console.error(`에러 발생 디렉토리 ${dir}:`, err);
  }

  return fileList;
}
