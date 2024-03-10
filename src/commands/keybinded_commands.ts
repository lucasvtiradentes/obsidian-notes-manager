import { Plugin } from 'obsidian';

import { addSectionToContent, generateTOC } from '../utils/markdown_utils';

export function addKeybindedCommandsToObsidian() {
  const typedThis = this as Plugin;

  typedThis.addCommand({
    id: 'example-command',
    name: 'Example command',
    hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'a' }],
    callback: () => {
      const filesAndFolders = typedThis.app.vault
        .getAllLoadedFiles()
        .filter((item) => item.path !== '/')
        .map((item) => ({ name: item.name, path: item.path, is_file: item.name.includes('.'), level: item.path.split('/').length }));
      const parsedFiles = filesAndFolders;

      console.log(parsedFiles, sortFilesAndDirectories([...parsedFiles]));

      const parsedResult = parsedFiles
        .map((item) => ({ ...item, name: item.name }))
        .map((item) => ({ ...item, level: item.name.split('/').length }))
        .map((item) => ({ ...item, title: `${'#'.repeat(item.level)} ${item.name}` }));
      const mdHeadings = parsedResult.map((item) => item.title).join('\n');
      const tocContent = generateTOC(mdHeadings);

      let content = '';
      for (const [key, value] of tocContent.entries()) {
        content = addSectionToContent(content, `${'#'.repeat(value.level)} ${key} - ${value.title}`, '\ncontent\n');
      }

      console.log(content);
    }
  });
}
type TFileData = {
  name: string;
  path: string;
  is_file: boolean;
  level: number;
};

export function sortFilesAndDirectories(data: TFileData[]): TFileData[] {
  // Função de comparação para ordenar pastas antes de arquivos
  const compareFoldersFirst = (a: TFileData, b: TFileData) => {
    if (a.is_file === b.is_file) {
      // Se ambos são pastas ou ambos são arquivos, ordene por nome
      return a.name.localeCompare(b.name);
    } else {
      // Se um é pasta e o outro é arquivo, coloque a pasta primeiro
      return a.is_file ? 1 : -1;
    }
  };

  // Função de comparação para ordenar por nível e depois por nome
  const compareByLevelAndName = (a: TFileData, b: TFileData) => {
    // Primeiro compare os níveis
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    // Se os níveis são iguais, ordene por nome
    return a.name.localeCompare(b.name);
  };

  // Ordenar a array
  return data.sort((a, b) => {
    // Aplicar a primeira comparação
    const folderComparison = compareFoldersFirst(a, b);
    if (folderComparison === 0) {
      // Se forem iguais, aplicar a segunda comparação
      return compareByLevelAndName(a, b);
    } else {
      // Caso contrário, retornar o resultado da primeira comparação
      return folderComparison;
    }
  });
}
