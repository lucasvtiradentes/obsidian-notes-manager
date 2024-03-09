import { Notice, Plugin } from 'obsidian';

export function addFileCommandsToObsidian() {
  const typedThis = this as Plugin;

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
