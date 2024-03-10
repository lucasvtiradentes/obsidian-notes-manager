import { Plugin } from 'obsidian';

import { generateVaultToc } from '../generate_toc';

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
}
