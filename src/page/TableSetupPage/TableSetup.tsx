import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';

export default function TableSetup() {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>헤더</DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>의회식</DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right>wpahr</DefaultLayout.Header.Right>
      </DefaultLayout.Header>
      <DefaultLayout.ContentContanier>테이블</DefaultLayout.ContentContanier>
      <DefaultLayout.FixedFooterWrapper>
        <button className="h-20 w-screen bg-amber-300">버튼</button>
      </DefaultLayout.FixedFooterWrapper>
    </DefaultLayout>
  );
}
