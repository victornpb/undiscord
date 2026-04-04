// ==UserScript==
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* global GM_getValue, GM_setValue */  // ESLint inline comment

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

  // progress handler
  progressMain: null,
  progressIcon: null,
  percent: null,
};
const $ = s => ui.undiscordWindow.querySelector(s);

const msLabel = ms => `${ms}ms (${+(ms / 1000).toFixed(1)}s)`;

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
    const toolbar = document.querySelector('#app-mount [class*="toolbar"]')
      || document.querySelector('[class*="toolBar"]')
      || document.querySelector('[class*="chat"]')
      || document.body;
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
      if (!discordElm.contains(ui.undiscordBtn)) mountBtn();
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
  ui.progressMain = $('#progressBar');
  ui.progressIcon = ui.undiscordBtn.querySelector('progress');
  ui.percent = $('#progressPercent');

  // register event listeners
  $('#hide').onclick = toggleWindow;
  $('#toggleSidebar').onclick = () => ui.undiscordWindow.classList.toggle('hide-sidebar');
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

  // import JSON file name display
  const importJsonInput = $('input#importJsonInput');
  const importJsonFileName = $('#importJsonFileName');
  if (importJsonInput && importJsonFileName) {
    importJsonInput.addEventListener('change', () => {
      const name = importJsonInput.files && importJsonInput.files.length
        ? importJsonInput.files[0].name
        : 'No file selected';
      importJsonFileName.textContent = name;
      importJsonFileName.title = importJsonInput.files?.length ? name : '';
    });
  }

  // Theme switcher — persisted via GM storage so it survives page refreshes
  const themeSelect = $('#themeSelect');
  const savedTheme = GM_getValue('ud-theme', 'default');
  ui.undiscordWindow.dataset.theme = savedTheme;
  themeSelect.value = savedTheme;
  themeSelect.oninput = (e) => {
    ui.undiscordWindow.dataset.theme = e.target.value;
    GM_setValue('ud-theme', e.target.value);
  };
  themeSelect.addEventListener('mousedown', e => e.stopPropagation());

  // Credits modal
  const creditsModal = $('#creditsModal');
  $('#creditsBtn').onclick = () => { creditsModal.style.display = 'flex'; };
  $('#creditsClose').onclick = () => { creditsModal.style.display = 'none'; };
  creditsModal.onclick = (e) => { if (e.target === creditsModal) creditsModal.style.display = 'none'; };

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

  // Delay sliders — persist values and update label
  $('input#searchDelay').oninput = (e) => {
    const v = parseInt(e.target.value);
    if (v) { undiscordCore.options.searchDelay = v; GM_setValue('ud-searchDelay', v); }
    $('div#searchDelayValue').textContent = msLabel(e.target.value);
  };
  $('input#deleteDelay').oninput = (e) => {
    const v = parseInt(e.target.value);
    if (v) { undiscordCore.options.deleteDelay = v; GM_setValue('ud-deleteDelay', v); }
    $('div#deleteDelayValue').textContent = msLabel(e.target.value);
  };

  // Restore saved delay values on load
  const savedSearchDelay = GM_getValue('ud-searchDelay', parseInt($('input#searchDelay').value));
  const savedDeleteDelay = GM_getValue('ud-deleteDelay', parseInt($('input#deleteDelay').value));
  $('input#searchDelay').value = savedSearchDelay;
  $('input#deleteDelay').value = savedDeleteDelay;
  undiscordCore.options.searchDelay = savedSearchDelay;
  undiscordCore.options.deleteDelay = savedDeleteDelay;
  $('div#searchDelayValue').textContent = msLabel(savedSearchDelay);
  $('div#deleteDelayValue').textContent = msLabel(savedDeleteDelay);

  // import json
  const fileSelection = $('input#importJsonInput');
  fileSelection.onchange = async () => {
    const files = fileSelection.files;

    // No files added
    if (files.length === 0) return log.warn('No file selected.');

    // Get channel id field to set it later
    const channelIdField = $('input#channelId');

    // Force the guild id to be ourself (@me)
    const guildIdField = $('input#guildId');
    guildIdField.value = '@me';

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

  setupDateMask($('input#minDate'));
  setupDateMask($('input#maxDate'));
}

function printLog(type = '', args) {
  ui.logArea.insertAdjacentHTML('beforeend', `<div class="log log-${type}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);
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
    $('div#searchDelayValue').textContent = msLabel(undiscordCore.options.searchDelay);

    const deleteDelayInput = $('input#deleteDelay');
    deleteDelayInput.value = undiscordCore.options.deleteDelay;
    $('div#deleteDelayValue').textContent = msLabel(undiscordCore.options.deleteDelay);
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

function setupDateMask(input) {
  const separators = { 4: '-', 7: '-', 10: ' ', 13: ':' };
  const sepPositions = new Set([4, 7, 10, 13]);
  const mask = 'YYYY-MM-DD HH:MM';

  const overlay   = input.parentElement.querySelector('.date-mask-overlay');
  const typedSpan = overlay.querySelector('.typed');
  const hintSpan  = overlay.querySelector('.remaining');
  const fakeCaret = overlay.querySelector('.date-fake-caret');

  function updateOverlay() {
    const val = input.value;
    typedSpan.textContent = val;
    hintSpan.textContent  = mask.slice(val.length);
  }
  input.addEventListener('focus', () => {
    if (fakeCaret) fakeCaret.style.display = 'inline-block';
    updateOverlay();
  });
  input.addEventListener('blur', () => {
    if (fakeCaret) fakeCaret.style.display = 'none';
  });

  // Returns max digit allowed at a given formatted-string position
  function maxDigit(pos, val) {
    const month = parseInt(val.slice(5, 7));
    const year  = parseInt(val.slice(0, 4)) || 2000;
    switch (pos) {
      case 5:  return 1;
      case 6:  return parseInt(val[5]) === 1 ? 2 : 9;
      case 8:  {
        const maxDay = (!isNaN(month) && month >= 1 && month <= 12)
          ? new Date(year, month, 0).getDate() : 31;
        return Math.floor(maxDay / 10);
      }
      case 9:  {
        const d1 = parseInt(val[8]);
        const maxDay = (!isNaN(month) && month >= 1 && month <= 12)
          ? new Date(year, month, 0).getDate() : 31;
        return Math.min(maxDay - d1 * 10, 9);
      }
      case 11: return 2;
      case 12: return parseInt(val[11]) === 2 ? 3 : 9;
      case 14: return 5;
      default: return 9;
    }
  }

  // Returns min digit allowed (prevents 00 month / 00 day)
  function minDigit(pos, val) {
    if (pos === 6 && parseInt(val[5]) === 0) return 1;
    if (pos === 9 && parseInt(val[8]) === 0) return 1;
    return 0;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const val = input.value;
      if (!val) return;
      const lastIsSep = ['-', ' ', ':'].includes(val[val.length - 1]);
      input.value = (lastIsSep && val.length >= 2) ? val.slice(0, -2) : val.slice(0, -1);
      updateOverlay();
      return;
    }

    if (['Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    if (input.value.length >= 16) { e.preventDefault(); return; }

    let targetPos = input.value.length;
    if (sepPositions.has(targetPos)) targetPos++;

    const digit = parseInt(e.key);
    if (digit > maxDigit(targetPos, input.value) ||
        digit < minDigit(targetPos, input.value)) {
      e.preventDefault();
      return;
    }
  });

  input.addEventListener('input', () => {
    let digits = input.value.replace(/\D/g, '');
    let result = '';
    for (let i = 0; i < digits.length && result.length < 16; i++) {
      if (separators[result.length]) {
        result += separators[result.length];
        if (result.length >= 16) break;
      }
      result += digits[i];
    }
    if (separators[result.length] && result.length < 16) {
      result += separators[result.length];
    }
    input.value = result;
    updateOverlay();
  });

  updateOverlay();
}

function parseDateField(val) {
  if (!val || val.length < 10) return '';
  return val.trim().replace(' ', 'T');
}

async function startAction() {
  console.log(PREFIX, 'startAction');
  // general
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
  // date range parsed from masked text input "YYYY-MM-DD HH:MM"
  const minDate = parseDateField($('input#minDate').value);
  const maxDate = parseDateField($('input#maxDate').value);
  // advanced
  const searchDelay = parseInt($('input#searchDelay').value.trim());
  const deleteDelay = parseInt($('input#deleteDelay').value.trim());

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
    channelId: channelIds.length === 1 ? channelIds[0] : undefined,
    minId: minId || minDate,
    maxId: maxId || maxDate,
    content,
    hasLink,
    hasFile,
    includeNsfw,
    includePinned,
    pattern,
    searchDelay,
    deleteDelay,
  };

  // multiple channels
  if (channelIds.length > 1) {
    const jobs = channelIds.map(ch => ({
      guildId: guildId,
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

// ---- END Undiscord ---
