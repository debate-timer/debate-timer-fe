import * as path from 'path';
import { ensureFile, readJSON, writeJSON } from './fileUtils.ts';

interface TranslationUpdateOptions {
  languages?: string[];
  baseDir?: string;
}

/**
 * 한글 키를 기준으로 각 언어 JSON에 키 추가
 * - 중복 키는 건너뜀
 * - en은 빈 문자열, ko는 원문 그대로
 */
export async function updateTranslationFiles(
  keys: Set<string>,
  {
    languages = ['ko', 'en'],
    baseDir = 'public/locales',
  }: TranslationUpdateOptions = {},
) {
  if (keys.size === 0) return;

  console.log('번역 파일을 업데이트합니다...');

  for (const lang of languages) {
    const filePath = path.join(baseDir, lang, 'translation.json');
    await ensureFile(filePath);
    const translations = await readJSON<Record<string, string>>(filePath);

    let updated = false;
    for (const key of keys) {
      if (!(key in translations)) {
        translations[key] = lang === 'ko' ? key : '';
        console.log(`키 추가: '${key}' (${lang}/translation.json)`);
        updated = true;
      }
    }

    if (updated) {
      await writeJSON(filePath, translations);
    }
  }

  console.log('번역 파일 업데이트가 완료되었습니다.\n');
}
