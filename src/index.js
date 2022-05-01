import { version } from '../package.json';
import deleteMessages from './deleteMessages';

const VERSION = version;
const HOME = 'https://github.com/victornpb/undiscord';
const WIKI = 'https://github.com/victornpb/undiscord/wiki';

//------------------------- User interface ------------------------------//

import themeCSS from './ui/discord-theme.css';
import undiscordCSS from './ui/main.css';
import undiscordUI from './ui/ui.html';
import buttonHtml from './ui/button.html';

import createElm from './utils/createElm';
import insertCss from './utils/insertCss';
import { getToken, getAuthorId, getGuildId, getChannelId } from './utils/getIds';

const $ = s => undiscordWindow.querySelector(s);

let undiscordWindow;
let undiscordBtn;

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

  // create undiscord button
  undiscordBtn = createElm(buttonHtml);
  undiscordBtn.onclick = toggleWindow;
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

  function toggleWindow() {
    if (undiscordWindow.style.display !== 'none') {
      undiscordWindow.style.display = 'none';
      undiscordBtn.style.color = 'var(--interactive-normal)';
    }
    else {
      undiscordWindow.style.display = '';
      undiscordBtn.style.color = 'var(--interactive-active)';
    }
  }

  // register event listeners

  $('#hide').onclick = toggleWindow;

  $('button#start').onclick = start;
  $('button#stop').onclick = stop;

  $('button#clear').onclick = () => $('#logArea').innerHTML = '';

  $('button#getAuthor').onclick = () => $('input#authorId').value = getAuthorId();

  $('button#getGuild').onclick = () => {
    const guildId = $('input#guildId').value = getGuildId();
    if (guildId === '@me') $('input#channelId').value = getChannelId();
  };

  $('button#getChannel').onclick = () => {
    $('input#channelId').value = getChannelId();
    $('input#guildId').value = getGuildId();
  };

  $('#redact').onchange = () => {
    const b = undiscordWindow.classList.toggle('redact');
    if (b) alert('This mode will attempt to hide personal information, so you can screen share / take screenshots.\nAlways double check you are not sharing sensitive information!');
  };

  // const fileSelection = $('input#importJson');
  // fileSelection.onchange = () => {
  //   const files = fileSelection.files;
  //   const channelIdField = $('input#channelId');
  //   if (files.length > 0) {
  //     const file = files[0];
  //     file.text().then(text => {
  //       let json = JSON.parse(text);
  //       let channels = Object.keys(json);
  //       channelIdField.value = channels.join(',');
  //     });
  //   }
  // };

}

let _stopFlag;
const stopHndl = () => !(_stopFlag === true);

async function start() {
  console.log('start');

  // general
  const authToken = getToken();
  const authorId = $('input#authorId').value.trim();
  const guildId = $('input#guildId').value.trim();
  const channelIds = $('input#channelId').value.trim().split(/\s*,\s*/);
  const includeNsfw = $('input#includeNsfw').checked;
  // filter
  const content = $('input#search').value.trim();
  const hasLink = $('input#hasLink').checked;
  const hasFile = $('input#hasFile').checked;
  const includePinned = $('input#includePinned').checked;
  const pattern = $('input#pattern').value;
  // message interval
  const minId = $('input#minId').value.trim();
  const maxId = $('input#maxId').value.trim();
  // date range
  const minDate = $('input#minDate').value.trim();
  const maxDate = $('input#maxDate').value.trim();
  //advanced
  const searchDelay = parseInt($('input#searchDelay').value.trim());
  const deleteDelay = parseInt($('input#deleteDelay').value.trim());

  // progress handler
  const progress = $('#progressBar');
  const progress2 = undiscordBtn.querySelector('progress');
  const percent = $('#progressPercent');
  const onProg = (value, max) => {
    if (value && max && value > max) max = value;
    progress.setAttribute('max', max);
    progress.value = value;
    progress.style.display = max ? '' : 'none';
    progress2.setAttribute('max', max);
    progress2.value = value;
    progress2.style.display = max ? '' : 'none';
    percent.innerHTML = value && max ? Math.round(value / max * 100) + '%' : '';
    if (value === -1) progress.removeAttribute('value');
    if (value === -1) progress2.removeAttribute('value');
  };

  let logArea = $('#logArea');
  let autoScroll = $('#autoScroll');
  const logger = (type = '', args) => {
    const style = { '': '', info: 'color:#00b0f4;', verb: 'color:#72767d;', warn: 'color:#faa61a;', error: 'color:#f04747;', success: 'color:#43b581;' }[type];
    logArea.insertAdjacentHTML('beforeend', `<div style="${style}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);
    if (autoScroll.checked) logArea.querySelector('div:last-child').scrollIntoView(false);
  };

  logArea.innerHTML = '';

  // validate input
  if (authToken) return logger('error', ['Could not detect the authorization token!']) || logger('info', ['Please make sure Undiscord is up to date']);
  else if (!authorId) return logger('error', ['You must provide an Author ID!']);
  else if (!guildId) return logger('error', ['You must provide a Server ID!']);

  for (let i = 0; i < channelIds.length; i++) {
    $('#start').style.display = 'none';
    $('#stop').style.display = 'block';
    await deleteMessages(authToken, authorId, guildId, channelIds[i], minId || minDate, maxId || maxDate, content, hasLink, hasFile, includeNsfw, includePinned, pattern, searchDelay, deleteDelay, logger, stopHndl, onProg);
    $('#start').style.display = 'block';
    $('#stop').style.display = 'none';
  }

}

function stop() {
  _stopFlag = true;
  $('#start').style.display = 'block';
  $('#stop').style.display = 'none';

  $('#progressBar').style.display = 'none';
  undiscordBtn.querySelector('progress').style.display = 'none';
}

initUI();


//END.
