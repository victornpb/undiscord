import { log } from './log';

export function getToken() {
  window.dispatchEvent(new Event('beforeunload'));
  const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
  try {
    return JSON.parse(LS.token);
  } catch {
    log.info('Could not automatically detect Authorization Token in local storage!');
    log.info('Attempting to grab token using webpack');
    return (window.webpackChunkdiscord_app.push([[''], {}, e => { window.m = []; for (let c in e.c) window.m.push(e.c[c]); }]), window.m).find(m => m?.exports?.default?.getToken !== void 0).exports.default.getToken();
  }
}

export function getAuthorId() {
  const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
  return JSON.parse(LS.user_id_cache);
}

export function getGuildId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[1];
  else alert('Could not find the Guild ID!\nPlease make sure you are on a Server or DM.');
}

export async function getChannelId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) {
    try {
      const response=await fetch(`https://discord.com/api/v9/channels/${m[2]}`,{headers:{Authorization:getToken()}});
      const data = await response.json();
      if ([10, 11, 12].includes(data.type)) {log.info('selecting parent channel'); return [data.parent_id,false,m[2]];}
      else {return [m[2],false,null];}
    } catch (err) {
      log.info('Could not get channel type, assuming not thread.');
      return [m[2],false,null];
    }
  }
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
