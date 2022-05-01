export function getToken() {
  window.dispatchEvent(new Event('beforeunload'));
  const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
  return JSON.parse(LS.token);
}

export function getAuthorId() {
  const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
  return JSON.parse(LS.user_id_cache);
}

export function getGuildId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[1];
  else alert('Could not the Guild ID!\nPlease make sure you are on a Server or DM.');
}

export function getChannelId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[2];
  else alert('Could not the Channel ID!\nPlease make sure you are on a Channel or DM.');
}
