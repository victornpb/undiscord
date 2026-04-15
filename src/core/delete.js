import { log } from '../utils/log.js';
import { wait } from '../utils/time.js';
import { redact } from '../utils/html.js';
import { DELETE_RESULT } from '../utils/constants.js';
import { deleteMessage as apiDelete } from '../api/discord-api.js';
import { MAX_DELETE_DELAY_MS } from '../utils/constants.js';
import { tryUnarchiveThread } from './unarchive.js';

/**
 * Delete a single message via the Discord API with error handling.
 * @param {Object} message - Discord message object
 * @param {Object} options - Core options (authToken, deleteDelay)
 * @param {Object} stats - Core stats (throttledCount, throttledTotalTime)
 * @param {Function} beforeRequest - Ping tracking
 * @param {Function} afterRequest - Ping tracking
 * @param {Function} printStats - Logs current stats
 * @returns {Promise<string>} DELETE_RESULT value
 */
export async function deleteSingleMessage(message, options, stats, beforeRequest, afterRequest, printStats) {
  let resp;
  try {
    beforeRequest();
    resp = await apiDelete(options.authToken, message.channel_id, message.id);
    afterRequest();
  } catch (err) {
    log.error('Delete request throwed an error:', err);
    log.verb('Related object:', redact(JSON.stringify(message)));
    return DELETE_RESULT.FAILED;
  }

  if (!resp.ok) {
    if (resp.status === 429) {
      const w = Math.max((await resp.json()).retry_after * 1000, 0) || options.deleteDelay;
      stats.throttledCount++;
      const cooldown = w * 2;
      stats.throttledTotalTime += cooldown;
      if (w > options.deleteDelay) {
        options.deleteDelay = Math.min(options.deleteDelay + w, MAX_DELETE_DELAY_MS);
        log.warn(`Being rate limited by the API for ${w}ms! Adjusted delete delay to ${options.deleteDelay}ms.`);
      } else {
        log.warn(`Being rate limited by the API for ${w}ms!`);
      }
      printStats();
      log.verb(`Cooling down for ${cooldown}ms before retrying...`);
      await wait(cooldown);
      return DELETE_RESULT.RETRY;
    } else if (resp.status === 403) {
      log.warn('Insufficient permissions to delete message. Skipping...');
      return DELETE_RESULT.FAIL_SKIP;
    } else {
      const body = await resp.text();
      try {
        const r = JSON.parse(body);
        if (resp.status === 400 && r.code === 50083) {
          log.warn('Thread is archived. Attempting to unarchive...');
          return tryUnarchiveThread(options.authToken, message.channel_id, beforeRequest, afterRequest);
        }
        log.error(`Error deleting message, API responded with status ${resp.status}!`, r);
        log.verb('Related object:', redact(JSON.stringify(message)));
        return DELETE_RESULT.FAILED;
      } catch (e) {
        log.error(`Fail to parse JSON. API responded with status ${resp.status}!`, body);
        return DELETE_RESULT.FAILED;
      }
    }
  }

  return DELETE_RESULT.OK;
}

/**
 * Delete all messages in the current batch with retry logic.
 * @param {Object} state - Core state (running, delCount, failCount, offset, grandTotal, _messagesToDelete)
 * @param {Object} options - Core options (maxAttempt, deleteDelay, authToken)
 * @param {Object} stats - Core stats
 * @param {Function} beforeRequest - Ping tracking
 * @param {Function} afterRequest - Ping tracking
 * @param {Function} printStats - Logs current stats
 * @param {Function} calcEtr - Recalculate estimated time remaining
 * @param {Function} [onProgress] - Progress callback
 */
export async function deleteMessagesFromList(state, options, stats, beforeRequest, afterRequest, printStats, calcEtr, onProgress) {
  for (let i = 0; i < state._messagesToDelete.length; i++) {
    const message = state._messagesToDelete[i];
    if (!state.running) return log.error('Stopped by you!');

    log.debug(
      `[${state.delCount + state.failCount + 1}/${state.grandTotal}] ` +
      `${new Date(message.timestamp).toLocaleString()} ` +
      `${redact((message.author?.username || 'Unknown') + '#' + (message.author?.discriminator || '0000'))}` +
      `: ${redact((message.content || '').replace(/\n/g, '↵'))}` +
      (message.attachments?.length ? ` [${message.attachments.length} attachment(s)]` : ''),
      `{ID:${redact(message.id)}}`
    );

    // retry loop
    let attempt = 0;
    while (attempt < options.maxAttempt) {
      const result = await deleteSingleMessage(message, options, stats, beforeRequest, afterRequest, printStats);
      attempt++;

      if (result === DELETE_RESULT.RETRY || result === DELETE_RESULT.FAILED) {
        if (attempt >= options.maxAttempt) {
          state.offset++;
          state.failCount++;
          break;
        }
        log.verb(`Retrying in ${options.deleteDelay}ms... (${attempt}/${options.maxAttempt})`);
        await wait(options.deleteDelay);
        continue;
      } else if (result === DELETE_RESULT.FAIL_SKIP) {
        state.offset++;
        state.failCount++;
      } else {
        state.delCount++;
      }
      break;
    }

    calcEtr();
    if (onProgress) onProgress(state, stats);

    await wait(options.deleteDelay);
  }
}
