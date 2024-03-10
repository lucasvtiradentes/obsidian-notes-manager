import { DEFAULT_SETTINGS } from './settings/settings';

export const CONFIGS = {
  settings: DEFAULT_SETTINGS,
  ribbon: {
    icon: 'dice',
    title: 'Sample Plugin',
    class_name: 'my-plugin-ribbon-class'
  },
  css_classes: {
    notes_manager_file: 'notes_manager_file',
    settings_section: 'settings_section',
    settings_section_title: 'settings_section_title'
  }
} as const;

export const ERRORS = {
  invalid_file_type: 'Invalid file type',
  file_already_exists: 'File already exists'
} as const;
