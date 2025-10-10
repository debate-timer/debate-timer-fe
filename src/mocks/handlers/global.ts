import { customizeHandlers } from './customize';
import { memberHandlers } from './member';
import { pollHandlers } from './poll';

export const allHandlers = [
  ...memberHandlers,
  ...customizeHandlers,
  ...pollHandlers,
];
