import { production } from 'process.env';

import { initUI, destroy } from './undiscord';
initUI();

if (!production) {
  // expose globals
  window.undiscord = {
    init: initUI,
    destroy,
  };
}
