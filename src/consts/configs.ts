import { DEFAULT_SETTINGS } from '../obsidian/settings';
import { arrayToObjectEnum } from '../utils/array_utils';

export const CONFIGS = {
  settings: DEFAULT_SETTINGS,
  ribbon: {
    icon: 'dice',
    title: 'Sample Plugin',
    class_name: 'my-plugin-ribbon-class'
  },
  css_classes: arrayToObjectEnum(['nm_file', 'nm_file_icon', 'nm_settings_section', 'nm_settings_section_title', 'nm_settings_section_hided']),
  obisidan_classes: {
    file_item: 'nav-file',
    file_title_item: 'nav-file-title',
    file_path_attribute: 'data-path',
    file_extension_badge: 'nav-file-tag',
    folder_item: 'nav-folder',
    collapsed_folder_item: 'is-collapsed'
  }
} as const;
