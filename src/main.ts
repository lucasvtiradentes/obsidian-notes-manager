import { Plugin } from 'obsidian';

import { addEditorCommandsToObsidian } from './commands/editor_commands';
import { addFileCommandsToObsidian } from './commands/file_commands';
import { addKeybindedCommandsToObsidian } from './commands/keybinded_commands';
import { addPalletCommandsToObsidian } from './commands/pallet_commands';
import { CONFIGS } from './consts';
import { addRibbonToObsidian } from './ribbon/ribbon';
import { TPluginSettings, addSettingsToObsidian } from './settings/settings';

export default class NotesManager extends Plugin {
  settings: TPluginSettings;

  async onload() {
    await this.loadSettings();
    addSettingsToObsidian.call(this);
    addRibbonToObsidian.call(this);

    addPalletCommandsToObsidian.call(this);
    addKeybindedCommandsToObsidian.call(this);
    addFileCommandsToObsidian.call(this);
    addEditorCommandsToObsidian.call(this);
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, CONFIGS.settings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
