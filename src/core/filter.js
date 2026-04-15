import { log } from '../utils/log.js';
import { DELETABLE_MSG_TYPES } from '../utils/constants.js';

/**
 * Filter the search response to determine which messages should be deleted.
 * Pure function - returns result instead of mutating state.
 * @param {Object} data - Search response `{ messages: [], total_results: number }`
 * @param {Object} options - Filter options
 * @param {boolean} [options.includePinned] - Include pinned messages
 * @param {boolean} [options.includeApplications] - Include bot/application messages
 * @param {boolean} [options.isThread] - Whether filtering for a specific thread
 * @param {string} [options.threadId] - Thread ID to filter by
 * @param {string} [options.pattern] - Regex pattern to match content
 * @returns {{ toDelete: Object[], skipped: Object[], grandTotal: number }}
 */
export function filterMessages(data, options) {
  if (!data || !Array.isArray(data.messages)) {
    return { toDelete: [], skipped: [], grandTotal: 0 };
  }

  const grandTotal = data.total_results;

  // search returns messages near the actual message, only get the messages we searched for
  const discoveredMessages = data.messages
    .map(convo => convo.find(message => message.hit === true))
    .filter(Boolean);

  // filter by deletable message types
  let messagesToDelete = discoveredMessages.filter(msg => DELETABLE_MSG_TYPES.has(msg.type));

  // filter pinned
  messagesToDelete = messagesToDelete.filter(msg => msg.pinned ? options.includePinned : true);

  // filter bot/application messages
  if (!options.includeApplications) {
    messagesToDelete = messagesToDelete.filter(msg => !msg.author?.bot);
  }

  // filter by thread
  if (options.isThread && options.threadId) {
    messagesToDelete = messagesToDelete.filter(msg => msg.channel_id === options.threadId);
  }

  // filter by regex pattern
  if (options.pattern) {
    try {
      const regex = new RegExp(options.pattern, 'i');
      messagesToDelete = messagesToDelete.filter(msg => {
        try {
          return regex.test(msg.content);
        } catch (e) {
          return false;
        }
      });
    } catch (e) {
      log.warn('Ignoring RegExp because pattern is malformed!', e);
    }
  }

  // compute skipped messages (used for offset calculation)
  const deleteIds = new Set(messagesToDelete.map(m => m.id));
  const skipped = discoveredMessages.filter(msg => !deleteIds.has(msg.id));

  log.verb('filterMessages', `toDelete: ${messagesToDelete.length}, skipped: ${skipped.length}`);

  return { toDelete: messagesToDelete, skipped, grandTotal };
}
