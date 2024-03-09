import NotesManager from 'src/main';

export function addKeybindedCommandsToObsidian() {
  const typedThis = this as NotesManager;

  typedThis.addCommand({
    id: 'example-command',
    name: 'Example command',
    hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'a' }],
    callback: () => {
      console.log('Hey, you!');
    }
  });
}
