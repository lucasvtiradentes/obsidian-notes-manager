import { Plugin } from 'obsidian';

import { addEditorCommandsToObsidian } from './commands/contexts/editor_commands';
import { addFileCommandsToObsidian } from './commands/contexts/file_commands';
import { addKeybindedCommandsToObsidian } from './commands/contexts/keybinded_commands';
import { addPalletCommandsToObsidian } from './commands/contexts/pallet_commands';
import { styleAllFilesBadges, styleAllFilesExtensions } from './commands/toogle_custom_file_sufix';
import { CONFIGS, VISIBILITY_ENUM } from './consts';
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

    this.runWhenObsidianLoadVaultContent(() => {
      this.updateFilesStyles();

      const styledFolderAttribute = 'nm-styled';
      const allFolders = Array.from(document.querySelectorAll(`.${CONFIGS.obisidan_classes.folder_item}.${CONFIGS.obisidan_classes.collapsed_folder_item}`));

      for (const folderEl of allFolders) {
        folderEl.addEventListener('click', () => {
          const wasStyled = folderEl.getAttribute(styledFolderAttribute);
          if (!wasStyled) {
            this.updateFilesStyles();
            folderEl.setAttribute(styledFolderAttribute, 'true');
          }
        });
      }
    });
  }

  onunload() {}

  updateFilesStyles() {
    if (!this.settings.use_file_sufix) return;

    if (!this.settings.show_file_sufix) {
      styleAllFilesExtensions.call(this, VISIBILITY_ENUM.hide);
    }

    if (this.settings.show_file_badge) {
      styleAllFilesBadges.call(this, VISIBILITY_ENUM.show);
    }
  }

  runWhenObsidianLoadVaultContent(callBack: () => void) {
    const files = document.querySelectorAll(`.${CONFIGS.obisidan_classes.file_item}`);
    const folders = document.querySelectorAll(`.${CONFIGS.obisidan_classes.folder_item}`);

    if (files.length > 0 && folders.length > 0) {
      callBack();
    } else {
      setTimeout(() => {
        this.runWhenObsidianLoadVaultContent(callBack);
      }, 300);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, CONFIGS.settings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
