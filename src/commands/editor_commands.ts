import { Notice } from 'obsidian';
import NotesManager from 'src/main';

export function addEditorCommandsToObsidian() {
  const typedThis = this as NotesManager;

  typedThis.registerEvent(
    typedThis.app.workspace.on('editor-menu', (menu, editor, view) => {
      menu.addItem((item) => {
        item
          .setTitle('Print file path 👈')
          .setIcon('document')
          .onClick(async () => {
            new Notice(view.file?.path ?? '');
          });
      });
    })
  );
}
