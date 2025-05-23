import { customizeHandlers } from './customize';
import { memberHandlers } from './member';

export const allHandlers = [...memberHandlers, ...customizeHandlers];
