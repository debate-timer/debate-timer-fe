import { useTranslation } from 'react-i18next';
import ClearableInput from '../../../../components/ClearableInput/ClearableInput';
import HeaderTitle from '../../../../components/HeaderTitle/HeaderTitle';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import { DebateInfo, StanceToString } from '../../../../type/type';

interface TableNameAndTypeProps {
  info: DebateInfo;
  isLoading: boolean;
  isEdit?: boolean;
  onInfoChange: (newInfo: DebateInfo) => void;
  onButtonClick: () => void;
}

export default function TableNameAndType(props: TableNameAndTypeProps) {
  const { t } = useTranslation();
  const {
    info,
    isEdit = false,
    onInfoChange,
    isLoading,
    onButtonClick,
  } = props;

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
            title={t('토론 정보를 {{val0}}해주세요', {
              val0: isEdit ? t('수정') : t('설정'),
            })}
          />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <section className="mx-auto grid w-full max-w-4xl grid-cols-[180px_1fr] gap-x-4 gap-y-12 p-6 md:p-8">
          <label className="flex items-center text-base font-semibold md:text-2xl">
            {t('토론 시간표 이름')}
          </label>
          <ClearableInput
            value={info.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onClear={() => clearField('name')}
            placeholder={t('시간표 1')}
            disabled={isLoading}
          />

          <label className="flex items-center text-base font-semibold md:text-2xl">
            {t('토론 주제')}
          </label>
          <ClearableInput
            value={info.agenda}
            onChange={(e) => handleFieldChange('agenda', e.target.value)}
            onClear={() => clearField('agenda')}
            placeholder={t('토론 주제를 입력해주세요')}
            disabled={isLoading}
          />

          <>
            <label className="flex items-center text-base font-semibold md:text-2xl">
              {t('팀명')}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </>
        </section>
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div className="mx-auto mb-8 w-full max-w-4xl">
          <button
            disabled={isLoading}
            onClick={() => {
              const pros = info.prosTeamName || '';
              const cons = info.consTeamName || '';

              const isTooLong = pros.length > 8 || cons.length > 8;

              if (isTooLong) {
                alert(t('팀명은 최대 8자까지 입력할 수 있습니다.'));
                return;
              }

              const updatedInfo = {
                ...info,
                name: info.name || t('시간표 1'),
                prosTeamName: info.prosTeamName || t('찬성'),
                consTeamName: info.consTeamName || t('반대'),
              };

              onInfoChange(updatedInfo);
              onButtonClick();
            }}
            className="button enabled brand w-full rounded-full"
          >
            {t('다음')}
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>
    </DefaultLayout>
  );
}
