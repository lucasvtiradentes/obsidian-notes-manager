import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { styleAllFilesBadges, styleAllFilesExtensions } from '../commands/toogle_custom_file_sufix';
import { CONFIGS } from '../consts';
import NotesManager from '../main';
import { constArrayToEnumObject } from '../utils/array_utils';

export type TPluginSettings = {
  use_file_sufix: boolean;
  show_file_badge: boolean;
  show_file_sufix: boolean;
  file_sufix: string;
  one_level_note_first_column_name: string;
  one_level_note_second_column_name: string;
  two_level_note_first_column_name: string;
  two_level_note_second_column_name: string;
  two_level_note_third_column_name: string;
};

export const DEFAULT_SETTINGS: TPluginSettings = {
  use_file_sufix: true,
  show_file_badge: true,
  show_file_sufix: false,
  file_sufix: '.nm',
  one_level_note_first_column_name: 'theme',
  one_level_note_second_column_name: 'link',
  two_level_note_first_column_name: 'theme',
  two_level_note_second_column_name: 'topic',
  two_level_note_third_column_name: 'link'
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
    const elementClasses = constArrayToEnumObject(['show_file_badge_section', 'file_sufix_section', 'show_file_sufix_section']);

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    const modifyDependentSettings = (mode: 'show' | 'hide') => {
      for (const item of Object.values(elementClasses)) {
        const element = containerEl.getElementsByClassName(item)[0];

        if (mode === 'show') {
          if (element.classList.contains(CONFIGS.css_classes.settings_section_hided)) {
            element.classList.remove(CONFIGS.css_classes.settings_section_hided);
          }
        } else {
          element.classList.add(CONFIGS.css_classes.settings_section_hided);
        }
      }
    };

    const shouldHideFileSufix = (value: boolean) => {
      if (value) {
        styleAllFilesExtensions.call(this.plugin, 'show');
      } else {
        styleAllFilesExtensions.call(this.plugin, 'hide');
      }
    };

    const settings_section01 = containerEl.createEl('div', { cls: CONFIGS.css_classes.settings_section });
    settings_section01.createEl('div', { text: 'General configs', cls: CONFIGS.css_classes.settings_section_title });

    new Setting(containerEl).setName('Use custom file sufix').addToggle((toggle) =>
      toggle.setValue(settings.use_file_sufix).onChange(async (value) => {
        settings.use_file_sufix = value;
        await this.plugin.saveSettings();
        if (value) {
          modifyDependentSettings('show');
          shouldHideFileSufix(settings.show_file_sufix);
        } else {
          modifyDependentSettings('hide');
          styleAllFilesExtensions.call(this.plugin, 'show');
        }
      })
    );

    new Setting(containerEl)
      .setName('Show custom file badge')
      .setClass(elementClasses.show_file_badge_section)
      .addToggle((toggle) =>
        toggle.setValue(settings.show_file_badge).onChange(async (value) => {
          settings.show_file_badge = value;
          await this.plugin.saveSettings();
          if (value) {
            styleAllFilesBadges.call(this.plugin, 'show');
          } else {
            styleAllFilesBadges.call(this.plugin, 'hide');
          }
        })
      );

    new Setting(containerEl)
      .setName('Show custom file sufix')
      .setClass(elementClasses.show_file_sufix_section)
      .addToggle((toggle) =>
        toggle.setValue(settings.show_file_sufix).onChange(async (value) => {
          settings.show_file_sufix = value;
          shouldHideFileSufix(value);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Custom file sufix')
      .setClass(elementClasses.file_sufix_section)
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
