import { version } from '../package.json';

const VERSION = version;
const HOME = 'https://github.com/victornpb/undiscord';
const WIKI = 'https://github.com/victornpb/undiscord/wiki';

import deleteMessages from './deleteMessages';


//---- User interface ----//

import themeCSS from './ui/discord-theme.css';
import undiscordCSS from './ui/main.css';
import undiscordUI from './ui/ui.html';
import buttonHtml from './ui/button.html';

import createElm from './utils/createElm';
import insertCss from './utils/insertCss';

let undiscordWindow;
let undiscordBtn;
let stop;

function initUI() {

  insertCss(themeCSS);
  insertCss(undiscordCSS);

  function replaceInterpolations(str, obj, removeMissing = false) {
    return str.replace(/\{\{([\w_]+)\}\}/g, (m, key) => obj[key] || (removeMissing ? '' : m));
  }

  // create undiscord window
  const template = replaceInterpolations(undiscordUI, {
    VERSION,
    HOME,
    WIKI,
  });
  undiscordWindow = createElm(template);
  document.body.appendChild(undiscordWindow);
  const $ = s => undiscordWindow.querySelector(s);

  // create undiscord button
  undiscordBtn = createElm(buttonHtml);
  undiscordBtn.onclick = togglePopover;
  mountBtn();

  // watch for changes and re-mount button
  function mountBtn() {
    const toolbar = document.querySelector('[class^=toolbar]');
    if (toolbar) toolbar.appendChild(undiscordBtn);
  }
  const observer = new MutationObserver((_mutationsList, _observer) => {
    if (!document.body.contains(undiscordBtn)) mountBtn(); // re-mount the button to the toolbar
  });
  observer.observe(document.body, { attributes: false, childList: true, subtree: true });

  function togglePopover() {
    if (undiscordWindow.style.display !== 'none') {
      undiscordWindow.style.display = 'none';
      undiscordBtn.style.color = 'var(--interactive-normal)';
    }
    else {
      undiscordWindow.style.display = '';
      undiscordBtn.style.color = 'var(--interactive-active)';
    }
  }

  $('#hide').onclick = togglePopover;

  // startBtn.onclick = async e => {
  //   const authToken = $('input#authToken').value.trim();
  //   const authorId = $('input#authorId').value.trim();
  //   const guildId = $('input#guildId').value.trim();
  //   const channelIds = $('input#channelId').value.trim().split(/\s*,\s*/);
  //   const minId = $('input#minId').value.trim();
  //   const maxId = $('input#maxId').value.trim();
  //   const minDate = $('input#minDate').value.trim();
  //   const maxDate = $('input#maxDate').value.trim();
  //   const content = $('input#content').value.trim();
  //   const hasLink = $('input#hasLink').checked;
  //   const hasFile = $('input#hasFile').checked;
  //   const includeNsfw = $('input#includeNsfw').checked;
  //   const includePinned = $('input#includePinned').checked;
  //   const pattern = $('input#pattern').value;
  //   const searchDelay = parseInt($('input#searchDelay').value.trim());
  //   const deleteDelay = parseInt($('input#deleteDelay').value.trim());
  //   const progress = $('#progress');
  //   const progress2 = btn.querySelector('progress');
  //   const percent = $('.percent');

  //   const fileSelection = $('input#file');
  //   fileSelection.addEventListener('change', () => {
  //     const files = fileSelection.files;
  //     const channelIdField = $('input#channelId');
  //     if (files.length > 0) {
  //       const file = files[0];
  //       file.text().then(text => {
  //         let json = JSON.parse(text);
  //         let channels = Object.keys(json);
  //         channelIdField.value = channels.join(',');
  //       });
  //     }
  //   }, false);

  //   const stopHndl = () => !(stop === true);

  //   const onProg = (value, max) => {
  //     if (value && max && value > max) max = value;
  //     progress.setAttribute('max', max);
  //     progress.value = value;
  //     progress.style.display = max ? '' : 'none';
  //     progress2.setAttribute('max', max);
  //     progress2.value = value;
  //     progress2.style.display = max ? '' : 'none';
  //     percent.innerHTML = value && max ? Math.round(value / max * 100) + '%' : '';
  //   };


  //   stop = stopBtn.disabled = !(startBtn.disabled = true);
  //   for (let i = 0; i < channelIds.length; i++) {
  //     await deleteMessages(authToken, authorId, guildId, channelIds[i], minId || minDate, maxId || maxDate, content, hasLink, hasFile, includeNsfw, includePinned, pattern, searchDelay, deleteDelay, logger, stopHndl, onProg);
  //     stop = stopBtn.disabled = !(startBtn.disabled = false);
  //   }
  // };
  // stopBtn.onclick = e => stop = stopBtn.disabled = !(startBtn.disabled = false);
  // $('button#clear').onclick = e => { logArea.innerHTML = ''; };

  function getToken() {
    window.dispatchEvent(new Event('beforeunload'));
    const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
    return JSON.parse(LS.token);
  }

  function getAuthorId() {
    const LS  = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
    return JSON.parse(LS.user_id_cache);
  }

  function getGuildId() {
    const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
    if (m) return m[1];
    else alert('Could not the Guild ID!\nPlease make sure you are on a Server or DM.');
  }

  function getChannelId() {
    const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
    if (m) return m[2];
    else alert('Could not the Channel ID!\nPlease make sure you are on a Channel or DM.');
  }

  $('button#getAuthor').onclick = e => $('input#authorId').value = getAuthorId();

  $('button#getGuild').onclick = e => {
    const guildId = $('input#guildId').value = getGuildId();
    if (guildId === '@me') $('input#channelId').value = getChannelId();
  };

  $('button#getChannel').onclick = () => {
    $('input#channelId').value = getChannelId();
    $('input#guildId').value = getGuildId();
  };

  $('#redact').onchange = e => {
    const b = undiscordWindow.classList.toggle('redact');
    if (b) alert('This will attempt to hide personal information, but make sure to double check before sharing screenshots.');
  };

  const logger = (type = '', args) => {
    const style = { '': '', info: 'color:#00b0f4;', verb: 'color:#72767d;', warn: 'color:#faa61a;', error: 'color:#f04747;', success: 'color:#43b581;' }[type];
    logArea.insertAdjacentHTML('beforeend', `<div style="${style}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);
    if (autoScroll.checked) logArea.querySelector('div:last-child').scrollIntoView(false);
  };

}

initUI();


//END.
