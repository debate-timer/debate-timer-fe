import clsx from 'clsx';
import RoundControlButton from '../../../components/RoundControlButton/RoundControlButton';
import { TimeBoxInfo } from '../../../type/type';

interface RoundControlRowProps {
  table: TimeBoxInfo[];
  index: number;
  goToOtherItem: (isPrev: boolean) => void;
  openDoneModal: () => void;
  className?: string;
}

export default function RoundControlRow(props: RoundControlRowProps) {
  const { table, index, goToOtherItem, openDoneModal, className = '' } = props;
  return (
    <div className={clsx('flex flex-row space-x-1 xl:space-x-8', className)}>
      <div className="flex w-[175px] items-center justify-center xl:w-[200px]">
        {index !== 0 && (
          <RoundControlButton type="PREV" onClick={() => goToOtherItem(true)} />
        )}
      </div>
      <div className="flex w-[175px] items-center justify-center xl:w-[200px]">
        {index === table.length - 1 ? (
          <RoundControlButton type="DONE" onClick={openDoneModal} />
        ) : (
          <RoundControlButton
            type="NEXT"
            onClick={() => goToOtherItem(false)}
          />
        )}
      </div>
    </div>
  );
}
