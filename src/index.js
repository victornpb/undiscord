import { version as VERSION } from '../package.json';

import discordStyles from './ui/discord-styles.css';
import undiscordStyles from './ui/main.css';
import buttonHtml from './ui/undiscord-button.html';
import undiscordTemplate from './ui/undiscord.html';

import deleteMessages from './deleteMessages';
import Drag from './utils/drag';
import createElm from './utils/createElm';
import insertCss from './utils/insertCss';
import messagePicker from './utils/messagePicker';
import { getToken, getAuthorId, getGuildId, getChannelId } from './utils/getIds';

// ------------------------- User interface ------------------------------ //

const HOME = 'https://github.com/victornpb/undiscord';
const WIKI = 'https://github.com/victornpb/undiscord/wiki';

const $ = s => undiscordWindow.querySelector(s);

let undiscordWindow;
let undiscordBtn;

function initUI() {

  insertCss(discordStyles);
  insertCss(undiscordStyles);

  function replaceInterpolations(str, obj, removeMissing = false) {
    return str.replace(/\{\{([\w_]+)\}\}/g, (m, key) => obj[key] || (removeMissing ? '' : m));
  }

  const templateVariables = {
    VERSION,
    HOME,
    WIKI,
  };

  // create undiscord window
  const undiscordUI = replaceInterpolations(undiscordTemplate, templateVariables);
  undiscordWindow = createElm(undiscordUI);
  document.body.appendChild(undiscordWindow);

  new Drag(undiscordWindow, $('.header'), { mode: 'move' });
  new Drag(undiscordWindow, $('.footer'), { mode: 'resize' });

  // create undiscord button
  undiscordBtn = createElm(buttonHtml);
  undiscordBtn.onclick = toggleWindow;
  function mountBtn() {
    const toolbar = document.querySelector('#app-mount [class^=toolbar]');
    if (toolbar) toolbar.appendChild(undiscordBtn);
  }
  mountBtn();

  // watch for changes and re-mount button if necessary
  const discordElm = document.querySelector('#app-mount');
  let observerThrottle = null;
  const observer = new MutationObserver((_mutationsList, _observer) => {
    if (observerThrottle) return;
    observerThrottle = setTimeout(() => {
      observerThrottle = null;
      if (!discordElm.contains(undiscordBtn)) mountBtn(); // re-mount the button to the toolbar
    }, 3000);
  });
  observer.observe(discordElm, { attributes: false, childList: true, subtree: true });

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

  messagePicker.init();

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

  $('#pickMessageAfter').onclick = async () => {
    // alert('Select a message on the chat.\nThe message below it will be deleted.');
    const id = await messagePicker.grab('after');
    if (id) $('input#minId').value = id;
  };
  $('#pickMessageBefore').onclick = async () => {
    // alert('Select a message on the chat.\nThe message above it will be deleted.');
    const id = await messagePicker.grab('before');
    if (id) $('input#maxId').value = id;
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

let _stopFlag = false;
const stopHndl = () => _stopFlag;

async function start() {
  console.log('start');
  _stopFlag = false;

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
    progress2.setAttribute('max', max);
    progress.value = value;
    progress2.value = value;
    progress.style.display = max ? '' : 'none';
    progress2.style.display = max ? '' : 'none';
    percent.style.display = value && max ? '' : 'none';
    percent.innerHTML = value >= 0 && max ? Math.round(value / max * 100) + '%' : '';
    // indeterminate progress bar
    if (value === -1) {
      progress.removeAttribute('value');
      progress2.removeAttribute('value');
      percent.innerHTML = '...';
    }
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
  if (!authToken) return logger('error', ['Could not detect the authorization token!']) || logger('info', ['Please make sure Undiscord is up to date']);
  else if (!guildId) return logger('error', ['You must provide a Server ID!']);

  for (let i = 0; i < channelIds.length; i++) {
    $('#start').disabled = true;
    $('#stop').disabled = false;
    await deleteMessages(authToken, authorId, guildId, channelIds[i], minId || minDate, maxId || maxDate, content, hasLink, hasFile, includeNsfw, includePinned, pattern, searchDelay, deleteDelay, logger, stopHndl, onProg);
    stop(); // clear the running state
  }

}

function stop() {
  _stopFlag = true;
  $('#start').disabled = false;
  $('#stop').disabled = true;

  $('#progressBar').style.display = 'none';
  $('#progressPercent').style.display = 'none';
  undiscordBtn.querySelector('progress').style.display = 'none';
}

initUI();


// ---- END Undiscord ----