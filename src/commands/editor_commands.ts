import NotesManager from 'src/main';

export function addEditorCommandsToObsidian() {
  const typedThis = this as NotesManager;

  typedThis.registerEvent(
    typedThis.app.workspace.on('editor-menu', (menu, _editor, _view) => {
      menu.addItem((item) => {
        item
          .setTitle('Print file path 👈')
          .setIcon('document')
          .onClick(async () => {
            const noteFile = typedThis.app.workspace.getActiveFile();
            const noteFileContent = await this.app.vault.read(noteFile);
            console.log(noteFileContent);
          });
      });
    })
  );
}
