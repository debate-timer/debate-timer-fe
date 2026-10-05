import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import {
  ImageOnlyPatchNoteData,
  PatchNoteData,
  PredefinedPatchNoteData,
} from '../../constants/patch_note';
import UpdateModal from './UpdateModal';

const translations = {
  ko: {
    translation: {
      '디베이트 타이머에 새로운 기능이 생겼어요!':
        '디베이트 타이머에 새로운 기능이 생겼어요!',
      '업데이트 이미지': '업데이트 이미지',
      '일주일간 보지 않기': '일주일간 보지 않기',
      닫기: '닫기',
    },
  },
  en: {
    translation: {
      '디베이트 타이머에 새로운 기능이 생겼어요!':
        'New features are now available in Debate Timer!',
      '업데이트 이미지': 'Update image',
      '일주일간 보지 않기': "Don't show again for a week",
      닫기: 'Close',
    },
  },
};

const predefinedPatchNote = {
  mode: 'predefined',
  version: 'test-predefined',
  imageKo: '/patch-note-ko.png',
  imageEn: '/patch-note-en.png',
  titleKo: '한국어 제목',
  titleEn: 'English title',
  descriptionKo: '한국어 설명',
  descriptionEn: 'English description',
} satisfies PredefinedPatchNoteData;

const imageOnlyPatchNote: ImageOnlyPatchNoteData = {
  mode: 'image-only',
  version: 'test-image-only',
  imageKo: '/patch-note-only-ko.png',
  imageEn: '/patch-note-only-en.png',
};

interface RenderOptions {
  isChecked?: boolean;
  onChecked?: (value: boolean) => void;
  onClose?: () => void;
}

async function renderUpdateModal(
  data: PatchNoteData,
  language: 'ko' | 'en',
  {
    isChecked = false,
    onChecked = vi.fn(),
    onClose = vi.fn(),
  }: RenderOptions = {},
) {
  const i18n = createInstance();
  await i18n.init({
    lng: language,
    fallbackLng: 'ko',
    supportedLngs: ['ko', 'en'],
    resources: translations,
  });

  return render(
    <I18nextProvider i18n={i18n}>
      <UpdateModal
        data={data}
        isChecked={isChecked}
        onChecked={onChecked}
        onClose={onClose}
      />
    </I18nextProvider>,
  );
}

const modes = [
  { mode: 'predefined', data: predefinedPatchNote },
  { mode: 'image-only', data: imageOnlyPatchNote },
];

describe('UpdateModal', () => {
  it.each([
    {
      language: 'ko' as const,
      image: '/patch-note-ko.png',
      imageAlt: '업데이트 이미지',
      title: '한국어 제목',
      description: '한국어 설명',
      introduction: '디베이트 타이머에 새로운 기능이 생겼어요!',
      hideForWeek: '일주일간 보지 않기',
      closeButton: '닫기',
    },
    {
      language: 'en' as const,
      image: '/patch-note-en.png',
      imageAlt: 'Update image',
      title: 'English title',
      description: 'English description',
      introduction: 'New features are now available in Debate Timer!',
      hideForWeek: "Don't show again for a week",
      closeButton: 'Close',
    },
  ])(
    'predefined 모드에서 $language 콘텐츠를 표시한다',
    async ({
      language,
      image,
      imageAlt,
      title,
      description,
      introduction,
      hideForWeek,
      closeButton,
    }) => {
      await renderUpdateModal(predefinedPatchNote, language);

      expect(screen.getByRole('img', { name: imageAlt })).toHaveAttribute(
        'src',
        image,
      );
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
      expect(screen.getByText(introduction)).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: hideForWeek }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: closeButton }),
      ).toBeInTheDocument();
    },
  );

  it.each([
    {
      language: 'ko' as const,
      image: '/patch-note-only-ko.png',
      imageAlt: '업데이트 이미지',
      hideForWeek: '일주일간 보지 않기',
      closeButton: '닫기',
    },
    {
      language: 'en' as const,
      image: '/patch-note-only-en.png',
      imageAlt: 'Update image',
      hideForWeek: "Don't show again for a week",
      closeButton: 'Close',
    },
  ])(
    'image-only 모드에서 $language 콘텐츠를 표시한다',
    async ({ language, image, imageAlt, hideForWeek, closeButton }) => {
      await renderUpdateModal(imageOnlyPatchNote, language);

      expect(screen.getByRole('img', { name: imageAlt })).toHaveAttribute(
        'src',
        image,
      );
      expect(
        screen.getByRole('checkbox', { name: hideForWeek }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: closeButton }),
      ).toBeInTheDocument();
    },
  );

  it.each(modes)(
    '$mode 모드에서 하단 닫기 버튼 하나만 표시한다',
    async ({ data }) => {
      await renderUpdateModal(data, 'ko');

      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '자세히 보기' }),
      ).not.toBeInTheDocument();
    },
  );

  it.each(modes)(
    '$mode 모드에서 하단 닫기 버튼을 누르면 onClose를 호출한다',
    async ({ data }) => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      await renderUpdateModal(data, 'ko', { onClose });

      await user.click(screen.getByRole('button', { name: '닫기' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    { isChecked: false, expected: true },
    { isChecked: true, expected: false },
  ])(
    '체크 상태가 $isChecked일 때 문구를 누르면 onChecked($expected)를 호출한다',
    async ({ isChecked, expected }) => {
      const user = userEvent.setup();
      const onChecked = vi.fn();
      await renderUpdateModal(imageOnlyPatchNote, 'ko', {
        isChecked,
        onChecked,
      });

      await user.click(screen.getByText('일주일간 보지 않기'));

      expect(onChecked).toHaveBeenCalledWith(expected);
    },
  );

  it('image-only 모드에서 이미지, 체크박스, 닫기 버튼을 겹치지 않고 순서대로 배치한다', async () => {
    await renderUpdateModal(imageOnlyPatchNote, 'ko');

    const image = screen.getByRole('img', { name: '업데이트 이미지' });
    const checkbox = screen.getByRole('checkbox', {
      name: '일주일간 보지 않기',
    });
    const checkboxLabel = checkbox.closest('label');
    const closeButton = screen.getByRole('button', { name: '닫기' });

    expect(checkboxLabel).not.toBeNull();
    expect(image.parentElement?.nextElementSibling).toBe(checkboxLabel);
    expect(checkboxLabel?.parentElement?.nextElementSibling).toBe(closeButton);
    expect(checkboxLabel).not.toHaveClass('absolute');
    expect(closeButton).toHaveClass('h-[8.8%]', 'shrink-0');
  });
});
