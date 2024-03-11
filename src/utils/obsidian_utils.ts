import { Plugin, TFile } from 'obsidian';
import { TAbstractFile } from 'obsidian';

import { FILE_EXTENSION_ENUM } from '../consts';
import { arrayToEnumObject } from './array_utils';
import { generateTOC, markdownTableToJson } from './markdown_utils';

const FILE_TYPE = ['JSON', 'TABLE', 'MARKDOWN', '_'] as const;
export const FILE_TYPE_ENUM = arrayToEnumObject(FILE_TYPE);
export type TFileType = (typeof FILE_TYPE)[number];

export function getFileType(content: string, file: TFile): TFileType {
  const extension = file.extension;

  if (extension === FILE_EXTENSION_ENUM.json) return FILE_TYPE_ENUM.JSON;
  if (extension === FILE_EXTENSION_ENUM.md) {
    if (content.includes('<table>') && content.includes('</table>')) return FILE_TYPE_ENUM.TABLE;
    return FILE_TYPE_ENUM.MARKDOWN;
  }

  return FILE_TYPE_ENUM._;
}

const NOTE_TYPE = ['ONE_LEVEL', 'TWO_LEVEL', '_'] as const;
export const NOTE_TYPE_ENUM = arrayToEnumObject(NOTE_TYPE);
export type TNoteType = (typeof NOTE_TYPE)[number];

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

export async function getCurrentActiveFileContent(obsidianPlugin: Plugin) {
  const noteFile = obsidianPlugin.app.workspace.getActiveFile()!;
  const noteFileContent = await obsidianPlugin.app.vault.read(noteFile);
  return noteFileContent;
}

// export async function updateCurrentNoteExtension(props: { typedThis: Plugin; newExtension: string }) {
//   const file = props.typedThis.app.workspace.getActiveFile()!;
//   const newPath = file.path.replace(file.extension, props.newExtension);
//   await props.typedThis.app.vault.rename(file, newPath);
// }

// export function updateCurrentNoteContent(props: { typedThis: Plugin; newContent: string }) {
//   const activeEditor = props.typedThis.app.workspace.activeEditor!;
//   activeEditor.editor?.setValue(props.newContent);
// }
