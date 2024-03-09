import { TPluginSettings } from './settings/settings';

export const CONFIGS = {
  settings: { mySetting: 'default' } satisfies TPluginSettings,
  ribbon: {
    icon: 'dice',
    title: 'Sample Plugin',
    class_name: 'my-plugin-ribbon-class'
  },
  constants: {
    one_level_note: {
      fist_column_name: 'TEMA',
      second_column_name: 'LINK'
    },
    two_level_note: {
      fist_column_name: 'TEMA',
      second_column_name: 'TÓPICO',
      third_column_name: 'LINK'
    }
  }
} as const;

export const ERRORS = {
  invalid_file_type: 'Invalid file type',
  file_already_exists: 'File already exists'
} as const;
