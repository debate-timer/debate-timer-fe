import * as fs from 'fs/promises';
import { glob } from 'glob';
import { parseCode, transformAST, generateCode } from './utils/astUtils.ts';
import { updateTranslationFiles } from './utils/translationUtils.ts';

async function processFile(filePath: string) {
  console.log(`\n파일 처리 중: ${filePath}`);
  const originalCode = await fs.readFile(filePath, 'utf-8');
  const ast = parseCode(originalCode);

  const koreanKeys = transformAST(ast);
  if (koreanKeys.size === 0) {
    console.log('한글 텍스트를 찾지 못했습니다.');
    return;
  }

  await updateTranslationFiles(koreanKeys);

  const newCode = generateCode(ast);
  if (newCode !== originalCode) {
    await fs.writeFile(filePath, newCode, 'utf-8');
    console.log(`파일 업데이트 완료: ${filePath}`);
  } else {
    console.log('변경 사항이 없습니다.');
  }
}

async function main() {
  const files = await glob('src/**/*.tsx');
  if (files.length === 0) {
    console.log('.tsx 파일을 찾지 못했습니다.');
    return;
  }

  for (const file of files) {
    await processFile(file);
  }

  console.log('\ni18n 변환 작업이 완료되었습니다.');
}

main().catch(console.error);
