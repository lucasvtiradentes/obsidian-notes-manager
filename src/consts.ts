import { DEFAULT_SETTINGS } from './settings/settings';

export const CONFIGS = {
  settings: DEFAULT_SETTINGS,
  ribbon: {
    icon: 'dice',
    title: 'Sample Plugin',
    class_name: 'my-plugin-ribbon-class'
  },
  constants: {}
} as const;

export const ERRORS = {
  invalid_file_type: 'Invalid file type',
  file_already_exists: 'File already exists'
} as const;
