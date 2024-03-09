import { Notice } from 'obsidian';
import { CONFIGS } from 'src/consts';
import NotesManager from 'src/main';

export function addRibbonToObsidian() {
  const typedThis = this as NotesManager;

  const ribbonIconEl = typedThis.addRibbonIcon(CONFIGS.ribbon.icon, CONFIGS.ribbon.title, () => {
    new Notice('This is a notice!');
  });

  ribbonIconEl.addClass(CONFIGS.ribbon.class_name);
}
