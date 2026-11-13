import { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import TemplateListPage from './TemplateListPage';
import { ApiUrl } from '../../apis/endpoints';
import { allHandlers } from '../../mocks/handlers/global';

const meta: Meta<typeof TemplateListPage> = {
  title: 'page/TemplateListPage',
  component: TemplateListPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    route: '/templates',
  },
};

export default meta;

type Story = StoryObj<typeof TemplateListPage>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(ApiUrl.organization + '/templates', async () => {
          await delay('infinite');
          return HttpResponse.json({});
        }),
        ...allHandlers,
      ],
    },
  },
};

export const Failed: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(ApiUrl.organization + '/templates', () =>
          HttpResponse.json({}, { status: 500 }),
        ),
        ...allHandlers,
      ],
    },
  },
};
