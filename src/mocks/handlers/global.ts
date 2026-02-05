import { http, HttpResponse } from 'msw';
import { customizeHandlers } from './customize';
import { memberHandlers } from './member';
import { pollHandlers } from './poll';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  ko: {
    '토론 시간표를 선택해주세요': '토론 시간표를 선택해주세요',
    '토론 정보를 설정해주세요': '토론 정보를 설정해주세요',
    '토론 정보를 수정해주세요': '토론 정보를 수정해주세요',
    다음: '다음',
    추가하기: '추가하기',
    '타이머 추가': '타이머 추가',
    '설정 완료': '설정 완료',
    '주제 없음': '주제 없음',
    '테이블을 삭제하시겠습니까?': '테이블을 삭제하시겠습니까?',
    취소: '취소',
    삭제하기: '삭제하기',
    수정하기: '수정하기',
  },
  en: {
    '토론 시간표를 선택해주세요': 'Please select a debate timetable',
    '토론 정보를 설정해주세요': 'Please set the debate information',
    '토론 정보를 수정해주세요': 'Please edit the debate information',
    다음: 'Next',
    추가하기: 'Add',
    '타이머 추가': 'Add timer',
    '설정 완료': 'Done',
    '주제 없음': 'No topic',
    '테이블을 삭제하시겠습니까?': 'Do you want to delete the table?',
    취소: 'Cancel',
    삭제하기: 'Delete',
    수정하기: 'Edit',
  },
};

export const allHandlers = [
  http.get(/\/locales\/[^/]+\/translation\.json$/, ({ request }) => {
    const pathname = new URL(request.url).pathname;
    const match = pathname.match(/\/locales\/([^/]+)\/translation\.json$/);
    const locale = match?.[1] ?? 'ko';
    const translations = TRANSLATIONS[locale] ?? TRANSLATIONS.ko;
    return HttpResponse.json(translations);
  }),
  ...memberHandlers,
  ...customizeHandlers,
  ...pollHandlers,
];
