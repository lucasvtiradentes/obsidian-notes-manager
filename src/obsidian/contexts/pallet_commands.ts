import { commandsArr } from '../../commands/available_commands';
import NotesManager from '../../main';
import { getCurrentEditedNoteContent, getFileType } from '../../utils/obsidian_utils';

export function addPalletCommandsToObsidian() {
  const typedThis = this as NotesManager;

  for (const command of commandsArr) {
    typedThis.addCommand({
      id: command.id,
      name: command.title,
      editorCallback: () => {
        const activeFile = typedThis.app.workspace.getActiveFile()!;
        const content = getCurrentEditedNoteContent(typedThis);
        const fileType = getFileType(content, activeFile);
        if (activeFile && command.condition(fileType)) {
          command.action({ file: activeFile, content, fileType, typedThis });
        }
      }
    });
  }
}
