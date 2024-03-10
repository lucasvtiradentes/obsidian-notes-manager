import NotesManager from '../main';

export function toogleCustomFileSufix() {
  const typedThis = this as NotesManager;

  const files = document.querySelectorAll('.nav-file-title-content');
  for (const file of Array.from(files)) {
    if (file.textContent?.endsWith(typedThis.settings.file_sufix)) {
      const oldName = file.textContent;
      const newName = oldName.substring(0, oldName.length - 3);
      file.textContent = newName;
      console.log({ oldName, newName });
    }
  }
}
