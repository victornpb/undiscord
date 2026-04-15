import { API_VERSION } from '../utils/constants.js';
import { queryString, toSnowflake } from '../utils/discord.js';

const BASE_URL = `https://discord.com/api/${API_VERSION}`;
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Search messages in a guild or DM channel.
 * @param {string} authToken - Discord authorization token
 * @param {Object} params - Search parameters
 * @param {string} params.guildId - Guild ID or '@me' for DMs
 * @param {string} [params.channelId] - Channel ID
 * @param {string} [params.authorId] - Author ID filter
 * @param {string} [params.minId] - Min message ID or date
 * @param {string} [params.maxId] - Max message ID or date
 * @param {number} [params.offset] - Pagination offset
 * @param {boolean} [params.hasLink] - Filter messages with links
 * @param {boolean} [params.hasFile] - Filter messages with files
 * @param {string} [params.content] - Text content filter
 * @param {boolean} [params.includeNsfw] - Include NSFW channels
 * @returns {Promise<Response>} Raw fetch response
 */
export async function searchMessages(authToken, params) {
  const { guildId, channelId, authorId, minId, maxId, offset, hasLink, hasFile, content, includeNsfw } = params;

  let url;
  if (guildId === '@me') url = `${BASE_URL}/channels/${channelId}/messages/`;
  else url = `${BASE_URL}/guilds/${guildId}/messages/`;

  return fetch(url + 'search?' + queryString([
    ['author_id', authorId || undefined],
    ['channel_id', (guildId !== '@me' ? channelId : undefined) || undefined],
    ['min_id', minId ? toSnowflake(minId) : undefined],
    ['max_id', maxId ? toSnowflake(maxId) : undefined],
    ['sort_by', 'timestamp'],
    ['sort_order', 'desc'],
    ['offset', offset],
    ['has', hasLink ? 'link' : undefined],
    ['has', hasFile ? 'file' : undefined],
    ['content', content || undefined],
    ['include_nsfw', includeNsfw ? true : undefined],
  ]), {
    headers: { 'Authorization': authToken },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
}

/**
 * Delete a single message from a channel.
 * @param {string} authToken - Discord authorization token
 * @param {string} channelId - Channel containing the message
 * @param {string} messageId - Message to delete
 * @returns {Promise<Response>} Raw fetch response
 */
export async function deleteMessage(authToken, channelId, messageId) {
  return fetch(`${BASE_URL}/channels/${channelId}/messages/${messageId}`, {
    method: 'DELETE',
    headers: { 'Authorization': authToken },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
}

/**
 * Unarchive a thread channel so messages can be deleted.
 * @param {string} authToken - Discord authorization token
 * @param {string} channelId - Thread channel ID
 * @returns {Promise<Response>} Raw fetch response
 */
export async function unarchiveThread(authToken, channelId) {
  return fetch(`${BASE_URL}/channels/${channelId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ archived: false }),
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
}

/**
 * Get channel information (used for thread detection).
 * @param {string} authToken - Discord authorization token
 * @param {string} channelId - Channel ID
 * @returns {Promise<Response>} Raw fetch response
 */
export async function getChannel(authToken, channelId) {
  return fetch(`${BASE_URL}/channels/${channelId}`, {
    headers: { 'Authorization': authToken },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
}
