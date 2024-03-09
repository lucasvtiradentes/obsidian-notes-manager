import { CONFIGS } from 'src/consts';

import { groupObjectArrayByKey } from './array_utils';
import { extractLinkInfo, extractMarkdownLinks, generateTOC, getSectionContentByIndex, markdownTableToJson } from './markdown_utils';
import { TLevelNoteConfigs, TLinkInfo } from './note_utils';

type TOneLevelNote = Omit<TLinkInfo, 'topic'>;
type TOneLevelNoteConfigs = TLevelNoteConfigs<TOneLevelNote>;

export class OneLevelNote {
  constructor(private configs: TOneLevelNoteConfigs) {}

  toJson(): TOneLevelNote[] {
    if (this.configs.type === 'json') {
      return this.configs.content;
    } else if (this.configs.type === 'markdown') {
      const toc = generateTOC(this.configs.content);
      const linksPerSection = Array.from(toc.keys()).map((index) => {
        const indexInfo = toc.get(index)!;
        return {
          section: indexInfo.title,
          level: indexInfo.level,
          links: extractMarkdownLinks(getSectionContentByIndex(this.configs.content as string, index))
        };
      });

      const reducedLinks = linksPerSection.reduce((acc, section) => {
        const parsedLinks = section.links.map((link) => ({ ...link, theme: section.section }));
        return [...acc, ...parsedLinks];
      }, [] as TOneLevelNote[]);

      return reducedLinks;
    } else if (this.configs.type === 'table') {
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
      let markdown = '<table>\n';
      markdown += '  <tr>\n';
      markdown += `    <th style="vertical-align: middle;">${CONFIGS.constants.two_level_note.fist_column_name}</th>\n`;
      markdown += `    <th style="vertical-align: middle;">${CONFIGS.constants.two_level_note.second_column_name}</th>\n`;
      markdown += `    <th>${CONFIGS.constants.two_level_note.third_column_name}</th>\n`;
      markdown += '  </tr>\n';

      let currentTheme: string = '';

      for (const item of jsonData) {
        if (item.theme !== currentTheme) {
          const countRows = jsonData.filter((it) => it.theme === item.theme).length;
          markdown += `  <tr>\n`;
          markdown += `    <td rowspan="${countRows}" style="vertical-align: middle;">${item.theme}</td>\n`;
          currentTheme = item.theme;
        }

        markdown += `    <td><a href="${item.link}">${item.title}</a></td>\n`;
        markdown += `  </tr>\n`;
      }

      markdown += `</table>`;
      return markdown;
    })();

    return content;
  }

  toMarkdown() {
    if (this.configs.type === 'markdown') {
      return this.configs.content;
    } else if (this.configs.type === 'table') {
      const jsonData = this.toJson() as TOneLevelNote[];
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
    } else if (this.configs.type === 'json') {
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
