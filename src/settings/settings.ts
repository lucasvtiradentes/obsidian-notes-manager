import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { toogleCustomFileSufix } from '../commands/toogle_custom_file_sufix';
import { CONFIGS } from '../consts';
import NotesManager from '../main';
import { constArrayToEnumObject } from '../utils/array_utils';

export type TPluginSettings = {
  use_file_sufix: boolean;
  hide_file_sufix: boolean;
  file_sufix: string;
  one_level_note_first_column_name: string;
  one_level_note_second_column_name: string;
  two_level_note_first_column_name: string;
  two_level_note_second_column_name: string;
  two_level_note_third_column_name: string;
};

export const DEFAULT_SETTINGS: TPluginSettings = {
  use_file_sufix: true,
  hide_file_sufix: true,
  file_sufix: '.nm',
  one_level_note_first_column_name: 'THEME',
  one_level_note_second_column_name: 'LINK',
  two_level_note_first_column_name: 'THEME',
  two_level_note_second_column_name: 'TOPIC',
  two_level_note_third_column_name: 'LINK'
};

interface PluginWithSettings extends Plugin {
  settings: TPluginSettings;
  saveSettings(): Promise<void>;
}

export function addSettingsToObsidian() {
  const typedThis = this as NotesManager;
  typedThis.addSettingTab(new NotesManagerSettings(typedThis.app, typedThis));
}

export class NotesManagerSettings<T extends PluginWithSettings> extends PluginSettingTab {
  plugin: T;

  constructor(app: App, plugin: T) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const settings = this.plugin.settings;

    const elementClasses = constArrayToEnumObject(['fileSufix', 'hideFileSufix']);

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    const modifyDependentSettings = (mode: 'show' | 'hide') => {
      const hideFileSufixEl = containerEl.getElementsByClassName(elementClasses.hideFileSufix)[0];
      const fileSufixEl = containerEl.getElementsByClassName(elementClasses.fileSufix)[0];

      if (mode === 'show') {
        hideFileSufixEl?.setAttribute('style', 'display: block;');
        fileSufixEl?.setAttribute('style', 'display: block;');
      } else if (mode === 'hide') {
        hideFileSufixEl?.setAttribute('style', 'display: none;');
        fileSufixEl?.setAttribute('style', 'display: none;');
      }
    };

    const shouldHideFileSufix = (value: boolean) => {
      if (value) {
        toogleCustomFileSufix.call(this.plugin, 'hide');
      } else {
        toogleCustomFileSufix.call(this.plugin, 'show');
      }
    };

    const settings_section01 = containerEl.createEl('div', { cls: CONFIGS.css_classes.settings_section });
    settings_section01.createEl('div', { text: 'General configs', cls: CONFIGS.css_classes.settings_section_title });

    new Setting(containerEl).setName('Use file sufix').addToggle((toggle) =>
      toggle.setValue(settings.use_file_sufix).onChange(async (value) => {
        settings.use_file_sufix = value;
        await this.plugin.saveSettings();
        if (value) {
          modifyDependentSettings('show');
          shouldHideFileSufix(settings.hide_file_sufix);
        } else {
          modifyDependentSettings('hide');
          toogleCustomFileSufix.call(this.plugin, 'show');
        }
      })
    );

    new Setting(containerEl)
      .setName('Hide file sufix')
      .setClass(elementClasses.hideFileSufix)
      .addToggle((toggle) =>
        toggle.setValue(settings.hide_file_sufix).onChange(async (value) => {
          settings.hide_file_sufix = value;
          shouldHideFileSufix(value);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('File sufix')
      .setClass(elementClasses.fileSufix)
      .addText((text) =>
        text
          .setPlaceholder('Type the file sufix')
          .setValue(settings.file_sufix)
          .onChange(async (value) => {
            value = value.replace(/[^a-zA-Z]/g, '');

            if (!value.startsWith('.')) {
              value = '.' + value;
            }
            settings.file_sufix = value;
            await this.plugin.saveSettings();
          })
      );

    if (settings.use_file_sufix) {
      modifyDependentSettings('show');
    } else {
      modifyDependentSettings('hide');
    }

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    const settings_section02 = containerEl.createEl('div', { cls: CONFIGS.css_classes.settings_section });
    settings_section02.createEl('div', { text: 'One level notes configs', cls: CONFIGS.css_classes.settings_section_title });

    new Setting(containerEl).setName('First column name').addText((text) =>
      text
        .setPlaceholder('Type the column header name')
        .setValue(settings.one_level_note_first_column_name)
        .onChange(async (value) => {
          settings.one_level_note_first_column_name = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Second column name').addText((text) =>
      text
        .setPlaceholder('Type the column header name')
        .setValue(settings.one_level_note_second_column_name)
        .onChange(async (value) => {
          settings.one_level_note_second_column_name = value;
          await this.plugin.saveSettings();
        })
    );

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    const settings_section03 = containerEl.createEl('div', { cls: CONFIGS.css_classes.settings_section });
    settings_section03.createEl('div', { text: 'Two level notes configs', cls: CONFIGS.css_classes.settings_section_title });

    new Setting(containerEl).setName('First column name').addText((text) =>
      text
        .setPlaceholder('Type the column header name')
        .setValue(settings.two_level_note_first_column_name)
        .onChange(async (value) => {
          settings.two_level_note_first_column_name = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Second column name').addText((text) =>
      text
        .setPlaceholder('Type the column header name')
        .setValue(settings.two_level_note_second_column_name)
        .onChange(async (value) => {
          settings.two_level_note_second_column_name = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Third column name').addText((text) =>
      text
        .setPlaceholder('Type the column header name')
        .setValue(settings.two_level_note_third_column_name)
        .onChange(async (value) => {
          settings.two_level_note_third_column_name = value;
          await this.plugin.saveSettings();
        })
    );
  }
}
