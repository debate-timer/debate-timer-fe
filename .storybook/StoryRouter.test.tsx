import { render, screen } from '@testing-library/react';
import { useLocation, useParams } from 'react-router-dom';
import StoryRouter from './StoryRouter';

function LocationStory() {
  const { id } = useParams();
  const { pathname, search, hash, state } = useLocation();
  return (
    <p>{JSON.stringify({ id: id ?? null, pathname, search, hash, state })}</p>
  );
}

describe('Storybook 라우터(StoryRouter)는', () => {
  it('route의 검색어와 해시를 경로와 분리해 routePattern의 파라미터를 추출한다', () => {
    render(
      <StoryRouter
        Story={LocationStory}
        route="/vote/7?mode=preview#result"
        routeState={{ from: 'story' }}
        routePattern="/vote/:id"
      />,
    );

    expect(
      screen.getByText(
        JSON.stringify({
          id: '7',
          pathname: '/vote/7',
          search: '?mode=preview',
          hash: '#result',
          state: { from: 'story' },
        }),
      ),
    ).toBeInTheDocument();
  });

  it('routePattern이 없으면 모든 경로에서 Story를 렌더링한다', () => {
    render(<StoryRouter Story={LocationStory} route="/anything" />);

    expect(screen.getByText(/"pathname":"\/anything"/)).toBeInTheDocument();
  });
});
