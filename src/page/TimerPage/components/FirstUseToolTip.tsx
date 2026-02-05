import { Trans, useTranslation } from 'react-i18next';
import { PropsWithChildren } from 'react';
import { LuKeyboard } from 'react-icons/lu';
import { MdOutlineTimer } from 'react-icons/md';
import { RiFullscreenExitFill, RiFullscreenFill } from 'react-icons/ri';

// z-index
// - 30: Tooltip

interface FirstUseToolTipProps {
  onClose: () => void;
}

export default function FirstUseToolTip({ onClose }: FirstUseToolTipProps) {
  const { t } = useTranslation();
  return (
    <div
      data-testid="tooltip"
      className="flex w-max flex-col space-y-6 bg-neutral-900 p-6"
    >
      <div className="flex flex-col text-neutral-50">
        <div className="mb-2 flex flex-row items-center space-x-4">
          <MdOutlineTimer size={18} />
          <h2 className="text-xl font-bold">{t('자유토론 타이머 조작')}</h2>
        </div>

        <div className="text-m flex flex-col space-y-1 md:text-lg">
          <ListItem>{t('재생 버튼을 눌러 타이머를 시작')}</ListItem>
          <ListItem>
            {t('타이머가 동작 중일 때, 일시정지 버튼을 눌러 타이머를 일시정지')}
          </ListItem>
          <ListItem>
            {t('초기화 버튼을 눌러 타이머를 원래 시간으로 초기화')}
          </ListItem>
          <ListItem>
            {t('마우스를 사용하여 타이머를 클릭 시, 진영 변경')}
          </ListItem>
          <ListItem>
            {t(
              '타이머 동작 중 진영이 변경될 경우, 상대 진영의 타이머로 전환과 동시에 시작',
            )}
          </ListItem>
        </div>
      </div>

      <div className="flex flex-col text-neutral-50">
        <div className="mb-2 flex flex-row items-center space-x-4">
          <MdOutlineTimer size={18} />
          <h2 className="text-xl font-bold">{t('일반 토론 타이머 조작')}</h2>
        </div>

        <div className="text-m flex flex-col space-y-1 md:text-lg">
          <ListItem>{t('재생 버튼을 눌러 타이머를 시작')}</ListItem>
          <ListItem>
            {t('타이머가 동작 중일 때, 일시정지 버튼을 눌러 타이머를 일시정지')}
          </ListItem>
          <ListItem>
            {t('초기화 버튼을 눌러 타이머를 원래 시간으로 초기화')}
          </ListItem>
          <ListItem>
            {t('작전 시간 사용 버튼을 눌러 별도의 작전 시간 타이머 사용 가능')}
          </ListItem>
        </div>
      </div>

      <div className="flex flex-col space-y-1 text-slate-50">
        <div className="mb-2 flex flex-row items-center space-x-4">
          <LuKeyboard size={18} />
          <h1 className="text-xl font-bold">{t('키보드 조작')}</h1>
        </div>

        <div className="text-m flex flex-col space-y-1 md:text-lg">
          <ListItem>{t('스페이스 바로 타이머를 시작 및 일시정지')}</ListItem>
          <ListItem>{t('R 키로 타이머 초기화')}</ListItem>
          <ListItem>{t('좌우 방향키로 이전/다음 차례로 이동')}</ListItem>
          <ListItem>{t('A/L 키로 토론 진영 변경')}</ListItem>
          <ListItem>{t('Enter 키로 상대 진영으로 변경')}</ListItem>
        </div>
      </div>

      <div className="flex flex-col space-y-1 text-slate-50">
        <div className="mb-2 flex flex-row items-center space-x-4">
          <RiFullscreenFill size={18} />
          <h1 className="text-xl font-bold">{t('전체 화면')}</h1>
        </div>

        <div className="text-m flex flex-col space-y-1 md:text-lg">
          <ListItem>
            <Trans
              i18nKey="화면 우측 상단 헤더의 전체 화면 버튼 <0/> 으로 활성화"
              components={[
                <RiFullscreenFill
                  key="fullscreen-icon"
                  className="mx-[2px] self-center"
                />,
              ]}
            />
          </ListItem>
          <ListItem>
            <Trans
              i18nKey="화면 우측 상단 헤더의 전체 화면 닫기 버튼 <0/> 또는 ESC 키를 눌러 전체 화면 비활성화"
              components={[
                <RiFullscreenExitFill
                  key="exit-fullscreen-icon"
                  className="mx-[2px] self-center"
                />,
              ]}
            />
          </ListItem>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          data-testid="tooltip-button"
          className="w-fit justify-end rounded-2xl bg-neutral-50 px-6 py-2 font-bold text-neutral-900 hover:bg-neutral-300"
          onClick={() => onClose()}
        >
          {t('닫기')}
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
