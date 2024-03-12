import { FILE_TYPE_ENUM, TFileType } from '../consts/enums';
import { TCommand, convertNoteToJSON, convertNoteToMarkdown, convertNoteToTable } from './convert_notes';

function isValidNoteType(allowedTypes: TFileType[], fileToCheck: TFileType) {
  return allowedTypes.includes(fileToCheck);
}

export const commandsArr: TCommand[] = [
  {
    id: 'convert-to-json',
    title: 'convert to JSON',
    icon: 'braces',
    condition: (fileType: TFileType) => isValidNoteType([FILE_TYPE_ENUM.MARKDOWN, FILE_TYPE_ENUM.TABLE], fileType),
    action: convertNoteToJSON
  },
  {
    id: 'convert-to-table',
    title: 'convert to TABLE',
    icon: 'table',
    condition: (fileType: TFileType) => isValidNoteType([FILE_TYPE_ENUM.MARKDOWN, FILE_TYPE_ENUM.JSON], fileType),
    action: convertNoteToTable
  },
  {
    id: 'convert-to-markdown',
    title: 'convert to MARKDOWN',
    icon: 'book-text',
    condition: (fileType: TFileType) => isValidNoteType([FILE_TYPE_ENUM.TABLE, FILE_TYPE_ENUM.JSON], fileType),
    action: convertNoteToMarkdown
  }
];
