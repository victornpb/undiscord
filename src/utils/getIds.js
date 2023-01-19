function getLocalStoragePropertyDescriptor() {
  const iframe = document.createElement('iframe');
  document.head.append(iframe);
  const pd = Object.getOwnPropertyDescriptor(iframe.contentWindow, 'localStorage');
  iframe.remove();
  return pd;
}
Object.defineProperty(window, 'localStorage', getLocalStoragePropertyDescriptor());
const LS = getLocalStoragePropertyDescriptor().get.call(window);
export function getToken() {
  window.dispatchEvent(new Event('beforeunload'));
  return JSON.parse(LS.token);
}

export function getAuthorId() {
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
