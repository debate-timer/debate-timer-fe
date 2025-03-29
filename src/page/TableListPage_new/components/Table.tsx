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
}

export default function Table({
  id,
  name,
  type,
  agenda,
  onDelete,
  onEdit,
}: TableProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const bgColor = isHovered ? 'bg-brand-sub4' : 'bg-brand-main';
  const squareColor = isHovered ? 'bg-neutral-0' : 'bg-brand-sub4';
  const textBodyColor = isHovered ? 'text-neutral-0' : 'text-neutral-600';
  const textTitleColor = isHovered ? 'text-neutral-0' : 'text-neutral-1000';

  return (
    <>
      <div
        className={`flex h-[220px] w-[340px] flex-row rounded-2xl ${bgColor} transition-all duration-300`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left component (fixed width) */}
        <div
          className={`transform transition-all duration-300 ${
            isHovered
              ? 'w-24 translate-x-0 opacity-100'
              : 'w-0 -translate-x-10 opacity-0'
          } flex h-full flex-col justify-between overflow-hidden rounded-lg py-4 ps-4`}
        >
          <div className="flex flex-row space-x-1">
            <button
              onClick={() => {
                onEdit();
              }}
              className="rounded-sm bg-neutral-0 p-[2px]"
              aria-label="수정하기"
            >
              <RiEditFill className="text-neutral-900" />
            </button>
            <button
              onClick={() => {
                openModal();
              }}
              className="rounded-sm bg-neutral-0 p-[2px]"
              aria-label="삭제하기"
            >
              <RiDeleteBinFill className="text-neutral-900" />
            </button>
          </div>

          <div className="my-8 flex size-[40px] items-center justify-center rounded-full bg-neutral-1000">
            <IoArrowForward className="size-[24px] text-neutral-0" />
          </div>
        </div>

        {/* Right component (fills remaining space) */}
        <div className="flex-grow self-center overflow-hidden truncate rounded-lg py-2 pe-8 ps-6">
          <h1
            className={`text-[28px] font-bold ${textTitleColor} duration-300`}
          >
            {name}
          </h1>
          <div className={`my-3 size-[10px] duration-300 ${squareColor}`}></div>
          <p className={`text-[16px] duration-300 ${textBodyColor}`}>
            유형 | {typeMapping[type]}
          </p>
          <p
            className={`text-[16px] duration-300 ${textBodyColor} overflow-hidden text-ellipsis whitespace-nowrap`}
          >
            주제 | {agenda}
          </p>
        </div>
      </div>

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
