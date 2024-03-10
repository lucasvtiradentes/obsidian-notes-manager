import { Plugin } from 'obsidian';

import { addEditorCommandsToObsidian } from './commands/contexts/editor_commands';
import { addFileCommandsToObsidian } from './commands/contexts/file_commands';
import { addKeybindedCommandsToObsidian } from './commands/contexts/keybinded_commands';
import { addPalletCommandsToObsidian } from './commands/contexts/pallet_commands';
import { styleAllFilesBadges, styleAllFilesExtensions } from './commands/toogle_custom_file_sufix';
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

    this.registerExtensions(['json'], 'markdown');

    window.setTimeout(() => {
      if (!this.settings.use_file_sufix) return;

      if (!this.settings.show_file_sufix) {
        styleAllFilesExtensions.call(this, 'hide');
      }

      if (this.settings.show_file_badge) {
        styleAllFilesBadges.call(this, 'show');
      }
    }, 2 * 1000);
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, CONFIGS.settings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
