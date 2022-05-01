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

let popover;
let btn;
let stop;

function initUI() {

  insertCss(themeCSS);
  insertCss(undiscordCSS);

  popover = createElm(undiscordUI);
  document.body.appendChild(popover);
  const $ = s => popover.querySelector(s);
  const logArea = $('pre');
  const startBtn = $('button#start');
  const stopBtn = $('button#stop');
  const autoScroll = $('#autoScroll');

  btn = createElm(buttonHtml);
  btn.onclick = togglePopover;

  function mountBtn() {
    const toolbar = document.querySelector('[class^=toolbar]');
    if (toolbar) toolbar.appendChild(btn);
  }

  const observer = new MutationObserver((_mutationsList, _observer) =>{
    if (!document.body.contains(btn)) mountBtn(); // re-mount the button to the toolbar
  });
  observer.observe(document.body, { attributes: false, childList: true, subtree: true });

  mountBtn();


  function togglePopover() {
    if (popover.style.display !== 'none') {
      popover.style.display = 'none';
      btn.style.color = 'var(--interactive-normal)';
    }
    else {
      popover.style.display = '';
      btn.style.color = '#f04747';
    }
  }

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
    const ls = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
    return JSON.parse(localStorage.token);
  }

  function getAuthorId() {
    const ls = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
    return JSON.parse(ls.user_id_cache);
  }

  function getGuildId() {
    const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
    return m[1];
  }

  function getChannelId() {
    const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
    return m[2];
  }

  $('#hide').onclick = togglePopover;

  $('button#getAuthor').onclick = e => $('input#authorId').value = getAuthorId();

  $('button#getGuild').onclick = e => {
    const guildId = $('input#guildId').value = getGuildId();
    if (guildId === '@me') $('input#channelId').value = getChannelId();
  };

  $('button#getChannel').onclick = () => {
    $('input#channelId').value = getChannelId();
    $('input#guildId').value = getGuildId();
  };






  // $('button#getGuildAndChannel').onclick = e => {
  //   const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  //   $('input#guildId').value = m[1];
  //   $('input#channelId').value = m[2];
  // };
  // $('#redact').onchange = e => {
  //   popover.classList.toggle('redact') &&
  //           window.alert('This will attempt to hide personal information, but make sure to double check before sharing screenshots.');
  // };

  const logger = (type = '', args) => {
    const style = { '': '', info: 'color:#00b0f4;', verb: 'color:#72767d;', warn: 'color:#faa61a;', error: 'color:#f04747;', success: 'color:#43b581;' }[type];
    logArea.insertAdjacentHTML('beforeend', `<div style="${style}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);
    if (autoScroll.checked) logArea.querySelector('div:last-child').scrollIntoView(false);
  };

  // fixLocalStorage
  window.localStorage = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;

}

initUI();


//END.
