import ColorItem from './ColorItem';

export default function DesignSystemSample() {
  return (
    <div className="flex w-fit flex-col space-y-4 p-4">
      <section className="flex flex-col items-start space-y-4 p-4">
        <h1 className="text-title rounded-xl bg-brand p-4">Typography</h1>

        <p className="text-display">대제목</p>
        <p className="text-title">제목</p>
        <p className="text-subtitle">부제목</p>
        <p className="text-detail">세부사항</p>
        <p className="text-body">내용</p>
      </section>

      <section className="flex flex-col items-start space-y-4 p-4">
        <h1 className="text-title rounded-xl bg-brand p-4">Colors</h1>
        <ColorItem className={'bg-team-blue'} title="찬성" />
        <ColorItem className={'bg-team-red '} title="반대" />
        <ColorItem className={'bg-brand '} title="브랜드" />
        <ColorItem className={'bg-brand-hover '} title="브랜드 (호버)" />
        <ColorItem className={'bg-semantic-warning '} title="10초 경고" />
        <ColorItem className={'bg-semantic-error '} title="오류" />
        <ColorItem
          className={'bg-default-disabled/hover '}
          title="비활성화 또는 호버"
        />
        <ColorItem
          className={'bg-default-neutral '}
          title="작전 시간 (중립 타임박스)"
        />
        <ColorItem className={'bg-default-dim '} title="Dim" />
        <ColorItem className={'bg-default-border '} title="테두리" />
        <ColorItem className={'bg-default-timeout '} title="0초 경고" />
        <ColorItem className={'bg-default-white '} title="기본 하양" />
        <ColorItem className={'bg-default-black '} title="기본 검정" />
      </section>
    </div>
  );
}
