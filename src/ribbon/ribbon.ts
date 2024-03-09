import { Notice, Plugin } from 'obsidian';
import { CONFIGS } from 'src/consts';

export function addRibbonToObsidian() {
  const typedThis = this as Plugin;

  const ribbonIconEl = typedThis.addRibbonIcon(CONFIGS.ribbon.icon, CONFIGS.ribbon.title, () => {
    new Notice('This is a notice!');
  });

  ribbonIconEl.addClass(CONFIGS.ribbon.class_name);
}
