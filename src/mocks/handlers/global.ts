import { customizeHandlers } from './customize';
import { memberHandlers } from './member';
import { parliamentaryHandlers } from './parliamentary';

export const allHandlers = [
  ...memberHandlers,
  ...parliamentaryHandlers,
  ...customizeHandlers,
];
