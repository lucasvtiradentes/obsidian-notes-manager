import { Notice, Plugin } from 'obsidian';
import NotesManager from 'src/main';
import { FILE_TYPE_ENUM, TFileType, checkFileExistence, getCurrentEditedNoteContent, getFileType, getNoteType, updateCurrentNoteContent, updateCurrentNoteExtension } from 'src/utils/obsidian_utils';
import { OneLevelNote, TOneLevelNote } from 'src/utils/one_level_note_utils';
import { TwoLevelNote } from 'src/utils/two_level_note_utils';

type TCommandAction = { typedThis: Plugin; fileType: TFileType };

type TCommand = {
  title: string;
  icon: string;
  condition: (fileType: TFileType) => boolean;
  action: (typedThis: TCommandAction) => Promise<void>;
};

export function addEditorCommandsToObsidian() {
  const typedThis = this as NotesManager;

  const commandsArr: TCommand[] = [
    {
      title: 'convert to JSON',
      icon: 'braces',
      condition: (fileType: TFileType) => ([FILE_TYPE_ENUM.JSON, FILE_TYPE_ENUM._] satisfies TFileType[]).includes(fileType) === false,
      action: convertNoteToJSON
    },
    {
      title: 'convert to TABLE',
      icon: 'table',
      condition: (fileType: TFileType) => ([FILE_TYPE_ENUM.TABLE, FILE_TYPE_ENUM._] satisfies TFileType[]).includes(fileType) === false,
      action: convertNoteToTable
    },
    {
      title: 'convert to MARKDOWN',
      icon: 'book-text',
      condition: (fileType: TFileType) => ([FILE_TYPE_ENUM.MARKDOWN, FILE_TYPE_ENUM._] satisfies TFileType[]).includes(fileType) === false,
      action: convertNoteToMarkdown
    }
  ];

  for (const command of commandsArr) {
    typedThis.registerEvent(
      typedThis.app.workspace.on('editor-menu', (menu, _editor, _view) => {
        const activeFile = typedThis.app.workspace.getActiveFile()!;
        const fileType = getFileType(activeFile, typedThis);
        if (activeFile && command.condition(fileType)) {
          menu.addItem((item) => {
            item
              .setTitle(command.title)
              .setIcon(command.icon)
              .onClick(() => command.action({ fileType, typedThis }));
          });
        }
      })
    );
  }
}

export async function convertNoteToTable({ fileType, typedThis }: TCommandAction) {
  const originalFileContent = getCurrentEditedNoteContent(typedThis);
  const fileContent = fileType === 'JSON' ? JSON.parse(originalFileContent) : originalFileContent;
  const noteType = getNoteType(typedThis, fileType);

  if (noteType === 'ONE_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'md';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice('File already exists!');
      return;
    }

    const newContent = new OneLevelNote({ content: fileContent, type: fileType }).toTable();
    updateCurrentNoteContent({ newContent, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  } else if (noteType === 'TWO_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'md';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice('File already exists!');
      return;
    }

    const newContent = new TwoLevelNote({ content: fileContent, type: fileType }).toTable();
    updateCurrentNoteContent({ newContent, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  }

  new Notice('file not supported!');
}

export async function convertNoteToJSON({ fileType, typedThis }: TCommandAction) {
  const originalFileContent = getCurrentEditedNoteContent(typedThis);
  const fileContent = fileType === 'JSON' ? (JSON.parse(originalFileContent) as TOneLevelNote[]) : originalFileContent;
  const noteType = getNoteType(typedThis, fileType);

  if (noteType === 'ONE_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'json';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice('File already exists!');
      return;
    }

    const newContent = new OneLevelNote({ content: fileContent as string, type: fileType }).toJson();
    updateCurrentNoteContent({ newContent: JSON.stringify(newContent, null, 2), typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  } else if (noteType === 'TWO_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'json';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice('File already exists!');
      return;
    }

    const newContent = new TwoLevelNote({ content: fileContent as string, type: fileType }).toJson();
    updateCurrentNoteContent({ newContent: JSON.stringify(newContent, null, 2), typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  }

  new Notice('file not supported!');
}

export async function convertNoteToMarkdown({ fileType, typedThis }: TCommandAction) {
  const originalFileContent = getCurrentEditedNoteContent(typedThis);
  const fileContent = fileType === 'JSON' ? (JSON.parse(originalFileContent) as TOneLevelNote[]) : originalFileContent;
  const noteType = getNoteType(typedThis, fileType);

  if (noteType === 'ONE_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'md';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice('File already exists!');
      return;
    }

    const newContent = new OneLevelNote({ content: fileContent as string, type: fileType }).toMarkdown();
    updateCurrentNoteContent({ newContent: newContent as string, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  } else if (noteType === 'TWO_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'md';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice('File already exists!');
      return;
    }

    const newContent = new TwoLevelNote({ content: fileContent as string, type: fileType }).toMarkdown();
    updateCurrentNoteContent({ newContent: newContent as string, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  }

  new Notice('file not supported!');
}
