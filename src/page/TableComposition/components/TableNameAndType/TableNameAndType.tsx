import ClearableInput from '../../../../components/ClearableInput/ClearableInput';
import HeaderTitle from '../../../../components/HeaderTitle/HeaderTitle';
import LabeledCheckbox from '../../../../components/LabledCheckBox/LabeledCheckbox';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import { DebateInfo, StanceToString } from '../../../../type/type';

interface TableNameAndTypeProps {
  info: DebateInfo;
  isEdit?: boolean;
  onInfoChange: (newInfo: DebateInfo) => void;
  onButtonClick: () => void;
}

export default function TableNameAndType(props: TableNameAndTypeProps) {
  const { info, isEdit = false, onInfoChange, onButtonClick } = props;

  const handleFieldChange = <K extends keyof DebateInfo>(
    field: K,
    value: DebateInfo[K],
  ) => {
    onInfoChange({
      ...info,
      [field]: value,
    } as DebateInfo);
  };

  const clearField = (field: 'name' | 'agenda') => {
    onInfoChange({
      ...info,
      [field]: '',
    });
  };

  const clearTeamNameField = (field: 'prosTeamName' | 'consTeamName') => {
    onInfoChange({
      ...info,
      [field]: '',
    });
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center>
          <HeaderTitle
            title={`토론 정보를 ${isEdit ? '수정' : '설정'}해주세요`}
          />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right defaultIcons={['home', 'auth']} />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <section className="md:p-8 mx-auto grid w-full max-w-4xl grid-cols-[180px_1fr] gap-x-4 gap-y-12 p-6">
          <label className="md:text-2xl flex items-center text-base font-semibold">
            토론 시간표 이름
          </label>
          <ClearableInput
            value={info.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onClear={() => clearField('name')}
            placeholder="시간표 1"
          />

          <label className="md:text-2xl flex items-center text-base font-semibold">
            토론 주제
          </label>
          <ClearableInput
            value={info.agenda}
            onChange={(e) => handleFieldChange('agenda', e.target.value)}
            onClear={() => clearField('agenda')}
            placeholder="토론 주제를 입력해주세요"
          />
          <>
            <label className="md:text-2xl flex items-center text-base font-semibold">
              팀명
            </label>
            <div className="flex items-center gap-8">
              <ClearableInput
                value={info.prosTeamName || ''}
                onChange={(e) =>
                  onInfoChange({
                    ...info,
                    prosTeamName: e.target.value,
                  })
                }
                onClear={() => clearTeamNameField('prosTeamName')}
                placeholder={StanceToString['PROS']}
              />
              <span>vs.</span>
              <ClearableInput
                value={info.consTeamName || ''}
                onChange={(e) =>
                  onInfoChange({
                    ...info,
                    consTeamName: e.target.value,
                  })
                }
                onClear={() => clearTeamNameField('consTeamName')}
                placeholder={StanceToString['CONS']}
              />
            </div>
          </>

          <label className="md:text-2xl text-base font-semibold">
            종소리 설정
          </label>
          <div className="flex flex-col gap-3">
            <LabeledCheckbox
              label="발언 종료 30초 전 알림"
              checked={info.warningBell}
              onChange={(e) =>
                handleFieldChange('warningBell', e.target.checked)
              }
            />
            <LabeledCheckbox
              label="발언 종료 알림"
              checked={info.finishBell}
              onChange={(e) =>
                handleFieldChange('finishBell', e.target.checked)
              }
            />
          </div>
        </section>
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div className="mx-auto mb-8 w-full max-w-4xl">
          <button
            onClick={() => {
              const pros = info.prosTeamName || '';
              const cons = info.consTeamName || '';

              const isTooLong = pros.length > 8 || cons.length > 8;

              if (isTooLong) {
                alert('팀명은 최대 8자까지 입력할 수 있습니다.');
                return;
              }

              const updatedInfo = {
                ...info,
                name: info.name || '시간표 1',
                prosTeamName: info.prosTeamName || '찬성',
                consTeamName: info.consTeamName || '반대',
              };

              onInfoChange(updatedInfo);
              onButtonClick();
            }}
            className="button enabled h-16 w-full"
          >
            다음
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>
    </DefaultLayout>
  );
}
