// 크롬 Web Speech API(SpeechRecognition) 브라우저 경계.
// 표준 타입이 lib.dom에 없어 필요한 부분만 선언한다.

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface SpeechRecognitionWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UserAgentDataNavigator {
  userAgentData?: { brands: { brand: string }[] };
}

// 웨일·브레이브 같은 다른 크로미움 브라우저도 SpeechRecognition을 노출하지만,
// 구글 음성 서버 인증이 없어 빈 결과만 돌아오므로 구글 크롬에서만 쓴다.
export function isGoogleChrome(): boolean {
  const brands = (navigator as UserAgentDataNavigator).userAgentData?.brands;
  return brands?.some(({ brand }) => brand === 'Google Chrome') ?? false;
}

export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (!isGoogleChrome()) {
    return null;
  }
  const speechWindow = window as unknown as SpeechRecognitionWindow;
  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  );
}

// 마이크 권한 거부처럼 재시도해도 회복되지 않는 오류
export function isFatalSpeechError(error: string): boolean {
  return error === 'not-allowed' || error === 'service-not-allowed';
}

export function toRecognitionLang(language: string | undefined): string {
  return language?.startsWith('en') ? 'en-US' : 'ko-KR';
}
