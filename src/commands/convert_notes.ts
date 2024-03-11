import { Notice, TFile } from 'obsidian';

import { CONFIGS, ERRORS, FILE_EXTENSION_ENUM, TFileExtension, VISIBILITY_ENUM } from '../consts';
import NotesManager from '../main';
import { FILE_TYPE_ENUM, NOTE_TYPE_ENUM, TFileType, checkFileExistence, getNoteType } from '../utils/obsidian_utils';
import { OneLevelNote, TOneLevelNoteConfigs } from '../utils/one_level_note_utils';
import { TTwoLevelNoteConfigs, TwoLevelNote } from '../utils/two_level_note_utils';
import { styleFileBadge, styleFileExtension } from './toogle_custom_file_sufix';

export type TCommandAction = { file: TFile; content: string; typedThis: NotesManager; fileType: TFileType };

export type TCommand = {
  id: string;
  title: string;
  icon: string;
  condition: (fileType: TFileType) => boolean;
  action: (typedThis: TCommandAction) => Promise<void> | void;
};

async function convertNoteToX({ file, content, fileType, typedThis, destinationExtension, to }: TCommandAction & { destinationExtension: TFileExtension; to: 'toTable' | 'toMarkdown' | 'toJson' }) {
  if (fileType === FILE_TYPE_ENUM._) return;

  const destinationFile = (() => {
    const finalName = file.path.replace(file.name, '#');
    if (typedThis.settings.use_file_sufix) {
      const alreadyHasSufix = file.basename.endsWith(typedThis.settings.file_sufix);
      if (!alreadyHasSufix) {
        return finalName.replace('#', `${file.basename}${typedThis.settings.file_sufix}.${file.extension}`);
      }
    }
    return finalName.replace('#', `${file.basename}.${destinationExtension}`);
  })();
  const destinationFileExists = checkFileExistence({ typedThis, filePath: destinationFile });
  const noteType = getNoteType(content, fileType);

  const updateAndRenameFile = async <T>(newContent: string | T) => {
    const parsedNewContent = (to === 'toJson' ? JSON.stringify(newContent, null, 2) : newContent) as string;
    const obsidianFile = typedThis.app.vault.getFileByPath(file.path)!;
    await typedThis.app.vault.modify(obsidianFile, parsedNewContent);
    await typedThis.app.vault.rename(obsidianFile, destinationFile);
    const fileElement = document.querySelector(`.${CONFIGS.obisidan_classes.file_title_item}[${CONFIGS.obisidan_classes.file_path_attribute}="${obsidianFile.path}"] > div`)! as HTMLDivElement;

    if (typedThis.settings.use_file_sufix) {
      styleFileExtension(typedThis, file.basename, fileElement, typedThis.settings.show_file_sufix ? VISIBILITY_ENUM.show : VISIBILITY_ENUM.hide);
      styleFileBadge(fileElement, typedThis.settings.show_file_badge ? VISIBILITY_ENUM.show : VISIBILITY_ENUM.hide);
    }
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
  convertNoteToX({ ...commandProps, destinationExtension: FILE_EXTENSION_ENUM.md, to: 'toTable' });
}

export function convertNoteToMarkdown(commandProps: TCommandAction) {
  convertNoteToX({ ...commandProps, destinationExtension: FILE_EXTENSION_ENUM.md, to: 'toMarkdown' });
}

export function convertNoteToJSON(commandProps: TCommandAction) {
  convertNoteToX({ ...commandProps, destinationExtension: FILE_EXTENSION_ENUM.json, to: 'toJson' });
}
