import { setupServer } from 'msw/node';
import { allHandlers } from './handlers/global';

export const server = setupServer(...allHandlers);
