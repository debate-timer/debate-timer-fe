import { motion, useReducedMotion } from 'framer-motion';

interface DebateWaitingNoticeProps {
  message: string;
}

// 모래가 한 번 다 떨어지고 모래시계를 뒤집기까지 걸리는 시간
const CYCLE_DURATION_S = 9;
// 한 주기 안에서 모래가 흐르는 구간과 뒤집는 구간의 비율
const FLOW_END = 0.8;
const FLIP_START = 0.88;
// 목에서 바닥까지 떨어지는 모래 알갱이 (x 흔들림과 출발 지연을 달리해 한 알씩 떨어지는 느낌을 준다)
const SAND_GRAINS = [
  { x: 0, delay: 0 },
  { x: 0.5, delay: 0.18 },
  { x: -0.4, delay: 0.36 },
  { x: 0.2, delay: 0.54 },
  { x: -0.6, delay: 0.72 },
  { x: 0.4, delay: 0.9 },
];
const GRAIN_FALL_DURATION_S = 1.08;

// 모래시계(가로 10~54, 세로 4~76)를 중심(32, 40)에서 돌려도 모서리가 잘리지 않도록
// 중심에서 가장 먼 모서리까지의 거리(약 42)보다 넉넉한 정사각형 영역을 잡는다
const HOURGLASS_VIEW_BOX = '-12 -4 88 88';

// 위, 아래 유리 안쪽 모양. 모래는 이 모양으로 잘라 유리 밖으로 넘치지 않게 한다
// 두 모양이 중심(32, 40)에 대해 대칭이라, 뒤집은 직후 아래 모래가 곧바로 다음 주기의 위 모래와 겹친다
const TOP_BULB_PATH = 'M17 10 C17 23 30 31 31 39 L33 39 C34 31 47 23 47 10 Z';
const BOTTOM_BULB_PATH =
  'M17 70 C17 57 30 49 31 41 L33 41 C34 49 47 57 47 70 Z';
// 떨어진 모래가 가운데로 쌓이도록 위가 봉긋한 더미 모양
const BOTTOM_SAND_PILE_PATH = 'M14 70 L14 50 Q32 34 50 50 L50 70 Z';

/**
 * 사회자가 토론을 공유하기 전까지 청중 화면에 토론 시작 대기 안내를 표시합니다.
 * 위쪽 모래가 한 알씩 아래로 떨어져 쌓이고, 다 떨어지면 모래시계를 뒤집어
 * 화면이 멈춘 것이 아니라 기다리는 중임을 알립니다.
 */
export default function DebateWaitingNotice({
  message,
}: DebateWaitingNoticeProps) {
  const shouldReduceMotion = useReducedMotion();

  const cycleTransition = {
    duration: CYCLE_DURATION_S,
    times: [0, FLOW_END, FLIP_START, 1],
    repeat: Infinity,
    ease: 'linear' as const,
  };

  return (
    <div
      role="status"
      className="flex h-full w-full flex-col items-center justify-center gap-6"
    >
      <svg
        data-testid="audience-waiting-icon"
        viewBox={HOURGLASS_VIEW_BOX}
        className="size-[88px] xl:size-[106px]"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="waiting-hourglass-top-bulb">
            <path d={TOP_BULB_PATH} />
          </clipPath>
          <clipPath id="waiting-hourglass-bottom-bulb">
            <path d={BOTTOM_BULB_PATH} />
          </clipPath>
        </defs>

        <motion.g
          style={{ originX: '50%', originY: '50%' }}
          animate={shouldReduceMotion ? undefined : { rotate: [0, 0, 0, 180] }}
          transition={{
            ...cycleTransition,
            ease: ['linear', 'linear', 'easeInOut'],
          }}
        >
          {/* 위쪽 모래: 표면이 목 쪽으로 내려가며 줄어든다 */}
          <g clipPath="url(#waiting-hourglass-top-bulb)">
            <motion.rect
              x="14"
              y="10"
              width="36"
              height="30"
              className="fill-brand"
              style={{ originY: 1 }}
              initial={{ scaleY: shouldReduceMotion ? 0.6 : 1 }}
              animate={
                shouldReduceMotion ? undefined : { scaleY: [1, 0, 0, 0] }
              }
              transition={cycleTransition}
            />
          </g>

          {/* 떨어지는 모래 알갱이: 목에서 출발해 중력처럼 점점 빨라지며 바닥에 닿는다 */}
          {!shouldReduceMotion && (
            <motion.g
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{
                ...cycleTransition,
                times: [0, FLOW_END - 0.02, FLOW_END, 1],
              }}
            >
              {SAND_GRAINS.map(({ x, delay }) => (
                <motion.circle
                  key={delay}
                  cx={32 + x}
                  cy="41"
                  r="0.9"
                  className="fill-brand"
                  animate={{ y: [0, 28], opacity: [0, 1, 1, 0] }}
                  transition={{
                    y: {
                      duration: GRAIN_FALL_DURATION_S,
                      delay,
                      repeat: Infinity,
                      ease: 'easeIn',
                    },
                    opacity: {
                      duration: GRAIN_FALL_DURATION_S,
                      delay,
                      repeat: Infinity,
                      times: [0, 0.1, 0.85, 1],
                    },
                  }}
                />
              ))}
            </motion.g>
          )}

          {/* 아래쪽 모래: 가운데가 봉긋한 더미로 바닥부터 차오른다 */}
          <g clipPath="url(#waiting-hourglass-bottom-bulb)">
            <motion.path
              d={BOTTOM_SAND_PILE_PATH}
              className="fill-brand"
              style={{ originY: 1 }}
              initial={{ scaleY: shouldReduceMotion ? 0.4 : 0 }}
              animate={
                shouldReduceMotion ? undefined : { scaleY: [0, 1, 1, 1] }
              }
              transition={cycleTransition}
            />
          </g>

          {/* 유리와 받침 */}
          <path
            d="M15 8 C15 23 29 31 29 40 C29 49 15 57 15 72 M49 8 C49 23 35 31 35 40 C35 49 49 57 49 72"
            className="stroke-gray-500"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect
            x="10"
            y="4"
            width="44"
            height="5"
            rx="2"
            className="fill-gray-500"
          />
          <rect
            x="10"
            y="71"
            width="44"
            height="5"
            rx="2"
            className="fill-gray-500"
          />
        </motion.g>
      </svg>
      <h1 className="break-keep px-4 text-center text-2xl font-bold text-gray-800 xl:text-4xl">
        {message}
      </h1>
    </div>
  );
}
