import { http, HttpResponse } from 'msw';
import { customizeHandlers } from './customize';
import { memberHandlers } from './member';
import { pollHandlers } from './poll';

export const allHandlers = [
  http.get(/\/locales\/[^/]+\/translation\.json$/, () => HttpResponse.json({})),
  ...memberHandlers,
  ...customizeHandlers,
  ...pollHandlers,
];
