import DebatePanel from '../DebatePanel/DebatePanel';
import CustomizeDebatePanel from '../DebatePanel/CustomizeDebatePanel';
import TimerCreationButton from '../TimerCreationButton/TimerCreationButton';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import { useModal } from '../../../../hooks/useModal';
import { ParliamentaryTimeBoxInfo } from '../../../../type/type';
import { useDragAndDrop } from '../../../../hooks/useDragAndDrop';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../../../components/ProsAndConsTitle/PropsAndConsTitle';
import { TableFormData, TimeBoxInfo } from '../../hook/useTableFrom';
import HeaderTableInfo from '../../../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../../../components/HeaderTitle/HeaderTitle';
import { CustomizeTimeBoxInfo } from '../../../../type/type';
import CustomizeTimerCreationContent from '../TimerCreationContent/CustomizeTimerCreationContent';

interface TimeBoxStepProps {
  initData: TableFormData;
  onTimeBoxChange: React.Dispatch<React.SetStateAction<TimeBoxInfo[]>>;
  onButtonClick: () => void;
  isEdit?: boolean;
}
// customize 타입가드
function isCustomize(
  info: TableFormData['info'],
): info is Extract<TableFormData, { info: { type: 'CUSTOMIZE' } }>['info'] {
  return info.type === 'CUSTOMIZE';
}

export default function TimeBoxStep(props: TimeBoxStepProps) {
  const { initData, onTimeBoxChange, onButtonClick, isEdit = false } = props;
  const initTimeBox = initData.table;
  const { openModal, closeModal, ModalWrapper } = useModal();

  const { handleMouseDown, getDraggingStyles, DragAndDropWrapper } =
    useDragAndDrop({
      data: initTimeBox,
      setData: onTimeBoxChange,
      throttleDelay: 50,
    });

  const handleSubmitEdit = (indexToEdit: number, updatedInfo: TimeBoxInfo) => {
    onTimeBoxChange((prevData) =>
      prevData.map((item, index) =>
        index === indexToEdit ? updatedInfo : item,
      ),
    );
  };

  const handleSubmitDelete = (indexToRemove: number) => {
    onTimeBoxChange((prevData) =>
      prevData.filter((_, index) => index !== indexToRemove),
    );
  };

  const isAbledSummitButton = initTimeBox.length !== 0;

  // 타임박스 렌더링 분기 처리
  const renderTimeBoxItem = (info: TimeBoxInfo, index: number) => {
    if (isCustomize(initData.info)) {
      return (
        <CustomizeDebatePanel
          key={index}
          info={info as CustomizeTimeBoxInfo}
          onSubmitEdit={(updatedInfo) => handleSubmitEdit(index, updatedInfo)}
          prosTeamName={initData.info.prosTeamName}
          consTeamName={initData.info.consTeamName}
          onSubmitDelete={() => handleSubmitDelete(index)}
          onMouseDown={() => handleMouseDown(index)}
        />
      );
    }
    return (
      <DebatePanel
        key={index}
        info={info as ParliamentaryTimeBoxInfo}
        onSubmitEdit={(updatedInfo) => handleSubmitEdit(index, updatedInfo)}
        onSubmitDelete={() => handleSubmitDelete(index)}
        onMouseDown={() => handleMouseDown(index)}
      />
    );
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <HeaderTableInfo
            name={initData.info.name}
            type={initData.info.type}
          />
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <HeaderTitle title={initData.info.agenda} />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <section className="mx-auto flex w-full max-w-4xl flex-col justify-center">
          {isCustomize(initData.info) ? (
            <PropsAndConsTitle
              prosTeamName={initData.info.prosTeamName}
              consTeamName={initData.info.consTeamName}
            />
          ) : (
            <PropsAndConsTitle />
          )}

          <DragAndDropWrapper>
            {initTimeBox.map((info, index) => (
              <div key={index + info.stance} style={getDraggingStyles(index)}>
                {renderTimeBoxItem(info, index)}
              </div>
            ))}
          </DragAndDropWrapper>

          <TimerCreationButton onClick={openModal} />
        </section>
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div className="mx-auto mb-8 w-full max-w-4xl">
          <button
            onClick={onButtonClick}
            className={`h-16 w-full ${
              isAbledSummitButton ? 'button enabled' : 'button disabled'
            }`}
            disabled={!isAbledSummitButton}
          >
            {isEdit ? '시간표 수정 완료' : '시간표 추가하기'}
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>

      {isCustomize(initData.info) ? (
        <ModalWrapper closeButtonColor="text-neutral-1000">
          <CustomizeTimerCreationContent
            beforeData={
              initTimeBox[initTimeBox.length - 1] as CustomizeTimeBoxInfo
            }
            prosTeamName={initData.info.prosTeamName}
            consTeamName={initData.info.consTeamName}
            onSubmit={(data) => {
              onTimeBoxChange((prev) => [...prev, data]);
            }}
            onClose={closeModal}
          />
        </ModalWrapper>
      ) : (
        <ModalWrapper>
          <TimerCreationContent
            beforeData={
              initTimeBox[initTimeBox.length - 1] as ParliamentaryTimeBoxInfo
            }
            onSubmit={(data) => {
              onTimeBoxChange((prev) => [...prev, data]);
            }}
            onClose={closeModal}
          />
        </ModalWrapper>
      )}
    </DefaultLayout>
  );
}
