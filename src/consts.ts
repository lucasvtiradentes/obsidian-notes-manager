import { DEFAULT_SETTINGS } from './settings/settings';
import { arrayToEnumObject } from './utils/array_utils';

export const VISIBILITY_ENUM = arrayToEnumObject(['show', 'hide']);
export type TVisibility = (typeof VISIBILITY_ENUM)[keyof typeof VISIBILITY_ENUM];

export const FILE_EXTENSION_ENUM = arrayToEnumObject(['json', 'md']);
export type TFileExtension = (typeof FILE_EXTENSION_ENUM)[keyof typeof FILE_EXTENSION_ENUM];

export const CONFIGS = {
  settings: DEFAULT_SETTINGS,
  ribbon: {
    icon: 'dice',
    title: 'Sample Plugin',
    class_name: 'my-plugin-ribbon-class'
  },
  css_classes: arrayToEnumObject(['nm_file', 'nm_file_icon', 'nm_settings_section', 'nm_settings_section_title', 'nm_settings_section_hided']),
  obisidan_classes: {
    file_item: 'nav-file',
    file_title_item: 'nav-file-title',
    file_path_attribute: 'data-path',
    file_extension_badge: 'nav-file-tag',
    folder_item: 'nav-folder',
    collapsed_folder_item: 'is-collapsed'
  }
} as const;

export const ERRORS = {
  invalid_file_type: 'Invalid file type',
  file_already_exists: 'File already exists'
} as const;
