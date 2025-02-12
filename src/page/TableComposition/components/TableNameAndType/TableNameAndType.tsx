import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import { Type } from '../../../../type/type';
import DropdownForDebateType from '../DropdownForDebateType/DropdownForDebateType';

interface TableNameAndTypeProps {
  info: {
    name: string;
    agenda: string;
    type: Type;
  };
  isEdit?: boolean;
  onNameAndTypeChange: (newInfo: {
    name: string;
    agenda: string;
    type: Type;
  }) => void;
  onButtonClick: () => void;
}

export default function TableNameAndType(props: TableNameAndTypeProps) {
  const { info, isEdit = false, onNameAndTypeChange, onButtonClick } = props;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameAndTypeChange({
      ...info,
      name: e.target.value,
    });
  };

  const handleTypeChange = (type: Type) => {
    onNameAndTypeChange({
      ...info,
      type,
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
        <section className="flex w-full flex-col justify-center gap-14 p-8 lg:items-center">
          <div className="flex w-full items-center justify-between">
            <h3 className="text-md font-bold lg:text-5xl">토론 시간표 이름</h3>
            <input
              placeholder="테이블 1(디폴트 값)"
              className="w-8/12 rounded-md bg-neutral-300 p-6 text-center font-semibold text-white placeholder-white lg:text-3xl"
              value={info.name}
              onChange={handleNameChange}
            />
          </div>

          {!isEdit && (
            <div className="flex w-full items-center justify-between">
              <h3 className="text-md font-bold lg:text-5xl">토론 유형</h3>
              <DropdownForDebateType
                type={info.type}
                onChange={handleTypeChange}
              />
            </div>
          )}
        </section>
      </DefaultLayout.ContentContanier>

      <DefaultLayout.StickyFooterWrapper>
        <button
          onClick={() => {
            if (info.name === '') {
              onNameAndTypeChange({
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
