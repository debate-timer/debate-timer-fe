import { Meta, StoryObj } from '@storybook/react-vite';

interface ColorItemProps {
  className: string;
  title: string;
}

const ColorItem = ({ className, title }: ColorItemProps) => {
  return (
    <div className="flex flex-row items-center justify-center space-x-4">
      <div className={`size-10 rounded-full shadow-xl ${className} `}></div>
      <p className="text-detail">{title}</p>
    </div>
  );
};

const DesignSystemSample = () => (
  <div className="flex w-fit flex-col space-y-4 p-4">
    <section className="flex flex-col items-start space-y-4 p-4">
      <h1 className="rounded-xl bg-brand p-4 text-ui-title">Typography</h1>

      <p className="text-ui-headline">Headline · 화면의 대표 제목</p>
      <p className="text-ui-title">Title · 구역·내용 묶음의 제목</p>
      <p className="text-ui-body">Body · 본문</p>
      <p className="text-ui-label">Label · 짧은 조작·항목 이름</p>
      <p className="text-ui-caption">Caption · 보조 설명</p>
    </section>

    <section className="flex flex-col items-start space-y-4 p-4">
      <h1 className="rounded-xl bg-brand p-4 text-ui-title">Colors</h1>
      <ColorItem className={'bg-team-blue'} title="찬성" />
      <ColorItem className={'bg-team-red'} title="반대" />
      <ColorItem className={'bg-brand'} title="브랜드" />
      <ColorItem className={'bg-brand-hover'} title="브랜드 (호버)" />
      <ColorItem className={'bg-semantic-warning'} title="10초 경고" />
      <ColorItem className={'bg-semantic-error'} title="오류" />
      <ColorItem
        className={'bg-default-disabled-hover'}
        title="비활성화 또는 호버"
      />
      <ColorItem
        className={'bg-default-neutral'}
        title="작전 시간 (중립 타임박스)"
      />
      <ColorItem className={'bg-default-dim'} title="Dim" />
      <ColorItem className={'bg-default-border'} title="테두리" />
      <ColorItem className={'bg-default-timeout'} title="0초 경고" />
      <ColorItem className={'bg-default-white'} title="기본 하양" />
      <ColorItem className={'bg-default-black'} title="기본 검정" />
    </section>
  </div>
);

const meta: Meta<typeof DesignSystemSample> = {
  title: 'Design System/DesignSystemSample',
  component: DesignSystemSample,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DesignSystemSample>;

export const Default: Story = {
  args: {},
  render: () => <DesignSystemSample />,
};
