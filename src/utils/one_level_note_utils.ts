import { TPluginSettings } from '../settings/settings';
import { groupObjectArrayByKey } from './array_utils';
import { extractLinkInfo, extractMarkdownLinks, generateTOC, getSectionContentByIndex, markdownTableToJson } from './markdown_utils';
import { TLevelNoteConfigs, TLinkInfo } from './note_utils';
import { FILE_TYPE_ENUM } from './obsidian_utils';

export type TOneLevelNote = Omit<TLinkInfo, 'topic'>;
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
        return {
          section: indexInfo.title,
          level: indexInfo.level,
          links: extractMarkdownLinks(getSectionContentByIndex(typedContent, index))
        };
      });

      const reducedLinks = linksPerSection.reduce((acc, section) => {
        const parsedLinks = section.links.map((link) => ({ ...link, theme: section.section }));
        return [...acc, ...parsedLinks];
      }, [] as TOneLevelNote[]);

      return reducedLinks;
    } else if (this.configs.type === FILE_TYPE_ENUM.TABLE) {
      const jsonData = markdownTableToJson({ mdContent: this.configs.content });
      const [themeKey, linkKey] = Object.keys(jsonData[0]);
      const result: TOneLevelNote[] = jsonData.map((item) => {
        const { label, link } = extractLinkInfo(item[linkKey]);
        return {
          theme: item[themeKey],
          link: link,
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
      markdown += `    <th ${verticalAlignmentStyle}>${this.settings.two_level_note_first_column_name}</th>\n`;
      markdown += `    <th>${this.settings.two_level_note_third_column_name}</th>\n`;
      markdown += '  </tr>\n';

      let currentTheme: string = '';

      for (const item of jsonData) {
        if (item.theme !== currentTheme) {
          const countRows = jsonData.filter((it) => it.theme === item.theme).length;
          markdown += `  <tr>\n`;
          markdown += `    <td rowspan="${countRows}" ${verticalAlignmentStyle}>${item.theme}</td>\n`;
          currentTheme = item.theme;
        } else {
          markdown += `  <tr>\n`;
          markdown += `    <!-- <td>${item.theme}</td> -->\n`;
        }

        markdown += `    <td><a href="${item.link}">${item.title}</a></td>\n`;
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
      const groupItems = groupObjectArrayByKey(jsonData, 'theme');
      const contentArr: string[] = [];

      for (const [group, items] of Object.entries(groupItems)) {
        contentArr.push('# ' + group, '');
        for (const linkItem of items) {
          contentArr.push(`- [${linkItem.title}](${linkItem.link})`);
        }
        contentArr.push('');
      }

      return contentArr.join('\n');
    } else if (this.configs.type === FILE_TYPE_ENUM.JSON) {
      const groupItems = groupObjectArrayByKey(this.configs.content, 'theme');
      const contentArr: string[] = [];

      for (const [group, items] of Object.entries(groupItems)) {
        contentArr.push('# ' + group, '');
        for (const linkItem of items) {
          contentArr.push(`- [${linkItem.title}](${linkItem.link})`);
        }
        contentArr.push('');
      }

      return contentArr.join('\n');
    }
    return '';
  }
}
