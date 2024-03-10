import { Notice } from 'obsidian';

import { ERRORS } from '../consts';
import NotesManager from '../main';
import { FILE_TYPE_ENUM, TFileType, checkFileExistence, getCurrentEditedNoteContent, getFileType, getNoteType, updateCurrentNoteContent, updateCurrentNoteExtension } from '../utils/obsidian_utils';
import { OneLevelNote, TOneLevelNoteConfigs } from '../utils/one_level_note_utils';
import { TTwoLevelNoteConfigs, TwoLevelNote } from '../utils/two_level_note_utils';

type TCommandAction = { typedThis: NotesManager; fileType: TFileType };

type TCommand = {
  title: string;
  icon: string;
  condition: (fileType: TFileType) => boolean;
  action: (typedThis: TCommandAction) => Promise<void> | void;
};

function isValidNoteType(allowedTypes: TFileType[], fileToCheck: TFileType) {
  return allowedTypes.includes(fileToCheck);
}

export function addEditorCommandsToObsidian() {
  const typedThis = this as NotesManager;

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

function convertNoteToX({ fileType, typedThis, destinationExtension, to }: TCommandAction & { destinationExtension: string; to: 'toTable' | 'toMarkdown' | 'toJson' }) {
  if (fileType === FILE_TYPE_ENUM._) return;

  const originalFileContent = getCurrentEditedNoteContent(typedThis);
  const noteType = getNoteType(typedThis, fileType);

  if (noteType === 'ONE_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
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

    const newContent = new OneLevelNote(oneLevelConfigs, typedThis.settings)[to]();
    const parsedNewContent = (to === 'toJson' ? JSON.stringify(newContent, null, 2) : newContent) as string;
    updateCurrentNoteContent({ newContent: parsedNewContent, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  } else if (noteType === 'TWO_LEVEL') {
    const activeFile = typedThis.app.workspace.getActiveFile()!;
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

    const newContent = new TwoLevelNote(twoLevelConfigs, typedThis.settings)[to]();
    const parsedNewContent = (to === 'toJson' ? JSON.stringify(newContent, null, 2) : newContent) as string;
    updateCurrentNoteContent({ newContent: parsedNewContent, typedThis });
    updateCurrentNoteExtension({ typedThis, newExtension: destinationExtension });
    return;
  }

  new Notice(ERRORS.invalid_file_type);
}

export function convertNoteToTable({ fileType, typedThis }: TCommandAction) {
  convertNoteToX({ fileType, typedThis, destinationExtension: 'md', to: 'toTable' });
}

export function convertNoteToMarkdown({ fileType, typedThis }: TCommandAction) {
  convertNoteToX({ fileType, typedThis, destinationExtension: 'md', to: 'toMarkdown' });
}

export function convertNoteToJSON({ fileType, typedThis }: TCommandAction) {
  convertNoteToX({ fileType, typedThis, destinationExtension: 'json', to: 'toJson' });
}
