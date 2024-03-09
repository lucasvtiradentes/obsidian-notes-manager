export type TLinkInfo = {
  title: string;
  link: string;
  theme: string;
  topic: string;
};

export type TLevelNoteConfigs<TContent> =
  | {
      content: string;
      type: 'table' | 'markdown';
    }
  | {
      content: TContent[];
      type: 'json';
    };
