import { log } from '../utils/log.js';
import { getAuthorId, getGuildId, getChannelId, getChannelThread, fillToken } from '../utils/get-ids.js';
import messagePicker from '../utils/message-picker.js';

/**
 * Register all event handlers on the Undiscord UI.
 * @param {UndiscordCore} undiscordCore - Core instance
 * @param {Object} ui - UI element references
 * @param {Function} $ - Scoped querySelector shorthand
 * @param {Function} toggleWindow - Show/hide the Undiscord window
 */
export function registerHandlers(undiscordCore, ui, $, toggleWindow) {
  $('#hide').onclick = toggleWindow;
  $('#toggleSidebar').onclick = () => ui.undiscordWindow.classList.toggle('hide-sidebar');
  $('button#start').onclick = () => startAction(undiscordCore, ui, $);
  $('button#stop').onclick = () => undiscordCore.stop();
  $('button#clear').onclick = () => ui.logArea.innerHTML = '';
  $('button#getAuthor').onclick = () => $('input#authorId').value = getAuthorId();
  $('button#getGuild').onclick = () => {
    const guildId = $('input#guildId').value = getGuildId();
    if (guildId === '@me') $('input#channelId').value = getChannelId();
  };
  $('button#getChannel').onclick = async () => {
    try {
      const authToken = $('input#token').value.trim() || fillToken();
      if (authToken) {
        const threadInfo = await getChannelThread(authToken);
        if (threadInfo.isThread) {
          $('input#channelId').value = threadInfo.channelId;
          log.info(`Detected thread. Using parent channel ${threadInfo.channelId}, will filter by thread ${threadInfo.threadId}.`);
          ui._threadId = threadInfo.threadId;
          ui._isThread = true;
        } else {
          $('input#channelId').value = threadInfo.channelId || getChannelId();
          ui._threadId = null;
          ui._isThread = false;
        }
      } else {
        $('input#channelId').value = getChannelId();
        ui._threadId = null;
        ui._isThread = false;
      }
    } catch (err) {
      log.error('Failed to detect channel:', err);
      $('input#channelId').value = getChannelId();
      ui._threadId = null;
      ui._isThread = false;
    }
    $('input#guildId').value = getGuildId();
  };
  $('#redact').onchange = () => {
    const b = ui.undiscordWindow.classList.toggle('redact');
    if (b) alert('This mode will attempt to hide personal information, so you can screen share / take screenshots.\nAlways double check you are not sharing sensitive information!');
  };
  $('#pickMessageAfter').onclick = async () => {
    try {
      alert('Select a message on the chat.\nThe message below it will be deleted.');
      toggleWindow();
      const id = await messagePicker.grab('after');
      if (id) $('input#minId').value = id;
    } catch (err) {
      log.error('Failed to pick message:', err);
    }
    toggleWindow();
  };
  $('#pickMessageBefore').onclick = async () => {
    try {
      alert('Select a message on the chat.\nThe message above it will be deleted.');
      toggleWindow();
      const id = await messagePicker.grab('before');
      if (id) $('input#maxId').value = id;
    } catch (err) {
      log.error('Failed to pick message:', err);
    }
    toggleWindow();
  };
  $('button#getToken').onclick = () => $('input#token').value = fillToken();

  // sync delays
  $('input#searchDelay').onchange = (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v > 0) undiscordCore.options.searchDelay = v;
  };
  $('input#deleteDelay').onchange = (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v > 0) undiscordCore.options.deleteDelay = v;
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
    if (files.length === 0) return log.warn('No file selected.');

    const channelIdField = $('input#channelId');
    $('input#guildId').value = '@me';
    $('input#authorId').value = getAuthorId();

    try {
      const file = files[0];
      const text = await file.text();
      const json = JSON.parse(text);
      const channelIds = Object.keys(json);
      channelIdField.value = channelIds.join(',');
      log.info(`Loaded ${channelIds.length} channels.`);
    } catch (err) {
      log.error('Error parsing file!', err);
    }
  };
}

/**
 * Start the deletion process from UI input values.
 * @param {UndiscordCore} undiscordCore - Core instance
 * @param {Object} ui - UI element references
 * @param {Function} $ - Scoped querySelector shorthand
 */
async function startAction(undiscordCore, ui, $) {
  const authorId = $('input#authorId').value.trim();
  const guildId = $('input#guildId').value.trim();
  const channelIds = $('input#channelId').value.trim().split(/\s*,\s*/);
  const includeNsfw = $('input#includeNsfw').checked;
  const content = $('input#search').value.trim();
  const hasLink = $('input#hasLink').checked;
  const hasFile = $('input#hasFile').checked;
  const includePinned = $('input#includePinned').checked;
  const includeApplications = $('input#includeApplications').checked;
  const pattern = $('input#pattern').value;
  const minId = $('input#minId').value.trim();
  const maxId = $('input#maxId').value.trim();
  const minDate = $('input#minDate').value.trim();
  const maxDate = $('input#maxDate').value.trim();
  const searchDelay = parseInt($('input#searchDelay').value.trim(), 10);
  const deleteDelay = parseInt($('input#deleteDelay').value.trim(), 10);
  const emptyPageRetries = parseInt($('input#emptyPageRetries').value.trim(), 10);

  const authToken = $('input#token').value.trim() || fillToken();
  if (!authToken) return;
  if (!guildId) return log.error('You must fill the "Server ID" field!');

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
    includeApplications,
    pattern,
    searchDelay,
    deleteDelay,
    emptyPageRetries: isNaN(emptyPageRetries) ? 2 : emptyPageRetries,
    threadId: ui._threadId || null,
    isThread: ui._isThread || false,
  };

  if (channelIds.length > 1) {
    const jobs = channelIds.map(ch => ({ guildId, channelId: ch }));
    try {
      await undiscordCore.runBatch(jobs);
    } catch (err) {
      log.error('CoreException', err);
    }
  } else {
    try {
      await undiscordCore.run();
    } catch (err) {
      log.error('CoreException', err);
      undiscordCore.stop();
    }
  }
}
