import { FILE_TYPE_ENUM } from './obsidian_utils';

export type TLevelNoteConfigs<TContent> =
  | {
      content: string;
      type: (typeof FILE_TYPE_ENUM)['TABLE'] | (typeof FILE_TYPE_ENUM)['MARKDOWN'];
    }
  | {
      content: TContent[];
      type: (typeof FILE_TYPE_ENUM)['JSON'];
    };
