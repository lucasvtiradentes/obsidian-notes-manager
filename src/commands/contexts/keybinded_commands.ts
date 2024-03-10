import { Plugin } from 'obsidian';

import { generateVaultToc } from '../generate_toc';
import { styleAllFilesExtensions } from '../toogle_custom_file_sufix';

export function addKeybindedCommandsToObsidian() {
  const typedThis = this as Plugin;

  typedThis.addCommand({
    id: 'example-command',
    name: 'Example command',
    hotkeys: [{ modifiers: ['Mod'], key: ' ' }],
    callback: () => {
      generateVaultToc.call(typedThis);
    }
  });

  typedThis.addCommand({
    id: 'example-command',
    name: 'Example command',
    hotkeys: [{ modifiers: ['Mod', 'Shift'], key: ' ' }],
    callback: () => {
      styleAllFilesExtensions.call(typedThis);
    }
  });
}
