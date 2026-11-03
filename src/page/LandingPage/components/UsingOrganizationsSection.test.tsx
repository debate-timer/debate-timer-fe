import { render, screen } from '@testing-library/react';
import UsingOrganizationsSection from './UsingOrganizationsSection';

describe('사용 조직 섹션', () => {
  it('조직 이름과 로고를 흐르는 목록으로 보여 준다', () => {
    render(
      <UsingOrganizationsSection
        organizations={[
          { name: '조직 가', logo: '/a.png' },
          { name: '조직 나', logo: null },
        ]}
      />,
    );

    const region = screen.getByRole('region', {
      name: '이미 많은 토론 현장에서 쓰고 있어요',
    });
    expect(region).toHaveTextContent('조직 가');
    expect(region).toHaveTextContent('조직 나');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
