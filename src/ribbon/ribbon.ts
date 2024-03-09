import { Notice } from 'obsidian';
import { CONSTANTS } from 'src/consts';
import NotesManager from 'src/main';

export function addRibbonToObsidian() {
  const typedThis = this as NotesManager;

  const ribbonIconEl = typedThis.addRibbonIcon(CONSTANTS.ribbon.icon, CONSTANTS.ribbon.title, () => {
    new Notice('This is a notice!');
  });

  ribbonIconEl.addClass(CONSTANTS.ribbon.class_name);
}
