import { useState } from 'react';
import { DebateTable } from '../../../type/type';
import { IoArrowForward } from 'react-icons/io5';
import { useModal } from '../../../hooks/useModal';
import DialogModal from '../../../components/DialogModal/DialogModal';
import { useTableShare } from '../../../hooks/useTableShare';
import SmallIconContainer from '../../../components/SmallIconContainer/SmallIconContainer';
import DTEdit from '../../../components/icons/Edit';
import DTDelete from '../../../components/icons/Delete';
import DTShare from '../../../components/icons/Share';

interface TableProps extends DebateTable {
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export default function Table({
  id,
  name,
  agenda,
  onDelete,
  onEdit,
  onClick,
}: TableProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { openShareModal, TableShareModal } = useTableShare(id);
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const bgColor = isHovered ? 'bg-semantic-table' : 'bg-brand';
  const squareColor = isHovered ? 'bg-default-white' : 'bg-semantic-table';
  const textBodyColor = isHovered
    ? 'text-default-white'
    : 'text-default-neutral';
  const textTitleColor = isHovered
    ? 'text-default-white'
    : 'text-default-black';
  const psClass = isHovered ? 'ps-12' : 'ps-0';

  return (
    <>
      <button
        className={`
          m-5 flex h-[220px] w-[340px] items-center overflow-hidden rounded-[28px] shadow-lg transition-all duration-300 hover:scale-105
          ${bgColor}
          ${isHovered ? 'px-4' : 'px-12'}
        `}
        onClick={() => onClick()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid="table"
      >
        {/* Left component (fixed width, slides in) */}
        <div
          className={`
            flex h-full transform flex-col items-start justify-between overflow-hidden pb-12 pt-4 transition-all duration-300
            ${isHovered ? 'w-[144px] translate-x-0 opacity-100' : 'w-0 -translate-x-10 opacity-0'}
          `}
        >
          <div className="flex flex-row space-x-1">
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="수정하기"
            >
              <SmallIconContainer className="size-[28px] p-[8px]">
                <DTEdit />
              </SmallIconContainer>
            </button>
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                openModal();
              }}
              aria-label="삭제하기"
            >
              <SmallIconContainer className="size-[28px] p-[8px]">
                <DTDelete />
              </SmallIconContainer>
            </button>
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                openShareModal();
              }}
              aria-label="공유하기"
            >
              <SmallIconContainer className="size-[28px] p-[8px]">
                <DTShare />
              </SmallIconContainer>
            </button>
          </div>

          <div className="flex size-[40px] items-center justify-center rounded-full bg-default-black">
            <IoArrowForward className="size-[24px] text-default-white" />
          </div>
        </div>

        {/* Right component (fills remaining space) */}
        <div
          className={`flex flex-grow flex-col items-start overflow-hidden ${psClass} w-full duration-300`}
        >
          <p
            className={`text-[28px] font-bold ${textTitleColor} w-full truncate text-start duration-300`}
          >
            {name}
          </p>
          <div
            className={`my-3 size-[10px] text-start duration-300 ${squareColor}`}
          ></div>
          <p
            className={`text-[16px] duration-300 ${textBodyColor} w-full truncate text-start`}
          >
            주제 | {agenda}
          </p>
        </div>
      </button>

      <ModalWrapper>
        <DialogModal
          left={{ text: '취소', onClick: () => closeModal() }}
          right={{
            text: '삭제',
            isBold: true,
            onClick: () => {
              onDelete();
              closeModal();
            },
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-2 px-16 py-8">
            <p className="text-xl font-bold">테이블을 삭제하시겠습니까?</p>
            <p className="text-sm">{name}</p>
          </div>
        </DialogModal>
      </ModalWrapper>

      <TableShareModal />
    </>
  );
}
