export const API_VERSION = 'v9';
export const MESSAGES_PER_PAGE = 25;
export const OBSERVER_THROTTLE_MS = 3000;
export const MAX_SEARCH_DELAY_MS = 60000;
export const MAX_DELETE_DELAY_MS = 30000;

export const DELETE_RESULT = Object.freeze({
  OK: 'OK',
  RETRY: 'RETRY',
  FAILED: 'FAILED',
  FAIL_SKIP: 'FAIL_SKIP',
});

// Discord message types that can be deleted by the message author.
// type 0 = default, types 6-19 = various deletable system messages,
// type 20 = CHAT_INPUT_COMMAND (not deletable without manage messages),
// type 21 = THREAD_STARTER_MESSAGE (not deletable),
// type 46 = polls (self-deletable)
export const DELETABLE_MSG_TYPES = new Set([
  0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 46,
]);
