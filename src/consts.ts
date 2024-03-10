import { DEFAULT_SETTINGS } from './settings/settings';
import { constArrayToEnumObject } from './utils/array_utils';

export const CONFIGS = {
  settings: DEFAULT_SETTINGS,
  ribbon: {
    icon: 'dice',
    title: 'Sample Plugin',
    class_name: 'my-plugin-ribbon-class'
  },
  css_classes: constArrayToEnumObject(['notes_manager_file', 'notes_manager_file_icon', 'settings_section', 'settings_section_title', 'settings_section_hided']),
  obisidan_classes: {
    file_class_name: 'nav-file-title',
    file_path_attribute: 'data-path'
  }
} as const;

export const ERRORS = {
  invalid_file_type: 'Invalid file type',
  file_already_exists: 'File already exists'
} as const;
