import { commandsArr } from '../../commands/available_commands';
import NotesManager from '../../main';
import { getFileType } from '../../utils/obsidian_utils';

export function addFileCommandsToObsidian() {
  const typedThis = this as NotesManager;

  for (const command of commandsArr) {
    typedThis.registerEvent(
      typedThis.app.workspace.on('file-menu', (menu, file) => {
        menu.addItem((item) => {
          item
            .setTitle(command.title)
            .setIcon(command.icon)
            .onClick(() => {
              const fileTyped = typedThis.app.vault.getFileByPath(file.path)!;
              typedThis.app.vault.read(fileTyped).then((content) => {
                const fileType = getFileType(content, fileTyped);
                command.action({ file: fileTyped, content, fileType, typedThis });
              });
            });
        });
      })
    );
  }
}
