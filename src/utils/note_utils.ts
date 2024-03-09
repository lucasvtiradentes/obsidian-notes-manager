import { FILE_TYPE_ENUM } from './obsidian_utils';

export type TLinkInfo = {
  title: string;
  link: string;
  theme: string;
  topic: string;
};

export type TLevelNoteConfigs<TContent> =
  | {
      content: string;
      type: typeof FILE_TYPE_ENUM.TABLE | typeof FILE_TYPE_ENUM.MARKDOWN;
    }
  | {
      content: TContent[];
      type: typeof FILE_TYPE_ENUM.JSON;
    };
