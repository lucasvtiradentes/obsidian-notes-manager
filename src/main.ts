import { Plugin } from 'obsidian';

import { addCommandsToObsidian } from './commands/commands';
import { CONSTANTS } from './consts';
import { addRibbonToObsidian } from './ribbon/ribbon';
import { TPluginSettings, addSettingsToObsidian } from './settings/settings';

export default class NotesManager extends Plugin {
  settings: TPluginSettings;

  async onload() {
    await this.loadSettings();
    addRibbonToObsidian.call(this);
    addCommandsToObsidian.call(this);
    addSettingsToObsidian.call(this);
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, CONSTANTS.settings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
