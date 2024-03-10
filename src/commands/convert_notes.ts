import { Notice, TFile } from 'obsidian';

import { ERRORS } from '../consts';
import NotesManager from '../main';
import { FILE_TYPE_ENUM, NOTE_TYPE_ENUM, TFileType, checkFileExistence, getNoteType } from '../utils/obsidian_utils';
import { OneLevelNote, TOneLevelNoteConfigs } from '../utils/one_level_note_utils';
import { TTwoLevelNoteConfigs, TwoLevelNote } from '../utils/two_level_note_utils';

export type TCommandAction = { file: TFile; content: string; typedThis: NotesManager; fileType: TFileType };

export type TCommand = {
  id: string;
  title: string;
  icon: string;
  condition: (fileType: TFileType) => boolean;
  action: (typedThis: TCommandAction) => Promise<void> | void;
};

async function convertNoteToX({ file, content, fileType, typedThis, destinationExtension, to }: TCommandAction & { destinationExtension: string; to: 'toTable' | 'toMarkdown' | 'toJson' }) {
  if (fileType === FILE_TYPE_ENUM._) return;

  const noteType = getNoteType(content, fileType);
  const destinationFile = file.path.replace(file.extension, destinationExtension);
  const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });

  const updateAndRenameFile = async <T>(newContent: string | T) => {
    const parsedNewContent = (to === 'toJson' ? JSON.stringify(newContent, null, 2) : newContent) as string;
    const obsidianFile = typedThis.app.vault.getFileByPath(file.path)!;
    await typedThis.app.vault.modify(obsidianFile, parsedNewContent);
    await typedThis.app.vault.rename(obsidianFile, destinationFile);
  };

  if (noteType === NOTE_TYPE_ENUM.ONE_LEVEL) {
    if (file.extension !== destinationExtension && destinationFileExists) {
      new Notice(ERRORS.file_already_exists);
      return;
    }

    const oneLevelConfigs: TOneLevelNoteConfigs =
      fileType === 'JSON'
        ? {
            type: 'JSON',
            content: JSON.parse(content)
          }
        : {
            type: fileType,
            content
          };

    const newContent = new OneLevelNote(oneLevelConfigs, typedThis.settings)[to]();
    await updateAndRenameFile(newContent);
    return;
  } else if (noteType === NOTE_TYPE_ENUM.TWO_LEVEL) {
    if (file.extension !== destinationExtension && destinationFileExists) {
      new Notice(ERRORS.file_already_exists);
      return;
    }

    const twoLevelConfigs: TTwoLevelNoteConfigs =
      fileType === 'JSON'
        ? {
            type: 'JSON',
            content: JSON.parse(content)
          }
        : {
            type: fileType,
            content
          };

    const newContent = new TwoLevelNote(twoLevelConfigs, typedThis.settings)[to]();
    await updateAndRenameFile(newContent);
    return;
  }

  new Notice(ERRORS.invalid_file_type);
}

export function convertNoteToTable(commandProps: TCommandAction) {
  convertNoteToX({ ...commandProps, destinationExtension: 'md', to: 'toTable' });
}

export function convertNoteToMarkdown(commandProps: TCommandAction) {
  convertNoteToX({ ...commandProps, destinationExtension: 'md', to: 'toMarkdown' });
}

export function convertNoteToJSON(commandProps: TCommandAction) {
  convertNoteToX({ ...commandProps, destinationExtension: 'json', to: 'toJson' });
}
