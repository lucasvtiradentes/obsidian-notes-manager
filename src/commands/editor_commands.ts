import { Notice, Plugin } from 'obsidian';
import { ERRORS } from 'src/consts';
import { FILE_TYPE_ENUM, TFileType, checkFileExistence, getCurrentEditedNoteContent, getFileType, getNoteType, updateCurrentNoteContent, updateCurrentNoteExtension } from 'src/utils/obsidian_utils';
import { OneLevelNote, TOneLevelNoteConfigs } from 'src/utils/one_level_note_utils';
import { TTwoLevelNoteConfigs, TwoLevelNote } from 'src/utils/two_level_note_utils';

type TCommandAction = { typedThis: Plugin; fileType: TFileType };

type TCommand = {
  title: string;
  icon: string;
  condition: (fileType: TFileType) => boolean;
  action: (typedThis: TCommandAction) => Promise<void>;
};

function isValidNoteType(allowedTypes: TFileType[], fileToCheck: TFileType) {
  return allowedTypes.includes(fileToCheck);
}

export function addEditorCommandsToObsidian() {
  const typedThis = this as Plugin;

  const commandsArr: TCommand[] = [
    {
      title: 'convert to JSON',
      icon: 'braces',
      condition: (fileType: TFileType) => isValidNoteType([FILE_TYPE_ENUM.MARKDOWN, FILE_TYPE_ENUM.TABLE], fileType),
      action: convertNoteToJSON
    },
    {
      title: 'convert to TABLE',
      icon: 'table',
      condition: (fileType: TFileType) => isValidNoteType([FILE_TYPE_ENUM.MARKDOWN, FILE_TYPE_ENUM.JSON], fileType),
      action: convertNoteToTable
    },
    {
      title: 'convert to MARKDOWN',
      icon: 'book-text',
      condition: (fileType: TFileType) => isValidNoteType([FILE_TYPE_ENUM.TABLE, FILE_TYPE_ENUM.JSON], fileType),
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
  if (fileType === FILE_TYPE_ENUM._) return;

  const originalFileContent = getCurrentEditedNoteContent(typedThis);
  const fileContent = fileType === 'JSON' ? JSON.parse(originalFileContent) : originalFileContent;
  const noteType = getNoteType(typedThis, fileType);

  if (noteType === 'ONE_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'md';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice(ERRORS.file_already_exists);
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
      new Notice(ERRORS.file_already_exists);
      return;
    }

    const newContent = new TwoLevelNote({ content: fileContent, type: fileType }).toTable();
    updateCurrentNoteContent({ newContent, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  }

  new Notice(ERRORS.invalid_file_type);
}

export async function convertNoteToJSON({ fileType, typedThis }: TCommandAction) {
  if (fileType === FILE_TYPE_ENUM._) return;

  const originalFileContent = getCurrentEditedNoteContent(typedThis);
  const noteType = getNoteType(typedThis, fileType);

  if (noteType === 'ONE_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'json';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice(ERRORS.file_already_exists);
      return;
    }

    const oneLevelConfigs: TOneLevelNoteConfigs =
      fileType === 'JSON'
        ? {
            type: 'JSON',
            content: JSON.parse(originalFileContent)
          }
        : {
            type: fileType,
            content: originalFileContent
          };

    const newContent = new OneLevelNote(oneLevelConfigs).toJson();
    updateCurrentNoteContent({ newContent: JSON.stringify(newContent, null, 2), typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  } else if (noteType === 'TWO_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'json';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice(ERRORS.file_already_exists);
      return;
    }

    const twoLevelConfigs: TTwoLevelNoteConfigs =
      fileType === 'JSON'
        ? {
            type: 'JSON',
            content: JSON.parse(originalFileContent)
          }
        : {
            type: fileType,
            content: originalFileContent
          };

    const newContent = new TwoLevelNote(twoLevelConfigs).toJson();
    updateCurrentNoteContent({ newContent: JSON.stringify(newContent, null, 2), typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  }

  new Notice(ERRORS.invalid_file_type);
}

export async function convertNoteToMarkdown({ fileType, typedThis }: TCommandAction) {
  if (fileType === FILE_TYPE_ENUM._) return;

  const originalFileContent = getCurrentEditedNoteContent(typedThis);
  const noteType = getNoteType(typedThis, fileType);

  if (noteType === 'ONE_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'md';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice(ERRORS.file_already_exists);
      return;
    }

    const oneLevelConfigs: TOneLevelNoteConfigs =
      fileType === 'JSON'
        ? {
            type: 'JSON',
            content: JSON.parse(originalFileContent)
          }
        : {
            type: fileType,
            content: originalFileContent
          };

    const newContent = new OneLevelNote(oneLevelConfigs).toMarkdown();
    updateCurrentNoteContent({ newContent: newContent, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  } else if (noteType === 'TWO_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
    const destinationExtension = 'md';
    const destinationFile = activeFile.path.replace(activeFile.extension, destinationExtension);
    const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
    if (activeFile.extension !== destinationExtension && destinationFileExists) {
      new Notice(ERRORS.file_already_exists);
      return;
    }

    const twoLevelConfigs: TTwoLevelNoteConfigs =
      fileType === 'JSON'
        ? {
            type: 'JSON',
            content: JSON.parse(originalFileContent)
          }
        : {
            type: fileType,
            content: originalFileContent
          };

    const newContent = new TwoLevelNote(twoLevelConfigs).toMarkdown();
    updateCurrentNoteContent({ newContent: newContent, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  }

  new Notice(ERRORS.invalid_file_type);
}
