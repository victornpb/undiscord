function getLocalStorage() {
  var iframe = document.createElement('iframe');
  document.head.append(iframe);
  var ls = Object.getOwnPropertyDescriptor(iframe.contentWindow, 'localStorage');
  iframe.remove();
  Object.defineProperty(window, 'localStorage', ls);
  return ls.get.call(window);
}

export function getToken() {
  window.dispatchEvent(new Event('beforeunload'));
  var LS = getLocalStorage();
  return JSON.parse(LS.token);
}

export function getAuthorId() {
  var LS = getLocalStorage();
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
