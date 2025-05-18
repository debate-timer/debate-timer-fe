import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import NormalTimer from './components/NormalTimer';
import { CustomizeTimeBoxInfo } from '../../type/type';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import RoundControlButton from '../../components/RoundControlButton/RoundControlButton';

export default function NormalTimerTestPage() {
  const item: CustomizeTimeBoxInfo = {
    boxType: 'NORMAL',
    speechType: '입론1',
    stance: 'PROS',
    speaker: '홍길동',
    time: 120,
    timePerTeam: null,
    timePerSpeaking: null,
  };

  return (
    <DefaultLayout>
      {/* Header */}
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <HeaderTableInfo name="테스트 테이블" type="CUSTOMIZE" />
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <HeaderTitle title="정적 타이머 테스트" />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>

      {/* Content */}
      <DefaultLayout.ContentContainer noPadding>
        <div className="flex h-full w-full flex-col items-center justify-center space-y-[40px] bg-neutral-100">
          <NormalTimer
            timer={item.time ?? 0}
            isRunning={false}
            isAdditionalTimerOn={false}
            isTimerChangeable={true}
            onChangingTimer={() => {}}
            onStart={() => {}}
            onPause={() => {}}
            onReset={() => {}}
            goToOtherItem={() => {}}
            addOnTimer={() => {}}
            isFirstItem={true}
            isLastItem={false}
            item={item}
            teamName="찬성"
          />

          {/* NEXT 버튼만 하단에 표시 */}
          <div className="flex flex-row space-x-8">
            <div className="flex h-[70px] w-[200px] items-center justify-center">
              <RoundControlButton type="PREV" onClick={() => alert('이전')} />
            </div>
            <div className="flex h-[70px] w-[200px] items-center justify-center">
              <RoundControlButton type="NEXT" onClick={() => alert('다음')} />
            </div>
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
