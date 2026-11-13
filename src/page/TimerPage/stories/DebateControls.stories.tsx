import { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { http, HttpResponse } from 'msw';
import { socketManager } from '../../../apis/sockets/SocketManager';
import { SocketError } from '../../../apis/sockets/error';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { toRecognitionLang } from '../../../util/speechRecognition';
import { ApiUrl } from '../../../apis/endpoints';
import useDebateControls from '../hooks/useDebateControls';
import useDebateLogout from '../hooks/useDebateLogout';
import useGlobalSettings from '../../../hooks/useGlobalSettings';
import DebateMenu from '../components/DebateMenu';
import DebateFeatureIndicators from '../components/DebateFeatureIndicators';
import DebateLogoutDialog from '../components/DebateLogoutDialog';

/** 모의 소켓 경계로 실제 제어 훅을 조립하며 앱 라우트는 변경하지 않는 검증 화면임. */
function DebateControlsPreview(props: {
  isMember: boolean;
  hasTranscript: boolean;
  isConnectionFailed: boolean;
  language: 'ko' | 'en';
}) {
  useEffect(() => {
    const previous = i18n.language;
    void i18n.changeLanguage(props.language ?? 'ko');
    return () => {
      void i18n.changeLanguage(previous);
    };
  }, [props.language]);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let connected = false;
    const listeners = new Set<() => void>();
    const closes = new Set<() => void>();
    const errors = new Set<(error: SocketError) => void>();
    const overrides: Partial<typeof socketManager> = {
      connect: () => {
        connected = !props.isConnectionFailed;
        queueMicrotask(() => {
          if (props.isConnectionFailed) {
            errors.forEach((listener) =>
              listener(new SocketError('SOCKET_STOMP_ERROR', '모의 연결 실패')),
            );
          } else {
            listeners.forEach((listener) => listener());
          }
        });
      },
      disconnect: () => {
        connected = false;
        closes.forEach((listener) => listener());
      },
      isConnected: () => connected,
      publish: () => connected,
      subscribe: (destination) => ({ id: destination, unsubscribe: () => {} }),
      onConnectEvent: (listener) => {
        listeners.add(listener);
      },
      offConnectEvent: (listener) => {
        listeners.delete(listener);
      },
      onCloseEvent: (listener) => {
        closes.add(listener);
      },
      offCloseEvent: (listener) => {
        closes.delete(listener);
      },
      onErrorEvent: (listener) => {
        errors.add(listener);
      },
      offErrorEvent: (listener) => {
        errors.delete(listener);
      },
    };
    const originals = Object.fromEntries(
      Object.keys(overrides).map((key) => [
        key,
        socketManager[key as keyof typeof overrides],
      ]),
    );
    Object.assign(socketManager, overrides);
    setIsReady(true);
    return () => {
      Object.assign(socketManager, originals);
    };
  }, [props.isConnectionFailed]);
  return isReady ? <Controls {...props} /> : null;
}

function Controls(props: { isMember: boolean; hasTranscript: boolean }) {
  const [isRunning, setIsRunning] = useState(false);
  const settings = useGlobalSettings();
  const { i18n } = useTranslation();
  const controls = useDebateControls({
    tableId: 5,
    timeBoxIndex: 0,
    team: null,
    lang: toRecognitionLang(i18n.resolvedLanguage ?? i18n.language),
    isRunning,
    canShare: props.isMember,
    canTranscribe: props.isMember && props.hasTranscript,
    stopTimers: () => setIsRunning(false),
  });
  const logout = useDebateLogout({
    stopTimers: () => setIsRunning(false),
    discardTranscript: controls.interrupt,
    stopSharing: controls.share.stopSharing,
    exitFullscreen: async () => {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    },
    issueSettings: () => settings.controller.issueBeforeLogout(),
    onSuccess: () => {},
  });
  return (
    <main className="min-h-screen space-y-6 bg-neutral-100 p-6 text-ui-body text-neutral-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-ui-headline">토론 기능 검증</h1>
        <DebateMenu
          controls={controls}
          shareUnavailableReason={
            props.isMember ? undefined : '로그인한 회원만 공유할 수 있습니다.'
          }
          transcriptUnavailableReason={
            props.isMember && props.hasTranscript
              ? undefined
              : '속기 기능 권한이 필요합니다.'
          }
        />
      </div>
      <DebateFeatureIndicators statuses={controls.statuses} />
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          aria-label="주 타이머 실행 전환"
          disabled={controls.isInputBlocked || logout.isInterrupted}
          className="rounded-xl bg-brand p-3"
          onClick={() => setIsRunning((value) => !value)}
        >
          {isRunning ? '주 타이머 정지' : '주 타이머 시작'}
        </button>
        <button
          type="button"
          aria-label="전체 화면"
          className="rounded-xl border p-3"
          onClick={() => void document.documentElement.requestFullscreen()}
        >
          전체 화면
        </button>
        <button
          type="button"
          aria-label="로그아웃 경고"
          className="rounded-xl border p-3"
          onClick={() => {
            void logout.requestLogout().catch(() => {});
          }}
        >
          로그아웃 경고
        </button>
      </div>
      <p>
        답변 시간: {controls.answerTime}초 /{' '}
        {controls.isAnswerTimeEnabled ? '켜짐' : '꺼짐'}
      </p>
      <p>
        공유는 모의 소켓을 사용합니다. 음성 기록은 동의 후 이 브라우저의
        마이크를 사용합니다.
      </p>
      <DebateLogoutDialog logout={logout} />
    </main>
  );
}

const META: Meta<typeof DebateControlsPreview> = {
  title: 'Timer/DebateControls',
  component: DebateControlsPreview,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        narrow: {
          name: '좁은 화면',
          styles: { width: '375px', height: '667px' },
        },
        belowBoundary: {
          name: '767px',
          styles: { width: '767px', height: '700px' },
        },
        atBoundary: {
          name: '768px',
          styles: { width: '768px', height: '700px' },
        },
        low: { name: '낮은 화면', styles: { width: '900px', height: '400px' } },
      },
    },
    msw: {
      handlers: {
        live: [
          http.get(`${ApiUrl.live}/5/chairman-token`, () =>
            HttpResponse.json({ chairmanToken: 'preview-token' }),
          ),
        ],
        memberLogout: [
          http.post(
            `${ApiUrl.member}/logout`,
            () => new HttpResponse(null, { status: 204 }),
          ),
        ],
      },
    },
  },
  args: {
    isMember: true,
    hasTranscript: true,
    isConnectionFailed: false,
    language: 'ko',
  },
};
export default META;
type Story = StoryObj<typeof DebateControlsPreview>;
export const Interactive: Story = {};
export const Guest: Story = { args: { isMember: false } };
export const WithoutTranscript: Story = { args: { hasTranscript: false } };
export const Failed: Story = { args: { isConnectionFailed: true } };

export const English: Story = { args: { language: 'en' } };
export const Mobile: Story = {
  globals: { viewport: { value: 'narrow', isRotated: false } },
};
export const At767: Story = {
  globals: { viewport: { value: 'belowBoundary', isRotated: false } },
};
export const At768: Story = {
  globals: { viewport: { value: 'atBoundary', isRotated: false } },
};
export const LowScreen: Story = {
  globals: { viewport: { value: 'low', isRotated: false } },
};
