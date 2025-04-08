import { setupWorker } from 'msw/browser';
import { allHandlers } from './handlers/global';

export const worker = setupWorker(...allHandlers);
