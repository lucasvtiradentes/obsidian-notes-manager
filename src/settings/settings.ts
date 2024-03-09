import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

export type TPluginSettings = {
  mySetting: string;
};

export const DEFAULT_SETTINGS: TPluginSettings = {
  mySetting: "default",
};

interface PluginWithSettings extends Plugin {
  settings: TPluginSettings;
  saveSettings(): Promise<void>;
}

// prettier-ignore
export class NotesManagerSettings<T extends PluginWithSettings> extends PluginSettingTab {
  plugin: T;

  constructor(app: App, plugin: T) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Setting #1")
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder("Enter your secret")
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
