import { VERSION } from 'process.env';

import layoutCss from './css/layout.css';
import componentsCss from './css/components.css';
import scrollbarCss from './css/scrollbar.css';
import redactCss from './css/redact.css';
import logCss from './css/log.css';
import dragCss from './css/drag.css';
import buttonHtml from './html/undiscord-button.html';
import undiscordTemplate from './html/undiscord.html';

import UndiscordCore from '../core/undiscord-core.js';
import Drag from '../utils/drag.js';
import { createElm, insertCss } from '../utils/dom.js';
import messagePicker from '../utils/message-picker.js';
import { setLogFn } from '../utils/log.js';
import { replaceInterpolations } from '../utils/html.js';
import { OBSERVER_THROTTLE_MS } from '../utils/constants.js';

import { createPrintLog } from './logger.js';
import { setupProgress } from './progress.js';
import { registerHandlers } from './handlers.js';

const HOME = 'https://github.com/victornpb/undiscord';
const WIKI = 'https://github.com/victornpb/undiscord/wiki';

const undiscordCore = new UndiscordCore();
messagePicker.init();

const ui = {
  undiscordWindow: null,
  undiscordBtn: null,
  logArea: null,
  autoScroll: null,
  progressMain: null,
  progressIcon: null,
  percent: null,
};

/**
 * Initialize the Undiscord UI: mount DOM, inject CSS, register handlers.
 */
function initUI() {
  // inject all CSS
  insertCss(layoutCss);
  insertCss(componentsCss);
  insertCss(scrollbarCss);
  insertCss(redactCss);
  insertCss(logCss);
  insertCss(dragCss);

  // create undiscord window
  const undiscordUI = replaceInterpolations(undiscordTemplate, { VERSION, HOME, WIKI });
  ui.undiscordWindow = createElm(undiscordUI);
  document.body.appendChild(ui.undiscordWindow);

  const $ = s => ui.undiscordWindow.querySelector(s);

  // enable drag and resize
  new Drag({ elm: ui.undiscordWindow, moveHandle: $('.header') });

  // create trash icon button
  ui.undiscordBtn = createElm(buttonHtml);
  ui.undiscordBtn.onclick = toggleWindow;
  function mountBtn() {
    const toolbar = document.querySelector('#app-mount [class*="toolbar__"]') || document.querySelector('#app-mount [class*="-toolbar"]');
    if (toolbar) toolbar.appendChild(ui.undiscordBtn);
  }
  mountBtn();

  // watch for DOM changes and re-mount button
  const discordElm = document.querySelector('#app-mount');
  if (discordElm) {
    let observerThrottle = null;
    const observer = new MutationObserver(() => {
      if (observerThrottle) return;
      observerThrottle = setTimeout(() => {
        observerThrottle = null;
        if (!discordElm.contains(ui.undiscordBtn)) mountBtn();
      }, OBSERVER_THROTTLE_MS);
    });
    observer.observe(discordElm, { attributes: false, childList: true, subtree: true });
  }

  function toggleWindow() {
    if (ui.undiscordWindow.style.display !== 'none') {
      ui.undiscordWindow.style.display = 'none';
      ui.undiscordBtn.style.color = 'var(--interactive-icon-default, var(--interactive-normal))';
    } else {
      ui.undiscordWindow.style.display = '';
      ui.undiscordBtn.style.color = 'var(--interactive-icon-active, var(--interactive-active))';
    }
  }

  // cache element references
  ui.logArea = $('#logArea');
  ui.autoScroll = $('#autoScroll');
  ui.progressMain = $('#progressBar');
  ui.progressIcon = ui.undiscordBtn.querySelector('progress');
  ui.percent = $('#progressPercent');

  // register handlers, progress, and log
  registerHandlers(undiscordCore, ui, $, toggleWindow);
  setupProgress(undiscordCore, ui, $);
  setLogFn(createPrintLog(ui));
}

export default initUI;
