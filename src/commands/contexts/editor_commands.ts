import NotesManager from '../../main';
import { getCurrentEditedNoteContent, getFileType } from '../../utils/obsidian_utils';
import { commandsArr } from '../available_commands';

export function addEditorCommandsToObsidian() {
  const typedThis = this as NotesManager;
  for (const command of commandsArr) {
    typedThis.registerEvent(
      typedThis.app.workspace.on('editor-menu', (menu, _editor, _view) => {
        const activeFile = typedThis.app.workspace.getActiveFile()!;
        const content = getCurrentEditedNoteContent(typedThis);
        const fileType = getFileType(content, activeFile);
        if (activeFile && command.condition(fileType)) {
          menu.addItem((item) => {
            item
              .setTitle(command.title)
              .setIcon(command.icon)
              .onClick(() => command.action({ file: activeFile, content, fileType, typedThis }));
          });
        }
      })
    );
  }
}
