import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import { Type } from '../../../../type/type';
import DropdownForDebateType from '../DropdownForDebateType/DropdownForDebateType';

interface TableNameAndTypeProps {
  info: {
    name: string;
    agenda: string;
    type: Type;
    warningBell: boolean;
    finishBell: boolean;
  };
  isEdit?: boolean;
  onInfoChange: (newInfo: {
    name: string;
    agenda: string;
    type: Type;
    warningBell: boolean;
    finishBell: boolean;
  }) => void;
  onButtonClick: () => void;
}

export default function TableNameAndType(props: TableNameAndTypeProps) {
  const { info, isEdit = false, onInfoChange, onButtonClick } = props;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInfoChange({
      ...info,
      name: e.target.value,
    });
  };

  const handleAgenda = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInfoChange({
      ...info,
      agenda: e.target.value,
    });
  };

  const handleTypeChange = (type: Type) => {
    onInfoChange({
      ...info,
      type,
    });
  };

  const handleWarningBell = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInfoChange({
      ...info,
      warningBell: e.target.checked,
    });
  };

  const handleFinishBell = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInfoChange({
      ...info,
      finishBell: e.target.checked,
    });
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left></DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <div className="flex flex-wrap items-center justify-center px-2 text-2xl font-bold md:text-3xl">
            <h1>
              {isEdit ? '토론 정보를 수정해주세요' : '어떤 토론을 원하시나요?'}
            </h1>
          </div>
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right></DefaultLayout.Header.Right>
      </DefaultLayout.Header>
      <DefaultLayout.ContentContanier>
        <section className="grid w-full grid-cols-[1fr_2fr] gap-10 p-8">
          <h3 className="text-md font-bold lg:text-5xl">토론 템플릿 이름</h3>
          <input
            placeholder="테이블 1(디폴트 값)"
            className="w-full rounded-md bg-neutral-300 p-6 text-center font-semibold text-white placeholder-white lg:text-3xl"
            value={info.name}
            onChange={handleNameChange}
          />

          <h3 className="text-md font-bold lg:text-5xl">토론 주제</h3>
          <input
            placeholder="토론 주제를 입력해주세요"
            className="w-full rounded-md bg-neutral-300 p-6 text-center font-semibold text-white placeholder-white lg:text-3xl"
            value={info.agenda}
            onChange={handleAgenda}
          />

          {!isEdit && (
            <>
              <h3 className="text-md font-bold lg:text-5xl">토론 유형</h3>
              <DropdownForDebateType
                type={info.type}
                onChange={handleTypeChange}
              />
            </>
          )}

          <h3 className="text-md font-bold lg:text-5xl">종소리 설정</h3>
          <div className="flex flex-col gap-5">
            <label className="flex items-center gap-4 text-lg">
              <input
                type="checkbox"
                checked={info.warningBell}
                onChange={handleWarningBell}
                className="h-5 w-5"
              />
              발언종료 30초 전 알림
            </label>
            <label className="flex items-center gap-4 text-lg">
              <input
                type="checkbox"
                checked={info.finishBell}
                onChange={handleFinishBell}
                className="h-5 w-5"
              />
              발언종료 알림
            </label>
          </div>
        </section>
      </DefaultLayout.ContentContanier>

      <DefaultLayout.StickyFooterWrapper>
        <button
          onClick={() => {
            if (info.name === '') {
              onInfoChange({
                ...info,
                name: '테이블 1',
              });
            }
            onButtonClick();
          }}
          className="h-20 w-full bg-amber-500 text-2xl font-semibold transition duration-300 hover:bg-amber-600"
        >
          {isEdit ? '타임박스 수정하기' : '타임박스 만들기'}
        </button>
      </DefaultLayout.StickyFooterWrapper>
    </DefaultLayout>
  );
}
