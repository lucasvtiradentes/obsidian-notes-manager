import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

import NotesManager from '../main';

export type TPluginSettings = {
  one_level_note_first_column_name: string;
  one_level_note_second_column_name: string;
  two_level_note_first_column_name: string;
  two_level_note_second_column_name: string;
  two_level_note_third_column_name: string;
};

export const DEFAULT_SETTINGS: TPluginSettings = {
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
    const settings_section01 = containerEl.createEl('div', { cls: 'settings_section' });
    settings_section01.createEl('div', { text: 'One level notes configs', cls: 'settings_section_title' });

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

    const settings_section02 = containerEl.createEl('div', { cls: 'settings_section' });
    settings_section02.createEl('div', { text: 'Two level notes configs', cls: 'settings_section_title' });

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
