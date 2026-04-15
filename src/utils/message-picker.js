import { insertCss } from './dom.js';

const messagePickerCss = `
body.undiscord-pick-message [data-list-id="chat-messages"] {
  background-color: var(--background-surface-low, var(--background-secondary-alt));
  box-shadow: inset 0 0 0px 2px var(--brand-500, var(--button-outline-brand-border));
}

body.undiscord-pick-message [id^="message-content-"]:hover {
  cursor: pointer;
  cursor: cell;
  background: var(--background-message-automod-hover, var(--message-highlight-background-default, rgba(255, 199, 0, 0.1)));
}
body.undiscord-pick-message [id^="message-content-"]:hover::after {
  position: absolute;
  top: calc(50% - 11px);
  left: 4px;
  z-index: 1;
  width: 65px;
  height: 22px;
  line-height: 22px;
  font-family: var(--font-display);
  background-color: var(--control-secondary-background-default, var(--button-secondary-background));
  color: var(--text-muted, var(--header-secondary));
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  border-radius: 3px;
  content: 'This 👉';
}
body.undiscord-pick-message.before [id^="message-content-"]:hover::after {
  content: 'Before 👆';
}
body.undiscord-pick-message.after [id^="message-content-"]:hover::after {
  content: 'After 👇';
}
`;

const PICKER_TIMEOUT_MS = 30000;

const messagePicker = {
  /** Inject picker CSS into the document. */
  init() {
    insertCss(messagePickerCss);
  },

  /**
   * Wait for the user to click a message in the chat.
   * @param {string} [auxiliary] - Direction class ('before' or 'after')
   * @returns {Promise<string|null>} Message ID or null on timeout
   */
  grab(auxiliary) {
    return new Promise((resolve) => {
      document.body.classList.add('undiscord-pick-message');
      if (auxiliary) document.body.classList.add(auxiliary);

      function cleanup() {
        if (auxiliary) document.body.classList.remove(auxiliary);
        document.body.classList.remove('undiscord-pick-message');
        document.removeEventListener('click', clickHandler);
        clearTimeout(timeout);
      }

      function clickHandler(e) {
        const message = e.target.closest('[id^="message-content-"]');
        if (message) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          cleanup();
          try {
            resolve(message.id.match(/message-content-(\d+)/)[1]);
          } catch (e) {
            resolve(null);
          }
        }
      }

      const timeout = setTimeout(() => {
        cleanup();
        resolve(null);
      }, PICKER_TIMEOUT_MS);

      document.addEventListener('click', clickHandler);
    });
  }
};

export default messagePicker;
window.messagePicker = messagePicker;
