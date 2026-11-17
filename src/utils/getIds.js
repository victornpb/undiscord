import { log } from './log';

function readLocalStorage(key) {
  const f = document.body.appendChild(document.createElement('iframe'));
  try {
    return f.contentWindow.localStorage[key];
  } finally {
    f.remove(); // don't leak iframes
  }
}

function getWebpackModules() {
  const mods = [];
  window.webpackChunkdiscord_app.push([[Symbol()], {}, r => { for (const k in r.c) mods.push(r.c[k]); }]);
  window.webpackChunkdiscord_app.pop();
  return mods;
}

function findInModules(test) {
  for (const m of getWebpackModules()) {
    const e = m?.exports;
    if (!e || typeof e !== 'object') continue;
    let candidates;
    try { candidates = [e.default, e.Z, e.ZP, ...Object.values(e)]; } catch { continue; }
    for (const v of candidates) {
      try {
        const result = test(v);
        if (result) return result;
      } catch { /* ignore */ }
    }
  }
  return null;
}

export function getToken() {
  window.dispatchEvent(new Event('beforeunload'));
  try {
    const t = readLocalStorage('token');
    if (t) return JSON.parse(t);
  } catch { /* fall through to webpack */ }
  log.info('Token not found in local storage, searching webpack modules...');
  const token = findInModules(v => {
    if (v && typeof v.getToken === 'function') {
      const t = v.getToken();
      if (typeof t === 'string' && t.length > 20) return t;
    }
  });
  if (!token) throw new Error('Token not found');
  return token;
}

export function getAuthorId() {
  try {
    const id = readLocalStorage('user_id_cache');
    if (id) return JSON.parse(id);
  } catch { /* fall through to webpack */ }
  const id = findInModules(v => {
    if (v && typeof v.getCurrentUser === 'function') {
      const u = v.getCurrentUser();
      if (u && u.id) return u.id;
    }
  });
  if (!id) alert('Could not find your user ID automatically. Please paste it manually.');
  return id || '';
}

export function getGuildId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[1];
  else alert('Could not find the Guild ID!\nPlease make sure you are on a Server or DM.');
}

export function getChannelId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[2];
  else alert('Could not find the Channel ID!\nPlease make sure you are on a Channel or DM.');
}

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
