function getLocalStoragePropertyDescriptor() {
  const iframe = document.createElement('iframe');
  document.head.append(iframe);
  const pd = Object.getOwnPropertyDescriptor(iframe.contentWindow, 'localStorage');
  iframe.remove();
  return pd;
}
Object.defineProperty(window, 'localStorage', getLocalStoragePropertyDescriptor());

export function getToken() {
  window.dispatchEvent(new Event('beforeunload'));
  const LSToken = (webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
  return LSToken;
}

export function getAuthorId() {
  const LS = getLocalStoragePropertyDescriptor().get.call(window);
  return LS.user_id_cache;
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
