import { CONFIGS } from '../consts';
import NotesManager from '../main';

function getAllNotesManagerFiles(typedThis: NotesManager) {
  const files = Array.from(document.querySelectorAll(`.${CONFIGS.obisidan_classes.file_class_name}`));
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

  return notesManagerFiles;
}

export function styleAllFilesExtensions(mode: 'hide' | 'show') {
  const typedThis = this as NotesManager;
  const notesManagerFiles = getAllNotesManagerFiles(typedThis);

  for (const file of notesManagerFiles) {
    const textContentElement = file.fileElement.getElementsByTagName('div')[0];
    const oldName = file.name;
    styleFileExtension(typedThis, oldName, textContentElement, mode);
  }
}

export function styleFileExtension(typedThis: NotesManager, oldName: string, element: HTMLDivElement, mode: 'hide' | 'show') {
  const newName = oldName.substring(0, oldName.length - typedThis.settings.file_sufix.length);

  if (mode === 'hide') {
    element.textContent = newName;
    element.setAttribute('class', CONFIGS.css_classes.notes_manager_file);
  } else {
    element.textContent = oldName;
    element.removeClass(CONFIGS.css_classes.notes_manager_file);
  }
}

export function styleAllFilesBadges(mode: 'hide' | 'show') {
  const typedThis = this as NotesManager;
  const notesManagerFiles = getAllNotesManagerFiles(typedThis);

  for (const file of notesManagerFiles) {
    const textContentElement = file.fileElement.getElementsByTagName('div')[0];
    styleFileBadge(textContentElement, mode);
  }
}

export function styleFileBadge(element: HTMLDivElement, mode: 'show' | 'hide') {
  const parentElement = element.parentElement;

  const sibilingEl = parentElement?.querySelector(`.${CONFIGS.css_classes.notes_manager_file_icon}`);
  const hasExtensionTag = parentElement?.querySelector('.nav-file-tag');

  const removeSibiling = () => {
    sibilingEl?.remove();
  };

  const addSibiling = () => {
    const newSibiling = document.createElement('div');
    newSibiling.setAttribute('class', CONFIGS.css_classes.notes_manager_file_icon);
    newSibiling.innerText = 'NM';
    parentElement?.appendChild(newSibiling);
  };

  if (mode === 'show') {
    if (hasExtensionTag && sibilingEl) {
      removeSibiling();
      addSibiling();
    }

    if (!sibilingEl) {
      addSibiling();
    }
  } else {
    if (sibilingEl) {
      removeSibiling();
    }
  }
}
