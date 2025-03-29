import { useState } from 'react';
import { typeMapping } from '../../../constants/languageMapping';
import { DebateTable } from '../../../type/type';
import { IoArrowForward } from 'react-icons/io5';
import { RiDeleteBinFill, RiEditFill } from 'react-icons/ri';
import { useModal } from '../../../hooks/useModal';
import DialogModal from '../../../components/DialogModal/DialogModal';

interface TableProps extends DebateTable {
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export default function Table({
  name,
  type,
  agenda,
  onDelete,
  onEdit,
  onClick,
}: TableProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const bgColor = isHovered ? 'bg-brand-sub4' : 'bg-brand-main';
  const squareColor = isHovered ? 'bg-neutral-0' : 'bg-brand-sub4';
  const textBodyColor = isHovered ? 'text-neutral-0' : 'text-neutral-600';
  const textTitleColor = isHovered ? 'text-neutral-0' : 'text-neutral-1000';
  const psClass = isHovered ? 'ps-12' : 'ps-0';

  return (
    <>
      <button
        className={`m-5 flex h-[220px] w-[340px] items-center overflow-hidden rounded-[28px] ${bgColor} shadow-lg transition-all duration-300 hover:scale-105`}
        onClick={() => onClick()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid="table"
      >
        {/* Left component (fixed width, slides in) */}
        <div
          className={`transform transition-all duration-300 ${
            isHovered
              ? 'w-24 translate-x-0 opacity-100'
              : 'w-0 -translate-x-10 opacity-0'
          } flex h-full flex-col items-center justify-between overflow-hidden pb-12 pe-4 ps-8 pt-4`}
        >
          <div className="flex flex-row space-x-1">
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-sm bg-neutral-0 p-[2px]"
              aria-label="수정하기"
            >
              <RiEditFill className="text-neutral-900" />
            </button>
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                openModal();
              }}
              className="rounded-sm bg-neutral-0 p-[2px]"
              aria-label="삭제하기"
            >
              <RiDeleteBinFill className="text-neutral-900" />
            </button>
          </div>

          <div className="flex size-[40px] items-center justify-center rounded-full bg-neutral-1000">
            <IoArrowForward className="size-[24px] text-neutral-0" />
          </div>
        </div>

        {/* Right component (fills remaining space) */}
        <div
          className={`flex flex-grow flex-col items-start overflow-hidden ${psClass} pe-8 duration-300`}
        >
          <h1
            className={`text-[28px] font-bold ${textTitleColor} w-full truncate text-start duration-300`}
          >
            {name}
          </h1>
          <div
            className={`my-3 size-[10px] text-start duration-300 ${squareColor}`}
          ></div>
          <p
            className={`text-start text-[16px] duration-300 ${textBodyColor} w-full truncate text-start`}
          >
            유형 | {typeMapping[type]}
          </p>
          <h1
            className={`text-[16px] duration-300 ${textBodyColor} w-full truncate text-start`}
          >
            주제 | {agenda}
          </h1>
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
            <h1 className="text-xl font-bold">테이블을 삭제할까요?</h1>
            <h1 className="text-sm">{name}</h1>
          </div>
        </DialogModal>
      </ModalWrapper>
    </>
  );
}
