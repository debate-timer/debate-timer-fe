// AudienceShareSimulator.stories.tsx
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Meta, StoryObj } from '@storybook/react';
import { IMessage, StompSubscription } from '@stomp/stompjs';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { socketManager } from '../../../apis/sockets/SocketManager';
import {
  SocketMessage,
  TimerDataPayload,
  TimerEventTypes,
} from '../../../apis/sockets/type';
import AudienceSharePage from '../AudienceSharePage';
import AudienceFinishedPage from '../../AudienceFinishedPage/AudienceFinishedPage';

/**
 * 서버 없이 청중 화면을 시험하기 위한 테스트 페이지입니다.
 *
 * `socketManager` 싱글톤을 가짜 구현으로 바꿔, 컨트롤 패널에서 만든 메시지를
 * `/room/{roomId}` 구독 콜백에 직접 주입합니다. 따라서 메시지 검증, version 필터,
 * 이벤트 해석, 카운트다운까지 실제 청중 화면과 같은 경로를 거칩니다.
 * 테이블 데이터는 MSW `liveHandlers`의 목 데이터를 사용합니다.
 */

const ROOM_ID = 5;
const ROOM_DESTINATION = `/room/${ROOM_ID}`;

// 목 테이블 기준: 2번은 일반 타이머(120초), 0번은 자유토론(팀당 60초, 1회당 33초)
const NORMAL_BASE: TimerDataPayload = {
  timerType: 'NORMAL',
  sequence: 2,
  remainingTime: 95,
};
const TIME_BASED_BASE: TimerDataPayload = {
  timerType: 'TIME_BASED',
  sequence: 0,
  currentTeam: 'CONS',
  remainingTime: 20,
  prosRemainingTime: 45,
  consRemainingTime: 38,
};

type FakeSocketMethod =
  | 'connect'
  | 'disconnect'
  | 'isConnected'
  | 'subscribe'
  | 'publish'
  | 'onConnectEvent'
  | 'offConnectEvent'
  | 'onCloseEvent'
  | 'offCloseEvent'
  | 'onErrorEvent'
  | 'offErrorEvent';

interface FakeSocket {
  emit: (destination: string, message: SocketMessage) => boolean;
  restore: () => void;
}

/**
 * `socketManager`의 공개 메서드를 인스턴스 속성으로 덮어써 가짜 소켓으로 동작하게 합니다.
 * `restore` 호출 시 덮어쓴 속성을 지워 원래 프로토타입 메서드로 되돌립니다.
 */
function installFakeSocket(): FakeSocket {
  let isConnected = false;
  const connectListeners = new Set<() => void>();
  const closeListeners = new Set<() => void>();
  const subscriptions = new Map<string, (message: IMessage) => void>();

  const overrides: Pick<typeof socketManager, FakeSocketMethod> = {
    connect: () => {
      if (isConnected) {
        return;
      }
      isConnected = true;
      // 실제 소켓처럼 비동기로 연결 완료를 알림
      setTimeout(() => connectListeners.forEach((listener) => listener()), 0);
    },
    disconnect: () => {
      isConnected = false;
      subscriptions.clear();
      closeListeners.forEach((listener) => listener());
    },
    isConnected: () => isConnected,
    subscribe: (destination, callback) => {
      subscriptions.set(destination, callback);
      return {
        id: destination,
        unsubscribe: () => subscriptions.delete(destination),
      } as StompSubscription;
    },
    publish: () => {},
    onConnectEvent: (listener) => {
      connectListeners.add(listener);
    },
    offConnectEvent: (listener) => {
      connectListeners.delete(listener);
    },
    onCloseEvent: (listener) => {
      closeListeners.add(listener);
    },
    offCloseEvent: (listener) => {
      closeListeners.delete(listener);
    },
    onErrorEvent: () => {},
    offErrorEvent: () => {},
  };

  Object.assign(socketManager, overrides);

  return {
    emit: (destination, message) => {
      const callback = subscriptions.get(destination);
      if (!callback) {
        return false;
      }
      callback({ body: JSON.stringify(message) } as IMessage);
      return true;
    },
    restore: () => {
      (Object.keys(overrides) as FakeSocketMethod[]).forEach((key) => {
        delete (socketManager as unknown as Record<string, unknown>)[key];
      });
    },
  };
}

// 로그에는 번역 키를 저장하고 표시할 때 번역
const NOTE_NOT_DELIVERED = '구독 없음 (전달 안 됨)';
const NOTE_STALE_VERSION = '오래된 version: 무시되어야 함';

interface SentLog {
  id: number;
  eventType: SocketMessage['eventType'];
  version: number;
  note: string;
}

interface ControlButtonProps {
  label: string;
  onClick: () => void;
}

function ControlButton({ label, onClick }: ControlButtonProps) {
  return (
    <button
      type="button"
      className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-neutral-100"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function AudienceShareSimulator() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 자식(청중 페이지)의 effect가 소켓을 쓰기 전에 설치되어야 하므로 렌더 중 1회 설치
  const [fakeSocket] = useState(installFakeSocket);
  useEffect(() => fakeSocket.restore, [fakeSocket]);

  const versionRef = useRef(0);
  const lastMessageRef = useRef<SocketMessage | null>(null);
  const [baseData, setBaseData] = useState<TimerDataPayload>(NORMAL_BASE);
  const [logs, setLogs] = useState<SentLog[]>([]);

  const send = (message: SocketMessage, note = '') => {
    const isDelivered = fakeSocket.emit(ROOM_DESTINATION, message);
    setLogs((prev) => [
      {
        id: prev.length + 1,
        eventType: message.eventType,
        version: message.version ?? 0,
        note: isDelivered ? note : NOTE_NOT_DELIVERED,
      },
      ...prev,
    ]);
  };

  const sendNew = (message: Omit<SocketMessage, 'version'>, note = '') => {
    versionRef.current += 1;
    const versioned = {
      ...message,
      version: versionRef.current,
    } as SocketMessage;
    lastMessageRef.current = versioned;
    send(versioned, note);
  };

  const sendTimerEvent = (
    eventType: TimerEventTypes,
    data: TimerDataPayload = baseData,
  ) => {
    setBaseData(data);
    sendNew({ eventType, data });
  };

  const handleResendStale = () => {
    const lastMessage = lastMessageRef.current;
    if (!lastMessage) {
      return;
    }
    send(
      { ...lastMessage, version: (lastMessage.version ?? 1) - 1 },
      NOTE_STALE_VERSION,
    );
  };

  const handleRestart = () => {
    lastMessageRef.current = null;
    setLogs([]);
    navigate(`/live/${ROOM_ID}`, { replace: true });
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="relative h-[60vh] flex-1 overflow-hidden border-b border-neutral-300 md:h-full md:border-b-0 md:border-r">
        <Routes>
          <Route path="/live/:id" element={<AudienceSharePage />} />
          <Route path="/live/:id/end" element={<AudienceFinishedPage />} />
        </Routes>
      </div>

      <aside className="flex w-full flex-col gap-4 overflow-auto bg-neutral-50 p-4 md:w-80">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-gray-600">
            {t('SYNC (중도 입장)')}
          </h2>
          <ControlButton
            label={t('일반 · 재생 중')}
            onClick={() =>
              sendTimerEvent('SYNC', { ...NORMAL_BASE, isRunning: true })
            }
          />
          <ControlButton
            label={t('일반 · 정지')}
            onClick={() =>
              sendTimerEvent('SYNC', { ...NORMAL_BASE, isRunning: false })
            }
          />
          <ControlButton
            label={t('자유토론 · 재생 중')}
            onClick={() =>
              sendTimerEvent('SYNC', { ...TIME_BASED_BASE, isRunning: true })
            }
          />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-gray-600">
            {t('타이머 이벤트 (마지막 데이터 기준)')}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                'PLAY',
                'STOP',
                'RESET',
                'BEFORE',
                'NEXT',
                'TEAM_SWITCH',
              ] as const
            ).map((eventType) => (
              <ControlButton
                key={eventType}
                label={eventType}
                onClick={() => sendTimerEvent(eventType)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-gray-600">
            {t('순서 · 종료')}
          </h2>
          <ControlButton
            label={t('오래된 version으로 재전송')}
            onClick={handleResendStale}
          />
          <ControlButton
            label="FINISHED"
            onClick={() => sendNew({ eventType: 'FINISHED', data: null })}
          />
          <ControlButton label={t('처음부터 다시')} onClick={handleRestart} />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-gray-600">
            {t('보낸 메시지')}
          </h2>
          <ol className="flex flex-col gap-1 text-xs text-gray-700">
            {logs.map((log) => (
              <li key={log.id} className="rounded bg-white px-2 py-1">
                #{log.id} {log.eventType} · v{log.version}
                {log.note && (
                  <span className="block text-gray-500">{t(log.note)}</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}

const meta: Meta<typeof AudienceShareSimulator> = {
  title: 'page/AudienceSharePage/AudienceShareSimulator',
  component: AudienceShareSimulator,
  parameters: {
    layout: 'fullscreen',
    route: `/live/${ROOM_ID}`,
  },
};

export default meta;

type Story = StoryObj<typeof AudienceShareSimulator>;

export const Default: Story = {
  render: () => <AudienceShareSimulator />,
};

export const Mobile: Story = {
  ...Default,
  parameters: {
    viewport: {
      viewports: {
        mobile375: {
          name: 'Mobile 375',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
      },
      defaultViewport: 'mobile375',
    },
  },
};
