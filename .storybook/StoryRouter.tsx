import { ComponentType, createContext, useContext, useMemo } from 'react';
import {
  createMemoryRouter,
  parsePath,
  RouterProvider,
} from 'react-router-dom';

// 라우터는 경로 설정이 바뀔 때만 만들고, 매 렌더의 Story는 context로 전달해 args 변경을 반영합니다.
const StoryElementContext = createContext<{ Story: ComponentType } | null>(
  null,
);

function StoryOutlet() {
  const value = useContext(StoryElementContext);
  return value ? <value.Story /> : null;
}

interface StoryRouterProps {
  Story: ComponentType;
  route: string;
  routeState?: unknown;
  routePattern?: string;
}

// useBlocker 같은 data router 전용 API를 쓰는 화면도 렌더링되도록 data router로 감쌉니다.
export default function StoryRouter({
  Story,
  route,
  routeState,
  routePattern,
}: StoryRouterProps) {
  const router = useMemo(
    () =>
      createMemoryRouter(
        [
          // routePattern이 지정된 경우에만 URL 파라미터를 추출합니다.
          ...(routePattern
            ? [{ path: routePattern, element: <StoryOutlet /> }]
            : []),
          { path: '*', element: <StoryOutlet /> },
        ],
        {
          // 객체의 pathname은 다시 파싱되지 않으므로 검색어·해시를 먼저 분리합니다.
          initialEntries: [{ ...parsePath(route), state: routeState }],
        },
      ),
    [route, routeState, routePattern],
  );

  return (
    <StoryElementContext.Provider value={{ Story }}>
      <RouterProvider router={router} />
    </StoryElementContext.Provider>
  );
}
