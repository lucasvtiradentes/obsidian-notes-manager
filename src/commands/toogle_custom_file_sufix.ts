import { CONFIGS } from '../consts';
import NotesManager from '../main';

export function toogleCustomFileSufix(mode: 'hide' | 'show') {
  const typedThis = this as NotesManager;

  const files = Array.from(document.querySelectorAll('.nav-file-title'));
  const notesManagerFiles = files
    .map((fileElement) => {
      const dataPath = fileElement.getAttribute('data-path')!;
      const pathArr = dataPath.split('/');
      const nameWithExtension = pathArr[pathArr.length - 1];
      const name = nameWithExtension.slice(0, nameWithExtension.lastIndexOf('.'));
      const isNotesManagerFile = name.endsWith(typedThis.settings.file_sufix);
      return {
        fileElement,
        name,
        isNotesManagerFile
      };
    })
    .filter((file) => file.isNotesManagerFile);

  for (const file of notesManagerFiles) {
    const oldName = file.name;
    const newName = oldName.substring(0, oldName.length - typedThis.settings.file_sufix.length);
    const textContentElement = file.fileElement.getElementsByTagName('div')[0];

    if (mode === 'hide') {
      textContentElement.textContent = newName;
      textContentElement.setAttribute('class', CONFIGS.css_classes.notes_manager_file);
    } else {
      textContentElement.textContent = oldName;
      textContentElement.removeClass(CONFIGS.css_classes.notes_manager_file);
    }
  }
}
