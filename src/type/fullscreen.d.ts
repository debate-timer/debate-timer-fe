/**
 * 브라우저별 접두사가 붙은 전체 화면 속성을 포함하는 사용자 정의 인터페이스
 */
export interface DocumentWithFullscreen extends Document {
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  mozFullScreenElement?: Element;
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
}

export interface HTMLElementWithFullscreen extends HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}
