import { log } from '../utils/log.js';
import { DELETE_RESULT } from '../utils/constants.js';
import { unarchiveThread as apiUnarchive } from '../api/discord-api.js';

/**
 * Attempt to unarchive a thread so its messages can be deleted.
 * @param {string} authToken - Discord authorization token
 * @param {string} channelId - Thread channel ID
 * @param {Function} beforeRequest - Ping tracking: called before fetch
 * @param {Function} afterRequest - Ping tracking: called after fetch
 * @returns {Promise<string>} DELETE_RESULT (RETRY on success, FAIL_SKIP or FAILED on error)
 */
export async function tryUnarchiveThread(authToken, channelId, beforeRequest, afterRequest) {
  let resp;
  try {
    beforeRequest();
    resp = await apiUnarchive(authToken, channelId);
    afterRequest();
  } catch (err) {
    log.error('Failed to unarchive thread:', err);
    return DELETE_RESULT.FAILED;
  }

  if (resp.ok) {
    log.success('Thread unarchived successfully. Retrying deletion...');
    return DELETE_RESULT.RETRY;
  } else {
    log.warn(`Failed to unarchive thread (status ${resp.status}). Skipping...`);
    return DELETE_RESULT.FAIL_SKIP;
  }
}
