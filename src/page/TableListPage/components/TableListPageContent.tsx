import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';
import { useDeleteDebateTable } from '../../../hooks/mutations/useDeleteDebateTable';
import { useGetDebateTableList } from '../../../hooks/query/useGetDebateTableList';
import { DebateTable } from '../../../type/type';
import Table from './Table';

export default function TableListPageContent() {
  const { i18n } = useTranslation();
  const { data } = useGetDebateTableList();
  const { mutate: deleteCustomizeTable } = useDeleteDebateTable();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  // TODO: have to delete the query param 'type'
  const onEdit = (tableId: number) => {
    navigate(
      buildLangPath(
        `/composition?mode=edit&tableId=${tableId}&type=CUSTOMIZE`,
        lang,
      ),
    );
  };
  // TODO: have to delete the string 'customize' from the URL
  const onClick = (tableId: number) => {
    navigate(buildLangPath(`/overview/customize/${tableId}`, lang));
  };
  const onDelete = (tableId: number) => {
    deleteCustomizeTable({ tableId });
  };

  return (
    <div className="flex max-w-[1140px] flex-wrap justify-start">
      {/** Button that adds new table */}
      <button
        onClick={() => navigate(buildLangPath(`/composition?mode=add`, lang))}
        className="m-5 h-[220px] w-[340px] rounded-[28px] bg-neutral-200 shadow-lg duration-200 hover:scale-105"
      >
        <h1 className="text-[100px] font-light text-neutral-500">+</h1>
      </button>

      {/** All tables */}
      {data &&
        data.tables.map((table: DebateTable) => (
          <Table
            key={table.id}
            id={table.id}
            name={table.name}
            agenda={table.agenda}
            onDelete={() => onDelete(table.id)}
            onEdit={() => onEdit(table.id)}
            onClick={() => onClick(table.id)}
          />
        ))}
    </div>
  );
}
