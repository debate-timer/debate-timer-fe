import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import { useNavigate, useParams } from 'react-router-dom';
import DebatePanel from '../TableComposition/components/DebatePanel/DebatePanel';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { RiEditFill, RiSpeakFill } from 'react-icons/ri';
import usePatchParliamentaryTable from '../../hooks/mutations/usePatchParliamentaryDebateTable';
import usePatchCustomizeTable from '../../hooks/mutations/usePatchCustomizeDebateTable';
import { useGetCustomizeTableData } from '../../hooks/query/useGetCustomizeTableData';
import CustomizeDebatePanel from '../TableComposition/components/DebatePanel/CustomizeDebatePanel';
import { useTableShare } from '../../hooks/useTableShare';
import { MdOutlineIosShare } from 'react-icons/md';

export default function TableOverview() {
  const { type, id } = useParams();
  const tableId = Number(id);

  const isCustomize = type === 'customize';

  const { data: customizeData } = useGetCustomizeTableData(
    tableId,
    isCustomize,
  );
  const { data: parliamentaryData } = useGetParliamentaryTableData(
    tableId,
    !isCustomize,
  );

  // 실제로 사용할 데이터
  const data = isCustomize ? customizeData : parliamentaryData;

  const navigate = useNavigate();

  // 토론하기 클릭 시 patch 요청 후 이동
  const patchParliamentaryTableMutation = usePatchParliamentaryTable(
    (tableId) => {
      navigate(`/table/parliamentary/${tableId}`);
    },
  );
  const patchCustomizeTableMutation = usePatchCustomizeTable((tableId) => {
    navigate(`/table/customize/${tableId}`);
  });

  // Hook for sharing tables
  const { openShareModal, TableShareModal } = useTableShare(tableId);

  return (
    <>
      <DefaultLayout>
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <HeaderTableInfo
              name={data?.info.name}
              type={isCustomize ? 'CUSTOMIZE' : 'PARLIAMENTARY'}
            />
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            <HeaderTitle title={data?.info.agenda} />
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
        </DefaultLayout.Header>

        <DefaultLayout.ContentContainer>
          <section className="mx-auto flex w-full max-w-4xl flex-col justify-center">
            {isCustomize && customizeData ? (
              <PropsAndConsTitle
                prosTeamName={customizeData.info.prosTeamName}
                consTeamName={customizeData.info.consTeamName}
              />
            ) : (
              <PropsAndConsTitle />
            )}

            <div className="flex w-full flex-col gap-2">
              {isCustomize && customizeData
                ? customizeData.table.map((info, index) => (
                    <CustomizeDebatePanel
                      key={index}
                      info={info}
                      prosTeamName={customizeData.info.prosTeamName}
                      consTeamName={customizeData.info.consTeamName}
                    />
                  ))
                : parliamentaryData?.table.map((info, index) => (
                    <DebatePanel key={index} info={info} />
                  ))}
            </div>
          </section>
        </DefaultLayout.ContentContainer>

        <DefaultLayout.StickyFooterWrapper>
          <div className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between gap-2">
            <button
              className="button enabled-hover-neutral h-16 w-full"
              onClick={() =>
                navigate(
                  `/composition?mode=edit&tableId=${tableId}&type=${type?.toUpperCase()}`,
                )
              }
            >
              <div className="flex items-center justify-center gap-2">
                <RiEditFill />
                수정하기
              </div>
            </button>
            <div className="flex h-16 w-full space-x-2">
              <button
                className="button enabled flex-1"
                onClick={() =>
                  isCustomize
                    ? patchCustomizeTableMutation.mutate({ tableId })
                    : patchParliamentaryTableMutation.mutate({ tableId })
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <RiSpeakFill />
                  토론하기
                </div>
              </button>

              <button
                className="button enabled-hover-neutral flex size-16 items-center justify-center"
                onClick={() => {
                  openShareModal();
                }}
              >
                <MdOutlineIosShare className="m-4 size-full" />
              </button>
            </div>
          </div>
        </DefaultLayout.StickyFooterWrapper>
      </DefaultLayout>

      <TableShareModal />
    </>
  );
}
