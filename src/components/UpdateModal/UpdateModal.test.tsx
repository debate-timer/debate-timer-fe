import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import {
  ImageOnlyPatchNoteData,
  PredefinedPatchNoteData,
} from '../../constants/patch_note';
import UpdateModal from './UpdateModal';

const translations = {
  ko: {
    translation: {
      '디베이트 타이머에 새로운 기능이 생겼어요!':
        '디베이트 타이머에 새로운 기능이 생겼어요!',
      '업데이트 이미지': '업데이트 이미지',
      '일주일 간 보지 않기': '일주일 간 보지 않기',
      '자세히 보기': '자세히 보기',
    },
  },
  en: {
    translation: {
      '디베이트 타이머에 새로운 기능이 생겼어요!':
        'New features are now available in Debate Timer!',
      '업데이트 이미지': 'Update image',
      '일주일 간 보지 않기': "Don't show again for a week",
      '자세히 보기': 'View details',
    },
  },
};

const predefinedPatchNote = {
  mode: 'predefined',
  version: 'test-predefined',
  link: 'https://example.com/predefined',
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
  link: 'https://example.com/image-only',
  imageKo: '/patch-note-only-ko.png',
  imageEn: '/patch-note-only-en.png',
};

async function renderUpdateModal(
  data: PredefinedPatchNoteData | ImageOnlyPatchNoteData,
  language: 'ko' | 'en',
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
        isChecked={false}
        onChecked={vi.fn()}
        onClose={vi.fn()}
        onClickDetailButton={vi.fn()}
      />
    </I18nextProvider>,
  );
}

describe('UpdateModal', () => {
  test.each([
    {
      language: 'ko' as const,
      image: '/patch-note-ko.png',
      imageAlt: '업데이트 이미지',
      title: '한국어 제목',
      description: '한국어 설명',
      introduction: '디베이트 타이머에 새로운 기능이 생겼어요!',
      hideForWeek: '일주일 간 보지 않기',
      detailButton: '자세히 보기',
    },
    {
      language: 'en' as const,
      image: '/patch-note-en.png',
      imageAlt: 'Update image',
      title: 'English title',
      description: 'English description',
      introduction: 'New features are now available in Debate Timer!',
      hideForWeek: "Don't show again for a week",
      detailButton: 'View details',
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
      detailButton,
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
        screen.getByRole('button', { name: detailButton }),
      ).toBeInTheDocument();
    },
  );

  test.each([
    {
      language: 'ko' as const,
      image: '/patch-note-only-ko.png',
      imageAlt: '업데이트 이미지',
      hideForWeek: '일주일 간 보지 않기',
      detailButton: '자세히 보기',
    },
    {
      language: 'en' as const,
      image: '/patch-note-only-en.png',
      imageAlt: 'Update image',
      hideForWeek: "Don't show again for a week",
      detailButton: 'View details',
    },
  ])(
    'image-only 모드에서 $language 콘텐츠를 표시한다',
    async ({ language, image, imageAlt, hideForWeek, detailButton }) => {
      await renderUpdateModal(imageOnlyPatchNote, language);

      expect(screen.getByRole('img', { name: imageAlt })).toHaveAttribute(
        'src',
        image,
      );
      expect(
        screen.getByRole('checkbox', { name: hideForWeek }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: detailButton }),
      ).toBeInTheDocument();
    },
  );

  test('image-only 모드에서 이미지, 체크박스, 상세 버튼을 겹치지 않고 순서대로 배치한다', async () => {
    await renderUpdateModal(imageOnlyPatchNote, 'ko');

    const image = screen.getByRole('img', { name: '업데이트 이미지' });
    const checkbox = screen.getByRole('checkbox', {
      name: '일주일 간 보지 않기',
    });
    const checkboxLabel = checkbox.closest('label');
    const detailButton = screen.getByRole('button', { name: '자세히 보기' });

    expect(checkboxLabel).not.toBeNull();
    expect(image.parentElement?.nextElementSibling).toBe(checkboxLabel);
    expect(checkboxLabel?.parentElement?.nextElementSibling).toBe(detailButton);
    expect(checkboxLabel).not.toHaveClass('absolute');
    expect(detailButton).toHaveClass('h-[8.8%]', 'shrink-0');
  });

  test('image-only 모드에만 닫기 버튼을 표시한다', async () => {
    const { unmount } = await renderUpdateModal(imageOnlyPatchNote, 'ko');

    expect(
      screen.getByRole('button', { name: '모달 닫기' }),
    ).toBeInTheDocument();

    unmount();
    await renderUpdateModal(predefinedPatchNote, 'ko');

    expect(
      screen.queryByRole('button', { name: '모달 닫기' }),
    ).not.toBeInTheDocument();
  });

  test('image-only 모드의 닫기 버튼은 체크박스와 크기가 같고 이미지 위의 별도 영역에 배치된다', async () => {
    await renderUpdateModal(imageOnlyPatchNote, 'ko');

    const closeButton = screen.getByRole('button', { name: '모달 닫기' });
    const image = screen.getByRole('img', { name: '업데이트 이미지' });
    const checkbox = screen.getByRole('checkbox', {
      name: '일주일 간 보지 않기',
    });

    expect(closeButton.parentElement?.nextElementSibling).toBe(
      image.parentElement,
    );
    expect(closeButton).toHaveClass(
      'size-[clamp(16px,1.25vw,20px)]',
      'bg-transparent',
    );
    expect(checkbox).toHaveClass('size-[clamp(16px,1.25vw,20px)]');
    expect(closeButton.firstElementChild).toHaveClass('text-black');
  });

  test('image-only 모드의 닫기 버튼을 누르면 onClose를 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const i18n = createInstance();
    await i18n.init({
      lng: 'ko',
      fallbackLng: 'ko',
      supportedLngs: ['ko', 'en'],
      resources: translations,
    });

    render(
      <I18nextProvider i18n={i18n}>
        <UpdateModal
          data={imageOnlyPatchNote}
          isChecked={false}
          onChecked={vi.fn()}
          onClose={onClose}
          onClickDetailButton={vi.fn()}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: '모달 닫기' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
