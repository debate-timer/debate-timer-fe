/**
 * 텍스트를 클립보드에 복사하고 성공 여부를 반환합니다.
 * Clipboard API는 보안 컨텍스트(HTTPS, localhost)에서만 동작하므로,
 * 지원하지 않거나 실패하면 execCommand('copy')로 폴백합니다.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한 거부 등으로 실패하면 아래 폴백을 시도합니다.
    }
  }

  return copyWithExecCommand(text);
}

function copyWithExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
