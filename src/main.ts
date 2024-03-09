import { Plugin } from "obsidian";

import { addCommandsToObsidian } from "./commands/commands";
import { addRibbonToObsidian } from "./ribbon/ribbon";
import {
  DEFAULT_SETTINGS,
  NotesManagerSettings,
  TPluginSettings,
} from "./settings/settings";

export default class NotesManager extends Plugin {
  settings: TPluginSettings;

  async onload() {
    await this.loadSettings();

    addRibbonToObsidian.call(this);
    addCommandsToObsidian.call(this);
    this.addSettingTab(new NotesManagerSettings(this.app, this));

    this.registerDomEvent(document, "click", (evt: MouseEvent) => {
      console.log("click", evt);
    });

    this.registerInterval(
      window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000),
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
