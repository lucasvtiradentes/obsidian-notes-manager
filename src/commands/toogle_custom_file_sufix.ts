import { CONFIGS, TVisibility, VISIBILITY_ENUM } from '../consts';
import NotesManager from '../main';

function getAllNotesManagerFiles(typedThis: NotesManager) {
  const files = Array.from(document.querySelectorAll(`.${CONFIGS.obisidan_classes.file_title_item}`));
  const notesManagerFiles = files
    .map((fileElement) => {
      const dataPath = fileElement.getAttribute(CONFIGS.obisidan_classes.file_path_attribute)!;
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

export function styleAllFilesExtensions(mode: TVisibility) {
  const typedThis = this as NotesManager;
  const notesManagerFiles = getAllNotesManagerFiles(typedThis);

  for (const file of notesManagerFiles) {
    const textContentElement = file.fileElement.getElementsByTagName('div')[0];
    const oldName = file.name;
    styleFileExtension(typedThis, oldName, textContentElement, mode);
  }
}

export function styleFileExtension(typedThis: NotesManager, oldName: string, element: HTMLDivElement, mode: TVisibility) {
  const newName = oldName.substring(0, oldName.length - typedThis.settings.file_sufix.length);

  if (mode === VISIBILITY_ENUM.hide) {
    element.textContent = newName;
    element.setAttribute('class', CONFIGS.css_classes.nm_file);
  } else {
    element.textContent = oldName;
    element.removeClass(CONFIGS.css_classes.nm_file);
  }
}

export function styleAllFilesBadges(mode: TVisibility) {
  const typedThis = this as NotesManager;
  const notesManagerFiles = getAllNotesManagerFiles(typedThis);

  for (const file of notesManagerFiles) {
    const textContentElement = file.fileElement.getElementsByTagName('div')[0];
    styleFileBadge(textContentElement, mode);
  }
}

export function styleFileBadge(element: HTMLDivElement, mode: TVisibility) {
  const parentElement = element.parentElement;

  const sibilingEl = parentElement?.querySelector(`.${CONFIGS.css_classes.nm_file_icon}`);
  const hasExtensionTag = parentElement?.querySelector(`.${CONFIGS.obisidan_classes.file_extension_badge}`);

  const removeSibiling = () => {
    sibilingEl?.remove();
  };

  const addSibiling = () => {
    const newSibiling = document.createElement('div');
    newSibiling.setAttribute('class', CONFIGS.css_classes.nm_file_icon);
    newSibiling.innerText = 'NM';
    parentElement?.appendChild(newSibiling);
  };

  if (mode === VISIBILITY_ENUM.show) {
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
