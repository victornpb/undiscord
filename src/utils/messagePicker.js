import insertCss from './insertCss';

const messagePickerCss = `
body.undiscord-pick-message [data-list-id="chat-messages"] {
  background-color: var(--background-secondary-alt);
  box-shadow: inset 0 0 0px 2px var(--button-outline-brand-border);
}

body.undiscord-pick-message [id^="message-content-"]:hover {
  cursor: pointer;
  cursor: cell;
  background: var(--background-message-automod-hover);
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
  background-color: var(--button-secondary-background);
  color: var(--header-secondary);
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

const messagePicker = {
  init() {
    insertCss(messagePickerCss);
  },
  grab(auxiliary) {
    return new Promise((resolve, reject) => {
      document.body.classList.add('undiscord-pick-message');
      if (auxiliary) document.body.classList.add(auxiliary);
      function clickHandler(e) {
        const message = e.target.closest('[id^="message-content-"]');
        if (message) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (auxiliary) document.body.classList.remove(auxiliary);
          document.body.classList.remove('undiscord-pick-message');
          document.removeEventListener('click', clickHandler);
          try {
            resolve(message.id.match(/message-content-(\d+)/)[1]);
          } catch (e) {
            resolve(null);
          }
        }
      }
      document.addEventListener('click', clickHandler);
    });
  }
};

export default messagePicker;
window.messagePicker = messagePicker;