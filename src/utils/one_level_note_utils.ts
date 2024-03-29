import { FILE_TYPE_ENUM } from '../consts/enums';
import { TPluginSettings } from '../obsidian/settings';
import { groupObjectArrayByKey } from './array_utils';
import { extractLinkInfo, extractMarkdownLinks, generateTOC, getSectionContentByIndex, markdownTableToJson } from './markdown_utils';
import { TLevelNoteConfigs } from './note_utils';

type TDynamicOneLevelNote<A extends string, B extends string> = { [K in A | B]: string } & { title: string };
export type TOneLevelNote = TDynamicOneLevelNote<TPluginSettings['one_level_note_first_column_name'], TPluginSettings['one_level_note_second_column_name']>;
export type TOneLevelNoteConfigs = TLevelNoteConfigs<TOneLevelNote>;

export class OneLevelNote {
  constructor(
    private configs: TOneLevelNoteConfigs,
    private settings: TPluginSettings
  ) {}

  toJson(): TOneLevelNote[] {
    if (this.configs.type === FILE_TYPE_ENUM.JSON) {
      return this.configs.content;
    } else if (this.configs.type === FILE_TYPE_ENUM.MARKDOWN) {
      const typedContent = this.configs.content;
      const toc = generateTOC(typedContent);

      const linksPerSection = Array.from(toc.keys()).map((index) => {
        const indexInfo = toc.get(index)!;
        const sectionContent = getSectionContentByIndex(typedContent, index);
        return {
          section: indexInfo.title,
          level: indexInfo.level,
          links: extractMarkdownLinks(sectionContent, this.settings.one_level_note_second_column_name)
        };
      });

      const reducedLinks = linksPerSection.reduce((acc, section) => {
        const parsedLinks = section.links.map((link) => ({ title: link.title, [this.settings.one_level_note_second_column_name]: link[this.settings.one_level_note_second_column_name], [this.settings.one_level_note_first_column_name]: section.section }));
        return [...acc, ...parsedLinks];
      }, [] as TOneLevelNote[]);

      return reducedLinks;
    } else if (this.configs.type === FILE_TYPE_ENUM.TABLE) {
      const jsonData = markdownTableToJson({ mdContent: this.configs.content });
      const result: TOneLevelNote[] = jsonData.map((item) => {
        const { label, link } = extractLinkInfo(item[this.settings.one_level_note_second_column_name.toUpperCase()]);
        return {
          [this.settings.one_level_note_first_column_name]: item[this.settings.one_level_note_first_column_name.toUpperCase()],
          [this.settings.one_level_note_second_column_name]: link,
          title: label
        };
      });

      return result;
    }

    return [];
  }

  toTable() {
    const jsonData = this.toJson();
    const content = (() => {
      const verticalAlignmentStyle = `style="vertical-align: middle;"`;
      let markdown = '<table>\n';
      markdown += '  <tr>\n';
      markdown += `    <th ${verticalAlignmentStyle}>${this.settings.one_level_note_first_column_name.toUpperCase()}</th>\n`;
      markdown += `    <th>${this.settings.one_level_note_second_column_name.toUpperCase()}</th>\n`;
      markdown += '  </tr>\n';

      let currentTheme: string = '';

      for (const item of jsonData) {
        if (item[this.settings.one_level_note_first_column_name] !== currentTheme) {
          const countRows = jsonData.filter((it) => it[this.settings.one_level_note_first_column_name] === item[this.settings.one_level_note_first_column_name]).length;
          markdown += `  <tr>\n`;
          markdown += `    <td rowspan="${countRows}" ${verticalAlignmentStyle}>${item[this.settings.one_level_note_first_column_name]}</td>\n`;
          currentTheme = item[this.settings.one_level_note_first_column_name];
        } else {
          markdown += `  <tr>\n`;
          markdown += `    <!-- <td>${item[this.settings.one_level_note_first_column_name]}</td> -->\n`;
        }

        markdown += `    <td><a href="${item[this.settings.one_level_note_second_column_name]}">${item.title}</a></td>\n`;
        markdown += `  </tr>\n`;
      }

      markdown += `</table>`;
      return markdown;
    })();

    return `\n${content}\n`;
  }

  toMarkdown() {
    if (this.configs.type === FILE_TYPE_ENUM.MARKDOWN) {
      return this.configs.content;
    } else if (this.configs.type === FILE_TYPE_ENUM.TABLE) {
      const jsonData = this.toJson();
      const groupItems = groupObjectArrayByKey(jsonData, this.settings.one_level_note_first_column_name);
      const contentArr: string[] = [];

      for (const [group, items] of Object.entries(groupItems)) {
        contentArr.push('# ' + group, '');
        for (const linkItem of items) {
          contentArr.push(`- [${linkItem.title}](${linkItem[this.settings.one_level_note_second_column_name]})`);
        }
        contentArr.push('');
      }

      return contentArr.join('\n');
    } else if (this.configs.type === FILE_TYPE_ENUM.JSON) {
      const groupItems = groupObjectArrayByKey(this.configs.content, this.settings.one_level_note_first_column_name);
      const contentArr: string[] = [];

      for (const [group, items] of Object.entries(groupItems)) {
        contentArr.push('# ' + group, '');
        for (const linkItem of items) {
          contentArr.push(`- [${linkItem.title}](${linkItem[this.settings.one_level_note_second_column_name]})`);
        }
        contentArr.push('');
      }

      return contentArr.join('\n');
    }
    return '';
  }
}
