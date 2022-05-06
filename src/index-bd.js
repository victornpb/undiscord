import { initUI, destroy, toggleWindow } from './undiscord';

export default class Undiscord {
  // Required function. Called when the plugin is activated (including after reloads)
  start() {
    initUI();
  }

  getSettingsPanel() {
    toggleWindow(true);
  }

  // Required function. Called when the plugin is deactivated
  stop() {
    destroy();
  }
}
