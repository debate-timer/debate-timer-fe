import ClearableInput from '../../../../components/ClearableInput/ClearableInput';
import HeaderTitle from '../../../../components/HeaderTitle/HeaderTitle';
import LabeledCheckbox from '../../../../components/LabledCheckBox/LabeledCheckbox';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import { DetailDebateInfo, Type } from '../../../../type/type';
import DropdownForDebateType from '../DropdownForDebateType/DropdownForDebateType';

type ExtendedDebateInfo = DetailDebateInfo & {
  type: Type;
};
interface TableNameAndTypeProps {
  info: ExtendedDebateInfo;
  isEdit?: boolean;
  onInfoChange: (newInfo: ExtendedDebateInfo) => void;
  onButtonClick: () => void;
}

type ExtendedDebateInfoField = keyof ExtendedDebateInfo;
type ExtendedDebateInfoValue = ExtendedDebateInfo[ExtendedDebateInfoField];

export default function TableNameAndType(props: TableNameAndTypeProps) {
  const { info, isEdit = false, onInfoChange, onButtonClick } = props;

  const handleFieldChange = (
    field: ExtendedDebateInfoField,
    value: ExtendedDebateInfoValue,
  ) => {
    onInfoChange({
      ...info,
      [field]: value,
    });
  };

  const clearField = (field: 'name' | 'agenda') => {
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
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <section className="mx-auto grid w-full max-w-4xl grid-cols-[180px_1fr] gap-x-4 gap-y-12 p-6 md:p-8">
          <label className="flex items-center text-base font-semibold md:text-2xl">
            토론 시간표 이름
          </label>
          <ClearableInput
            value={info.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onClear={() => clearField('name')}
            placeholder="테이블 1"
          />

          <label className="flex items-center text-base font-semibold md:text-2xl">
            토론 주제
          </label>
          <ClearableInput
            value={info.agenda}
            onChange={(e) => handleFieldChange('agenda', e.target.value)}
            onClear={() => clearField('agenda')}
            placeholder="토론 주제를 입력해주세요"
          />
          {!isEdit && (
            <>
              <label className="flex items-center text-base font-semibold md:text-2xl">
                토론 유형
              </label>
              <DropdownForDebateType
                type={info.type}
                onChange={(selectedType) =>
                  handleFieldChange('type', selectedType)
                }
              />
            </>
          )}

          <label className="text-base font-semibold md:text-2xl">
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
              if (info.name === '') {
                onInfoChange({
                  ...info,
                  name: '템플릿 1',
                });
              }
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
