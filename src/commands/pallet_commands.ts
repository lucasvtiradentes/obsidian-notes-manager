import { App, Editor, MarkdownView, Modal } from 'obsidian';
import NotesManager from 'src/main';

export function addPalletCommandsToObsidian() {
  const typedThis = this as NotesManager;

  // This adds a simple command that can be triggered anywhere
  typedThis.addCommand({
    id: 'open-sample-modal-simple',
    name: 'Open sample modal (simple)',
    callback: () => {
      new SampleModal(typedThis.app).open();
    }
  });

  // This adds an editor command that can perform some operation on the current editor instance
  typedThis.addCommand({
    id: 'sample-editor-command',
    name: 'Sample editor command',
    editorCallback: (editor: Editor, view: MarkdownView) => {
      console.log(editor.getSelection(), view);
      editor.replaceSelection('Sample Editor Command');
    }
  });

  // This adds a complex command that can check whether the current state of the app allows execution of the command
  typedThis.addCommand({
    id: 'open-sample-modal-complex',
    name: 'Open sample modal (complex)',
    checkCallback: (checking: boolean) => {
      // Conditions to check
      const markdownView = typedThis.app.workspace.getActiveViewOfType(MarkdownView);
      if (markdownView) {
        // If checking is true, we're simply "checking" if the command can be run.
        // If checking is false, then we want to actually perform the operation.
        if (!checking) {
          new SampleModal(typedThis.app).open();
        }

        // This command will only show up in Command Palette when the check function returns true
        return true;
      }
    }
  });

  typedThis.addCommand({
    id: 'example-command',
    name: 'Example command',
    hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'a' }],
    callback: () => {
      console.log('Hey, you!');
    }
  });
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
