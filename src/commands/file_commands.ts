import { Notice } from 'obsidian';
import NotesManager from 'src/main';

export function addFileCommandsToObsidian() {
  const typedThis = this as NotesManager;

  typedThis.registerEvent(
    typedThis.app.workspace.on('file-menu', (menu, file) => {
      menu.addItem((item) => {
        item
          .setTitle('Print file path 👈')
          .setIcon('document')
          .onClick(async () => {
            new Notice(file.path);
          });
      });
    })
  );
}
