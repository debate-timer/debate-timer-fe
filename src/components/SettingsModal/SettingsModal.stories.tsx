import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import SettingsModal from './SettingsModal';

const META = {
  component: SettingsModal,
  tags: ['autodocs'],
  parameters: { route: '/home' },
} satisfies Meta<typeof SettingsModal>;
export default META;
type Story = StoryObj<typeof META>;

export const Default: Story = {};

async function openAndGetScrollContext(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(await canvas.findByRole('button', { name: '설정' }));

  const dialog = await body.findByRole('dialog');
  const scrollContainer = dialog.firstElementChild;
  if (!(scrollContainer instanceof HTMLElement)) {
    throw new Error('설정 모달 내부 스크롤 컨테이너를 찾을 수 없습니다.');
  }

  return { body, dialog, scrollContainer };
}

function assertOuterDialogClipping(
  dialog: HTMLElement,
  scrollContainer: HTMLElement,
) {
  const dialogStyle = getComputedStyle(dialog);
  expect(dialogStyle.overflowX).toBe('hidden');
  expect(dialogStyle.overflowY).toBe('hidden');
  expect(dialogStyle.borderRadius).toBe('20px');
  expect(scrollContainer).not.toBe(dialog);
  expect(scrollContainer.scrollHeight).toBeGreaterThan(
    scrollContainer.clientHeight,
  );
  expect(dialog.scrollHeight).toBeLessThanOrEqual(dialog.clientHeight + 1);
}

function assertScrollToBottom(
  body: ReturnType<typeof within>,
  dialog: HTMLElement,
  scrollContainer: HTMLElement,
) {
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
  expect(scrollContainer.scrollTop).toBeGreaterThan(0);
  expect(dialog.scrollTop).toBe(0);
  const accountButton = body.getByRole('button', {
    name: /^로그인$|^로그아웃$/,
  });
  expect(accountButton.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    dialog.getBoundingClientRect().bottom + 1,
  );
}

const SHORT_VIEWPORT_CONFIG: Pick<Story, 'parameters' | 'globals'> = {
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, iframeHeight: 320 } },
    viewport: {
      options: {
        shortMobile: {
          name: '375 × 320',
          styles: { width: '375px', height: '320px' },
          type: 'mobile',
        },
      },
    },
  },
  globals: { viewport: { value: 'shortMobile', isRotated: false } },
};

export const ShortViewportScroll: Story = {
  ...SHORT_VIEWPORT_CONFIG,
  play: async ({ canvasElement, step }) => {
    const { body, dialog, scrollContainer } =
      await openAndGetScrollContext(canvasElement);

    await step(
      '스크롤 전 바깥 다이얼로그의 둥근 모서리 클리핑과 내부 스크롤 가능 상태를 확인한다',
      async () => {
        assertOuterDialogClipping(dialog, scrollContainer);
        expect(scrollContainer.scrollTop).toBe(0);
        expect(dialog.scrollTop).toBe(0);
        const heading = body.getByRole('heading', { name: '설정' });
        expect(heading.getBoundingClientRect().top).toBeGreaterThanOrEqual(
          dialog.getBoundingClientRect().top - 1,
        );
      },
    );

    await step(
      '끝까지 스크롤해도 바깥 다이얼로그는 고정되고 하단 버튼까지 도달한다',
      async () => {
        const originalScrollTop = scrollContainer.scrollTop;
        try {
          assertScrollToBottom(body, dialog, scrollContainer);
        } finally {
          scrollContainer.scrollTop = originalScrollTop;
        }
      },
    );
  },
};

export const ShortViewportScrollBottom: Story = {
  ...SHORT_VIEWPORT_CONFIG,
  play: async ({ canvasElement, step }) => {
    const { body, dialog, scrollContainer } =
      await openAndGetScrollContext(canvasElement);

    await step(
      '모달을 최하단으로 스크롤한 상태의 모서리와 하단 노출을 유지한다',
      async () => {
        assertOuterDialogClipping(dialog, scrollContainer);
        assertScrollToBottom(body, dialog, scrollContainer);
      },
    );
  },
};
