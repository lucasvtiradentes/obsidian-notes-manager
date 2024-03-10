import { App, Modal } from 'obsidian';

import NotesManager from '../main';

export function showModal() {
  const typedThis = this as NotesManager;
  new SampleModal(typedThis.app).open();
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
