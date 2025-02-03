import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { IoHourglassOutline } from 'react-icons/io5';
import { LuKeyboard } from 'react-icons/lu';
import { MdOutlineTimer } from 'react-icons/md';

interface FirstUseToolTipProps {
  onClose: () => void;
}

interface FirstUseToolTipContentProps {
  onClose: () => void;
  setHeight: (height: number) => void;
}

interface FirstUseToolTipBackgroundProps {
  height: string | number;
}

export default function FirstUseToolTip({ onClose }: FirstUseToolTipProps) {
  const [height, setHeight] = useState<string | number>('auto');

  return (
    <div className="relative">
      <FirstUseToolTipBackground height={height} />
      <FirstUseToolTipContent
        setHeight={(value) => setHeight(value)}
        onClose={() => onClose()}
      />
    </div>
  );
}

function FirstUseToolTipBackground({ height }: FirstUseToolTipBackgroundProps) {
  return (
    <div
      className="absolute inset-0 z-10 rounded-2xl bg-slate-900 opacity-80"
      style={{ height }}
    ></div>
  );
}

function FirstUseToolTipContent({
  setHeight,
  onClose,
}: FirstUseToolTipContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [ref, setHeight]);

  return (
    <div className="relative z-20 flex flex-col space-y-6 p-6">
      <div className="flex flex-col text-slate-50">
        <div className="mb-2 flex flex-row items-center space-x-4">
          <MdOutlineTimer size={18} />
          <h1 className="text-xl font-bold">타이머 조작</h1>
        </div>

        <div className="text-m flex flex-col space-y-1 md:text-lg">
          <ListItem>초록색 시작 버튼을 눌러 타이머를 시작</ListItem>
          <ListItem>
            타이머가 동작 중일 때, 주황색 일시정지 버튼을 눌러 타이머를 일시정지
          </ListItem>
          <ListItem>
            붉은색 초기화 버튼을 눌러 타이머를 원래 시간으로 초기화
          </ListItem>
          <ListItem>
            작전 시간 사용 버튼을 눌러 별도의 작전 시간 타이머 사용 가능
          </ListItem>
        </div>
      </div>

      <div className="flex flex-col space-y-1 text-slate-50">
        <div className="mb-2 flex flex-row items-center space-x-4">
          <LuKeyboard size={18} />
          <h1 className="text-xl font-bold">키보드 조작</h1>
        </div>

        <div className="text-m flex flex-col space-y-1 md:text-lg">
          <ListItem>스페이스 바로 타이머를 시작 및 일시정지</ListItem>
          <ListItem>R 키로 타이머 초기화</ListItem>
          <ListItem>좌우 방향키로 이전/다음 차례로 이동</ListItem>
        </div>
      </div>

      <div className="flex flex-col space-y-1 text-slate-50">
        <div className="mb-2 flex flex-row items-center space-x-4">
          <IoHourglassOutline size={18} />
          <h1 className="text-xl font-bold">작전 시간 총량이 정해진 경우</h1>
        </div>

        <div className="text-m flex flex-col space-y-1 md:text-lg">
          <ListItem>
            타이머의 초기화 버튼 왼쪽의 &#39;작전 시간 사용&#39; 버튼을 눌러,
            별도의 작전 시간 타이머를 열 수 있음
          </ListItem>
          <ListItem>
            찬성 또는 반대 측에서 작전 시간을 요청할 경우 사용
          </ListItem>
          <ListItem>
            각 팀에서 요청한 작전 시간 만큼 타이머를 설정할 수 있음 (±30초,
            ±10초 단위)
          </ListItem>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="w-fit justify-end rounded-2xl bg-slate-50 px-6 py-2 font-bold text-slate-900 hover:bg-slate-300"
          onClick={() => onClose()}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function ListItem(props: PropsWithChildren) {
  const { children } = props;

  return (
    <div className="flex flex-row items-start space-x-2">
      <p>&#8226;</p>
      <div className="flex flex-wrap">{children}</div>
    </div>
  );
}
