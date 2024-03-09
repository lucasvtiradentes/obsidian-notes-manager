import { Plugin } from 'obsidian';

export function addKeybindedCommandsToObsidian() {
  const typedThis = this as Plugin;

  typedThis.addCommand({
    id: 'example-command',
    name: 'Example command',
    hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'a' }],
    callback: () => {
      console.log('Hey, you!');
    }
  });
}
