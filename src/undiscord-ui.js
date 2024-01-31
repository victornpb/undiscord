const PREFIX = '[UNDISCORD]';

import { VERSION } from 'process.env';

import themeCss from './ui/theme.css';
import mainCss from './ui/main.css';
import dragCss from './ui/drag.css';
import buttonHtml from './ui/undiscord-button.html';
import undiscordTemplate from './ui/undiscord.html';

import UndiscordCore from './undiscord-core';
import Drag from './utils/drag';
import createElm from './utils/createElm';
import insertCss from './utils/insertCss';
import messagePicker from './utils/messagePicker';
import { getAuthorId, getGuildId, getChannelId, fillToken } from './utils/getIds';

import { log, setLogFn } from './utils/log.js';
import { replaceInterpolations, msToHMS } from './utils/helpers';

// -------------------------- User interface ------------------------------- //

// links
const HOME = 'https://github.com/victornpb/undiscord';
const WIKI = 'https://github.com/victornpb/undiscord/wiki';

const undiscordCore = new UndiscordCore();
messagePicker.init();

const ui = {
  undiscordWindow: null,
  undiscordBtn: null,
  logArea: null,
  autoScroll: null,
  trimLog: null,

  // progress handler
  progressMain: null,
  progressIcon: null,
  percent: null,
};
const $ = s => ui.undiscordWindow.querySelector(s);

function initUI() {

  insertCss(themeCss);
  insertCss(mainCss);
  insertCss(dragCss);

  // create undiscord window
  const undiscordUI = replaceInterpolations(undiscordTemplate, {
    VERSION,
    HOME,
    WIKI,
  });
  ui.undiscordWindow = createElm(undiscordUI);
  document.body.appendChild(ui.undiscordWindow);

  // enable drag and resize on undiscord window
  new Drag({ elm: ui.undiscordWindow, moveHandle: $('.header') });

  // create undiscord Trash icon
  ui.undiscordBtn = createElm(buttonHtml);
  ui.undiscordBtn.onclick = toggleWindow;
  function mountBtn() {
    const toolbar = document.querySelector('#app-mount [class^=toolbar]');
    if (toolbar) toolbar.appendChild(ui.undiscordBtn);
  }
  mountBtn();
  // watch for changes and re-mount button if necessary
  const discordElm = document.querySelector('#app-mount');
  let observerThrottle = null;
  const observer = new MutationObserver((_mutationsList, _observer) => {
    if (observerThrottle) return;
    observerThrottle = setTimeout(() => {
      observerThrottle = null;
      if (!discordElm.contains(ui.undiscordBtn)) mountBtn(); // re-mount the button to the toolbar
    }, 3000);
  });
  observer.observe(discordElm, { attributes: false, childList: true, subtree: true });

  function toggleWindow() {
    if (ui.undiscordWindow.style.display !== 'none') {
      ui.undiscordWindow.style.display = 'none';
      ui.undiscordBtn.style.color = 'var(--interactive-normal)';
    }
    else {
      ui.undiscordWindow.style.display = '';
      ui.undiscordBtn.style.color = 'var(--interactive-active)';
    }
  }

  // cached elements
  ui.logArea = $('#logArea');
  ui.autoScroll = $('#autoScroll');
  ui.trimLog = $('#trimLog');
  ui.progressMain = $('#progressBar');
  ui.progressIcon = ui.undiscordBtn.querySelector('progress');
  ui.percent = $('#progressPercent');

  // register event listeners
  $('#hide').onclick = toggleWindow;
  $('#toggleSidebar').onclick = ()=> ui.undiscordWindow.classList.toggle('hide-sidebar');
  $('button#start').onclick = startAction;
  $('button#stop').onclick = stopAction;
  $('button#clear').onclick = () => ui.logArea.innerHTML = '';
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
    const b = ui.undiscordWindow.classList.toggle('redact');
    if (b) alert('This mode will attempt to hide personal information, so you can screen share / take screenshots.\nAlways double check you are not sharing sensitive information!');
  };
  $('#pickMessageAfter').onclick = async () => {
    alert('Select a message on the chat.\nThe message below it will be deleted.');
    toggleWindow();
    const id = await messagePicker.grab('after');
    if (id) $('input#minId').value = id;
    toggleWindow();
  };
  $('#pickMessageBefore').onclick = async () => {
    alert('Select a message on the chat.\nThe message above it will be deleted.');
    toggleWindow();
    const id = await messagePicker.grab('before');
    if (id) $('input#maxId').value = id;
    toggleWindow();
  };
  $('button#getToken').onclick = () => $('input#token').value = fillToken();

  // sync advanced settings
  $('input#searchDelay').onchange = (e) => {
    const v = parseInt(e.target.value);
    if (v) undiscordCore.options.searchDelay = v;
  };
  $('input#deleteDelay').onchange = (e) => {
    const v = parseInt(e.target.value);
    if (v) undiscordCore.options.deleteDelay = v;
  };
  $('input#rateLimitPrevention').onchange = (e) => {
    undiscordCore.options.rateLimitPrevention = e.target.checked ?? false;
  };

  $('input#searchDelay').addEventListener('input', (event) => {
    $('div#searchDelayValue').textContent = event.target.value + 'ms';
  });
  $('input#deleteDelay').addEventListener('input', (event) => {
    $('div#deleteDelayValue').textContent = event.target.value + 'ms';
  });

  // import json
  const fileSelection = $('input#importJsonInput');
  fileSelection.onchange = async () => {
    const files = fileSelection.files;

    // No files added
    if (files.length === 0) return log.warn('No file selected.');

    // Get channel id field to set it later
    const channelIdField = $('input#channelId');

    // Force the guild id to be 'null' (placeholder value)
    const guildIdField = $('input#guildId');
    guildIdField.value = 'null';

    // Set author id in case its not set already
    $('input#authorId').value = getAuthorId();
    try {
      const file = files[0];
      const text = await file.text();
      const json = JSON.parse(text);
      const channelIds = Object.keys(json);
      channelIdField.value = channelIds.join(',');
      log.info(`Loaded ${channelIds.length} channels.`);
    } catch(err) {
      log.error('Error parsing file!', err);
    }
  };

  // redirect console logs to inside the window after setting up the UI
  setLogFn(printLog);

  setupUndiscordCore();
}

function printLog(type = '', args) {
  ui.logArea.insertAdjacentHTML('beforeend', `<div class="log log-${type}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);

  if (ui.trimLog.checked) {
    const maxLogEntries = 500;
    const logEntries = ui.logArea.querySelectorAll('.log');
    if (logEntries.length > maxLogEntries) {
      for (let i = 0; i < (logEntries.length - maxLogEntries); i++) {
        logEntries[i].remove();
      }
    }
  }

  if (ui.autoScroll.checked) ui.logArea.querySelector('div:last-child').scrollIntoView(false);
  if (type==='error') console.error(PREFIX, ...Array.from(args));
}

function setupUndiscordCore() {

  undiscordCore.onStart = (state, stats) => {
    console.log(PREFIX, 'onStart', state, stats);
    $('#start').disabled = true;
    $('#stop').disabled = false;

    ui.undiscordBtn.classList.add('running');
    ui.progressMain.style.display = 'block';
    ui.percent.style.display = 'block';
  };

  undiscordCore.onProgress = (state, stats) => {
    // console.log(PREFIX, 'onProgress', state, stats);
    let max = state.grandTotal;
    const value = state.delCount + state.failCount;
    max = Math.max(max, value, 0); // clamp max

    // status bar
    const percent = value >= 0 && max ? Math.round(value / max * 100) + '%' : '';
    const elapsed = msToHMS(Date.now() - stats.startTime.getTime());
    const remaining = msToHMS(stats.etr);
    ui.percent.innerHTML = `${percent} (${value}/${max}) Elapsed: ${elapsed} Remaining: ${remaining}`;

    ui.progressIcon.value = value;
    ui.progressMain.value = value;

    // indeterminate progress bar
    if (max) {
      ui.progressIcon.setAttribute('max', max);
      ui.progressMain.setAttribute('max', max);
    } else {
      ui.progressIcon.removeAttribute('value');
      ui.progressMain.removeAttribute('value');
      ui.percent.innerHTML = '...';
    }

    // update delays
    const searchDelayInput = $('input#searchDelay');
    searchDelayInput.value = undiscordCore.options.searchDelay;
    $('div#searchDelayValue').textContent = undiscordCore.options.searchDelay+'ms';

    const deleteDelayInput = $('input#deleteDelay');
    deleteDelayInput.value = undiscordCore.options.deleteDelay;
    $('div#deleteDelayValue').textContent = undiscordCore.options.deleteDelay+'ms';
  };

  undiscordCore.onStop = (state, stats) => {
    console.log(PREFIX, 'onStop', state, stats);
    $('#start').disabled = false;
    $('#stop').disabled = true;
    ui.undiscordBtn.classList.remove('running');
    ui.progressMain.style.display = 'none';
    ui.percent.style.display = 'none';
  };
}

async function startAction() {
  console.log(PREFIX, 'startAction');
  // general
  const authorId = $('input#authorId').value.trim();
  const guildId = $('input#guildId').value.trim();
  const channelIds = $('input#channelId').value.trim().split(/\s*,\s*/);
  const includeNsfw = $('input#includeNsfw').checked;
  // wipe archive
  const includeServers = $('input#includeServers').checked;
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
  const rateLimitPrevention = $('input#rateLimitPrevention').checked;
 
  // token
  const authToken = $('input#token').value.trim() || fillToken();
  if (!authToken) return; // get token already logs an error.
  
  // validate input
  if (!guildId) return log.error('You must fill the "Server ID" field!');
 
  // clear logArea
  ui.logArea.innerHTML = '';

  undiscordCore.resetState();
  undiscordCore.options = {
    ...undiscordCore.options,
    authToken,
    authorId,
    guildId,
    channelId: channelIds.length === 1 ? channelIds[0] : undefined, // single or multiple channel
    minId: minId || minDate,
    maxId: maxId || maxDate,
    content,
    hasLink,
    hasFile,
    includeNsfw,
    includeServers,
    includePinned,
    pattern,
    searchDelay,
    deleteDelay,
    rateLimitPrevention,
    // maxAttempt: 2,
  };

  // multiple guilds and channels
  const FALSE = false;
  if (FALSE) {
    // TODO: import feature
    const jobs = [].map(x => ({
      guildId: x.guildId,
      channelId: x.ch,
    }));

    try {
      await undiscordCore.runBatch(jobs);
    } catch (err) {
      log.error('CoreException', err);
    }
  }
  // multiple channels
  else if (channelIds.length > 1) {
    const jobs = channelIds.map(ch => ({
      guildId: null,
      channelId: ch,
    }));

    try {
      await undiscordCore.runBatch(jobs);
    } catch (err) {
      log.error('CoreException', err);
    }
  }
  // single channel
  else {
    try {
      await undiscordCore.run();
    } catch (err) {
      log.error('CoreException', err);
      undiscordCore.stop();
    }
  }
}

function stopAction() {
  console.log(PREFIX, 'stopAction');
  undiscordCore.stop();
}

export default initUI;

// ---- END Undiscord ----