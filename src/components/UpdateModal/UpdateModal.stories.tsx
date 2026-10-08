import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor, within } from '@storybook/test';
import { ComponentProps, useEffect, useMemo } from 'react';
import { useArgs } from '@storybook/preview-api';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { useModal } from '../../hooks/useModal';
import UpdateModal from './UpdateModal';
import PatchNoteImageKorean from '../../assets/patchNote/0003_ko.png';
import PatchNoteImageEnglish from '../../assets/patchNote/0003_en.png';
import { LATEST_PATCH_NOTE } from '../../constants/patch_note';

const STORY_I18N = createInstance();
void STORY_I18N.init({
  lng: 'ko',
  fallbackLng: 'ko',
  resources: {
    ko: { translation: {} },
    en: {
      translation: {
        '디베이트 타이머에 새로운 기능이 생겼어요!':
          'New features are now available in Debate Timer!',
        '업데이트 이미지': 'Update image',
        '일주일간 보지 않기': "Don't show again for a week",
        닫기: 'Close',
      },
    },
  },
});

interface ModalPreviewProps extends ComponentProps<typeof UpdateModal> {
  language: 'ko' | 'en';
}

function ModalPreview(props: ModalPreviewProps) {
  const { language, ...modalProps } = props;
  const storyI18n = useMemo(
    () => STORY_I18N.cloneInstance({ lng: language }),
    [language],
  );
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
    onClose: props.onClose,
  });

  useEffect(() => {
    openModal();
  }, [openModal]);

  return (
    <I18nextProvider i18n={storyI18n}>
      <ModalWrapper>
        <UpdateModal {...modalProps} onClose={closeModal} />
      </ModalWrapper>
    </I18nextProvider>
  );
}

const meta: Meta<typeof UpdateModal> = {
  title: 'components/UpdateModal',
  component: UpdateModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    language: 'ko',
    docs: { story: { inline: false, iframeHeight: 900 } },
  },
  render: function Render(args, context) {
    const [, updateArgs] = useArgs();
    const handleCheckedChange = (value: boolean) => {
      updateArgs({ isChecked: value });
      args.onChecked(value);
    };
    return (
      <ModalPreview
        {...args}
        language={context.parameters.language}
        onChecked={handleCheckedChange}
      />
    );
  },
  play: async ({ canvasElement, step, args, parameters }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const closeButton = await canvas.findByRole('button', {
      name: /^닫기$|^Close$/,
    });
    const modal = canvas.getByRole('dialog');
    const image = canvas.getByRole<HTMLImageElement>('img', {
      name: /업데이트 이미지|Update image/,
    });
    await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0));
    await canvasElement.ownerDocument.fonts.ready;

    await step('화면 크기에 맞는 크기와 이미지 비율을 유지한다', async () => {
      const { innerWidth, innerHeight } = window;
      const isMobile = innerWidth < 768;
      const expectedSize = isMobile
        ? Math.min(innerWidth - 32, innerHeight - 32)
        : Math.max(
            600,
            Math.min(
              innerWidth * 0.475,
              innerHeight * (args.data.mode === 'predefined' ? 0.9 : 0.8),
              780,
            ),
          );
      const rect = modal.getBoundingClientRect();
      expect(Math.abs(rect.width - expectedSize)).toBeLessThanOrEqual(1);
      if (isMobile || args.data.mode === 'predefined') {
        expect(Math.abs(rect.height - expectedSize)).toBeLessThanOrEqual(1);
      } else {
        const imageRect = image.getBoundingClientRect();
        expect(Math.abs(imageRect.width - rect.width)).toBeLessThanOrEqual(1);
        expect(
          Math.abs(
            imageRect.height -
              (rect.width * image.naturalHeight) / image.naturalWidth,
          ),
        ).toBeLessThanOrEqual(1);
      }
      const outerRect = modal.parentElement!.getBoundingClientRect();
      expect(outerRect.width).toBeGreaterThanOrEqual(rect.width - 1);
      if (isMobile) {
        expect(rect.left).toBeGreaterThanOrEqual(15);
        expect(rect.top).toBeGreaterThanOrEqual(15);
        expect(innerWidth - rect.right).toBeGreaterThanOrEqual(15);
        expect(innerHeight - rect.bottom).toBeGreaterThanOrEqual(15);
      }
    });

    await step('이미지와 체크박스, 닫기 버튼이 겹치지 않는다', async () => {
      const checkbox = canvas.getByRole('checkbox');
      const imageRect = image.getBoundingClientRect();
      const checkboxRect = checkbox.closest('label')!.getBoundingClientRect();
      const buttonRect = closeButton.getBoundingClientRect();
      const modalRect = modal.getBoundingClientRect();
      expect(imageRect.height).toBeGreaterThan(0);
      expect(imageRect.bottom).toBeLessThanOrEqual(checkboxRect.top + 1);
      expect(checkboxRect.bottom).toBeLessThanOrEqual(buttonRect.top + 1);
      expect(buttonRect.bottom).toBeLessThanOrEqual(modalRect.bottom + 1);
      expect(image).toHaveStyle({
        objectFit:
          window.innerWidth < 768 || args.data.mode === 'predefined'
            ? 'contain'
            : 'fill',
      });
      expect(canvas.getAllByRole('button')).toHaveLength(1);
    });

    const patchNote = args.data;
    if (window.innerWidth < 768 && patchNote.mode === 'predefined') {
      await step('긴 설명을 스크롤해 끝까지 읽을 수 있다', async () => {
        const description = canvas.getByText(
          parameters.language === 'en'
            ? patchNote.descriptionEn
            : patchNote.descriptionKo,
          { normalizer: (value) => value },
        );
        const content = description.parentElement!;
        const originalScrollTop = content.scrollTop;
        try {
          content.scrollTop = content.scrollHeight;
          expect(
            description.getBoundingClientRect().bottom,
          ).toBeLessThanOrEqual(content.getBoundingClientRect().bottom + 1);
        } finally {
          content.scrollTop = originalScrollTop;
        }
      });
    }
  },
};

export default meta;

type Story = StoryObj<typeof UpdateModal>;

export const Default: Story = {
  args: {
    data: {
      version: '0000',
      titleKo: '피드백 & 투표',
      titleEn: 'Feedback & Voting',
      descriptionKo:
        '토론 종료 후 피드백 & 투표 기능으로\n다양한 서비스를 이용하세요!',
      descriptionEn:
        'Use a variety of services with feedback and voting after the debate!',
      imageKo: PatchNoteImageKorean,
      imageEn: PatchNoteImageEnglish,
      mode: 'predefined',
    },
    isChecked: false,
    onChecked: fn(),
    onClose: fn(),
  },
};

function viewport(width: number, height: number) {
  return {
    viewport: {
      viewports: {
        patchNote: {
          name: `${width} × ${height}`,
          styles: { width: `${width}px`, height: `${height}px` },
          type: width < 768 ? 'mobile' : 'desktop',
        },
      },
      defaultViewport: 'patchNote',
    },
  };
}

export const Mobile: Story = {
  args: { ...Default.args, data: LATEST_PATCH_NOTE },
  parameters: viewport(390, 844),
};

export const MobileEnglish: Story = {
  ...Mobile,
  parameters: { ...viewport(390, 844), language: 'en' },
};

export const PredefinedMobile: Story = {
  args: Default.args,
  parameters: viewport(390, 844),
};

export const SmallMobileEnglish: Story = {
  args: Default.args,
  parameters: { ...viewport(320, 568), language: 'en' },
};

export const LongContentMobileEnglish: Story = {
  args: {
    ...Default.args,
    data: {
      mode: 'predefined',
      version: 'long-content',
      imageKo: PatchNoteImageKorean,
      imageEn: PatchNoteImageEnglish,
      titleKo: '토론 종료 후 피드백과 투표 기능을 확인하세요',
      titleEn: 'Explore feedback and voting improvements after every debate',
      descriptionKo:
        '새로운 피드백과 투표 기능을 사용해 보세요.\n토론 결과를 함께 확인하고 의견을 나눌 수 있어요.\n전체 업데이트 내용을 확인하세요.',
      descriptionEn:
        'Try the new feedback and voting features after your debate.\nReview the results together and share your thoughts with everyone.\nRead the complete update and learn how to use each new feature.',
    },
  },
  parameters: { ...viewport(320, 568), language: 'en' },
};

export const MobileLandscape: Story = {
  args: Mobile.args,
  parameters: viewport(667, 375),
};

export const PredefinedLandscapeEnglish: Story = {
  args: Default.args,
  parameters: { ...viewport(667, 375), language: 'en' },
};

export const MobileBoundary: Story = {
  args: Mobile.args,
  parameters: viewport(767, 900),
};

export const DesktopBoundary: Story = {
  args: Mobile.args,
  parameters: viewport(768, 900),
};

export const Desktop: Story = {
  args: Mobile.args,
  parameters: viewport(1440, 900),
};

export const PredefinedDesktop: Story = {
  args: Default.args,
  parameters: viewport(1440, 900),
};
