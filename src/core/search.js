import { log } from '../utils/log.js';
import { wait } from '../utils/time.js';
import { searchMessages as apiSearch } from '../api/discord-api.js';
import { MAX_SEARCH_DELAY_MS } from '../utils/constants.js';

const MAX_SEARCH_RETRIES = 20;

/**
 * Search for messages with automatic retry on rate-limit (429) and indexing (202).
 * Handles 403/400 errors gracefully for batch job resilience.
 * @param {Object} options - Core options (authToken, guildId, channelId, filters, etc.)
 * @param {Object} state - Core state (offset, running, _searchResponse)
 * @param {Object} stats - Core stats (throttledCount, throttledTotalTime)
 * @param {Function} beforeRequest - Ping tracking: called before fetch
 * @param {Function} afterRequest - Ping tracking: called after fetch
 * @param {Function} printStats - Logs current delay/throttle stats
 * @returns {Promise<Object>} Search response data `{ messages: [], total_results: number }`
 */
export async function searchWithRetry(options, state, stats, beforeRequest, afterRequest, printStats) {
  for (let attempt = 0; attempt < MAX_SEARCH_RETRIES; attempt++) {
    let resp;
    try {
      beforeRequest();
      resp = await apiSearch(options.authToken, {
        guildId: options.guildId,
        channelId: options.channelId,
        authorId: options.authorId,
        minId: options.minId,
        maxId: options.maxId,
        offset: state.offset,
        hasLink: options.hasLink,
        hasFile: options.hasFile,
        content: options.content,
        includeNsfw: options.includeNsfw,
      });
      afterRequest();
    } catch (err) {
      state.running = false;
      log.error('Search request threw an error:', err);
      throw err;
    }

    // not indexed yet (not a rate limit — don't count as throttled)
    if (resp.status === 202) {
      let w = (await resp.json()).retry_after * 1000;
      w = Math.max(w, 0) || options.searchDelay;
      log.warn(`This channel isn't indexed yet. Waiting ${w}ms for discord to index it...`);
      await wait(w);
      continue;
    }

    if (!resp.ok) {
      if (resp.status === 429) {
        let w = (await resp.json()).retry_after * 1000;
        w = Math.max(w, 0) || options.searchDelay;
        stats.throttledCount++;
        const cooldown = w * 2;
        stats.throttledTotalTime += cooldown;
        options.searchDelay = Math.min(options.searchDelay + 100, MAX_SEARCH_DELAY_MS);
        log.warn(`Being rate limited by the API for ${w}ms! Increasing search delay to ${options.searchDelay}ms...`);
        printStats();
        log.verb(`Cooling down for ${cooldown}ms before retrying...`);
        await wait(cooldown);
        continue;
      }
      else if (resp.status === 403) {
        log.warn('Insufficient permissions to search this channel. Skipping...');
        state._searchResponse = { messages: [], total_results: 0 };
        return state._searchResponse;
      }
      else {
        try {
          const errorData = await resp.json();
          if (resp.status === 400 && errorData.code === 50024) {
            log.warn('Channel not found (possibly deleted). Skipping...');
            state._searchResponse = { messages: [], total_results: 0 };
            return state._searchResponse;
          }
          if (resp.status === 403 && errorData.code === 50001) {
            log.warn('Missing access to this guild. Skipping...');
            state._searchResponse = { messages: [], total_results: 0 };
            return state._searchResponse;
          }
          state.running = false;
          log.error(`Error searching messages, API responded with status ${resp.status}!\n`, errorData);
          throw resp;
        } catch (e) {
          if (e === resp) throw e;
          state.running = false;
          log.error(`Error searching messages, API responded with status ${resp.status}!\n`);
          throw resp;
        }
      }
    }

    // success
    let data = await resp.json();
    if (!data || typeof data !== 'object') {
      data = { messages: [], total_results: 0 };
    } else if (!Array.isArray(data.messages)) {
      data.messages = [];
      data.total_results = data.total_results || 0;
    }
    state._searchResponse = data;
    return data;
  }

  state.running = false;
  log.error('Too many search retries. Stopping.');
  throw new Error('Search max retries exceeded');
}
