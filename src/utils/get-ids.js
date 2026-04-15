import { log } from './log.js';
import { getChannel as apiGetChannel } from '../api/discord-api.js';

function getIframeLocalStorage() {
  const iframe = document.body.appendChild(document.createElement('iframe'));
  iframe.style.display = 'none';
  const LS = iframe.contentWindow.localStorage;
  return { LS, iframe };
}

/**
 * Extract the Discord authorization token using multiple methods.
 * @returns {string|null} Token or null if all methods fail
 */
export function getToken() {
  window.dispatchEvent(new Event('beforeunload'));

  // Method 1: iframe localStorage
  try {
    const { LS, iframe } = getIframeLocalStorage();
    try {
      const token = JSON.parse(LS.token);
      if (token) return token;
    } finally {
      iframe.remove();
    }
  } catch { /* ignore */ }

  // Method 2: webpack/rspack module cache
  log.info('Could not automatically detect Authorization Token in local storage!');
  log.info('Attempting to grab token using webpack');
  try {
    return (window.webpackChunkdiscord_app.push([[''], {}, e => { window.m = []; for (let c in e.c) window.m.push(e.c[c]); }]), window.m).find(m => m?.exports?.default?.getToken !== void 0).exports.default.getToken();
  } catch { /* ignore */ }

  // Method 3: alternative webpack export path
  try {
    const tokenModule = window.m?.find(m => m?.exports?.getToken !== void 0);
    if (tokenModule) return tokenModule.exports.getToken();
  } catch { /* ignore */ }

  log.error('All token extraction methods failed.');
  log.info('Please enter your token manually in "Advanced Settings".');
  return null;
}

/**
 * Get the current user's author ID from localStorage.
 * @returns {string} Author ID or empty string
 */
export function getAuthorId() {
  try {
    const { LS, iframe } = getIframeLocalStorage();
    try {
      return JSON.parse(LS.user_id_cache);
    } finally {
      iframe.remove();
    }
  } catch { /* ignore */ }
  log.error('Could not get Author ID from local storage.');
  return '';
}

/**
 * Extract the guild ID from the current URL.
 * @returns {string|undefined} Guild ID or undefined (with alert)
 */
export function getGuildId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[1];
  else alert('Could not find the Guild ID!\nPlease make sure you are on a Server or DM.');
}

/**
 * Extract the channel ID from the current URL.
 * @returns {string|undefined} Channel ID or undefined (with alert)
 */
export function getChannelId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[2];
  else alert('Could not find the Channel ID!\nPlease make sure you are on a Channel or DM.');
}

/**
 * Check if the current channel is a thread and return thread info.
 * Thread types: 10 = announcement thread, 11 = public thread, 12 = private thread
 * @param {string} authToken - Authorization token for API calls
 * @returns {Promise<{channelId: string, isThread: boolean, threadId: string|null}>}
 */
export async function getChannelThread(authToken) {
  const channelId = getChannelId();
  if (!channelId) return { channelId: null, isThread: false, threadId: null };

  try {
    const resp = await apiGetChannel(authToken, channelId);
    if (resp.ok) {
      const data = await resp.json();
      if ([10, 11, 12].includes(data.type) && data.parent_id) {
        return { channelId: data.parent_id, isThread: true, threadId: channelId };
      }
    }
  } catch {
    // fallback: treat as non-thread
  }
  return { channelId, isThread: false, threadId: null };
}

/**
 * Try to fill the token automatically, with error logging.
 * @returns {string} Token or empty string
 */
export function fillToken() {
  try {
    return getToken();
  } catch (err) {
    log.verb(err);
    log.error('Could not automatically detect Authorization Token!');
    log.info('Please make sure Undiscord is up to date');
    log.debug('Alternatively, you can try entering a Token manually in the "Advanced Settings" section.');
  }
  return '';
}
