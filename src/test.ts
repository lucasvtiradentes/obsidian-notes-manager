import { generateTOC } from './utils/markdown_utils';
import { OneLevelNote } from './utils/one_level_note_utils';
import { TwoLevelNote } from './utils/two_level_note_utils';

export function convertFile(fileContent: string) {
  const fileToc = generateTOC(fileContent);
  const maxLevel = Math.max(...Array.from(fileToc.values()).map((entry) => entry.level));
  const fileType = maxLevel === 1 ? 'ONE_LEVEL' : maxLevel === 2 ? 'TWO_LEVEL' : '';
  console.log(fileType);

  if (fileType === 'ONE_LEVEL') {
    return new OneLevelNote({ content: fileContent, type: 'markdown' }).toTable();
  }

  if (fileType === 'TWO_LEVEL') {
    return new TwoLevelNote({ content: fileContent, type: 'markdown' }).toTable();
  }

  return fileToc;
}
