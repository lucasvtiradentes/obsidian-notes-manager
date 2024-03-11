import { Plugin, TFile } from 'obsidian';
import { TAbstractFile } from 'obsidian';

import { FILE_EXTENSION_ENUM } from '../consts';
import { arrayToEnumObject } from './array_utils';
import { generateTOC, markdownTableToJson } from './markdown_utils';
import { TUnionFromObjectEnum } from './type_utils';

export const FILE_TYPE_ENUM = arrayToEnumObject(['JSON', 'TABLE', 'MARKDOWN', '_']);
export type TFileType = TUnionFromObjectEnum<typeof FILE_TYPE_ENUM>;

export function getFileType(content: string, file: TFile): TFileType {
  const extension = file.extension;

  if (extension === FILE_EXTENSION_ENUM.json) return FILE_TYPE_ENUM.JSON;
  if (extension === FILE_EXTENSION_ENUM.md) {
    if (content.includes('<table>') && content.includes('</table>')) return FILE_TYPE_ENUM.TABLE;
    return FILE_TYPE_ENUM.MARKDOWN;
  }

  return FILE_TYPE_ENUM._;
}

export const NOTE_TYPE_ENUM = arrayToEnumObject(['ONE_LEVEL', 'TWO_LEVEL', '_']);
export type TNoteType = TUnionFromObjectEnum<typeof NOTE_TYPE_ENUM>;

export function getNoteType(content: string, fileType: TFileType): TNoteType {
  let noteType: TNoteType = NOTE_TYPE_ENUM._;

  if (fileType === FILE_TYPE_ENUM.MARKDOWN) {
    const fileToc = generateTOC(content);
    const maxLevel = Math.max(...Array.from(fileToc.values()).map((entry) => entry.level));
    noteType = maxLevel === 1 ? NOTE_TYPE_ENUM.ONE_LEVEL : maxLevel === 2 ? NOTE_TYPE_ENUM.TWO_LEVEL : NOTE_TYPE_ENUM._;
  } else if (fileType === FILE_TYPE_ENUM.JSON) {
    const jsonData = JSON.parse(content) as Record<string, string>[];
    if (jsonData.every((item) => Object.keys(item).length === 3)) return NOTE_TYPE_ENUM.ONE_LEVEL;
    if (jsonData.every((item) => Object.keys(item).length === 4)) return NOTE_TYPE_ENUM.TWO_LEVEL;
  } else if (fileType === FILE_TYPE_ENUM.TABLE) {
    const jsonData = markdownTableToJson({ mdContent: content });
    if (jsonData.every((item) => Object.keys(item).length === 2)) return NOTE_TYPE_ENUM.ONE_LEVEL;
    if (jsonData.every((item) => Object.keys(item).length === 3)) return NOTE_TYPE_ENUM.TWO_LEVEL;
  }

  return noteType;
}

export function checkFileExistence(props: { typedThis: Plugin; filePath: string }): boolean {
  const file: TAbstractFile | null = props.typedThis.app.vault.getAbstractFileByPath(props.filePath);
  return file !== null;
}

export function getCurrentEditedNoteContent(obsidianPlugin: Plugin) {
  const activeEditor = obsidianPlugin.app.workspace.activeEditor!;
  const text = activeEditor.editor!.getDoc().getValue();
  return text;
}
