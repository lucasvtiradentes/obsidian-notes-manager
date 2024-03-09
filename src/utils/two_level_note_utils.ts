import { CONFIGS } from 'src/consts';

import { groupObjectArrayByKey, mergeArraysOfArrays } from './array_utils';
import { extractLinkInfo, extractMarkdownLinks, generateTOC, getSectionContentByIndex, markdownTableToJson } from './markdown_utils';
import { TLevelNoteConfigs, TLinkInfo } from './note_utils';
import { FILE_TYPE_ENUM } from './obsidian_utils';

type TTwoLevelNote = TLinkInfo;
type TTwoLevelNoteConfigs = TLevelNoteConfigs<TTwoLevelNote>;

export class TwoLevelNote {
  constructor(private configs: TTwoLevelNoteConfigs) {}

  private getLinksGroupedByTheme(content: string) {
    const toc = generateTOC(content);
    const linksPerSection = Array.from(toc.keys()).map((index) => {
      const indexInfo = toc.get(index)!;
      return {
        section: indexInfo.title,
        level: indexInfo.level,
        links: extractMarkdownLinks(getSectionContentByIndex(content, index))
      };
    });

    const indexes = linksPerSection
      .map((item, index) => ({ index, ...item }))
      .filter((item) => item.level === 1)
      .map((item) => item.index);

    const linksGroupedByTheme = [] as TTwoLevelNote[][];
    for (let x = 0; x < indexes.length; x++) {
      const currentIndex = indexes[x];
      const nextIndex = x + 1 === indexes.length ? linksPerSection.length : indexes[x + 1];
      const grouped = linksPerSection.slice(currentIndex, nextIndex);

      const theme = grouped.find((item) => item.level === 1)!.section;
      const items: TTwoLevelNote[] = mergeArraysOfArrays(grouped.filter((item) => item.level !== 1).map((item) => item.links.map((it) => ({ theme: theme, topic: item.section, ...it }))));
      linksGroupedByTheme.push(items);
    }

    return linksGroupedByTheme;
  }

  toJson(): TTwoLevelNote[] {
    if (this.configs.type === FILE_TYPE_ENUM.JSON) {
      return this.configs.content as TLinkInfo[];
    } else if (this.configs.type === FILE_TYPE_ENUM.MARKDOWN) {
      const linksGroupedByTheme = this.getLinksGroupedByTheme(this.configs.content as string);
      const finalContent = mergeArraysOfArrays(linksGroupedByTheme);
      return finalContent;
    } else if (this.configs.type === FILE_TYPE_ENUM.TABLE) {
      const jsonData = markdownTableToJson({ mdContent: this.configs.content as string });
      const [themeKey, topicKey, linkKey] = Object.keys(jsonData[0]);
      const result: TTwoLevelNote[] = jsonData.map((item) => {
        const { label, link } = extractLinkInfo(item[linkKey]);
        return {
          theme: item[themeKey],
          topic: item[topicKey],
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
      markdown += `    <th ${verticalAlignmentStyle}>${CONFIGS.constants.two_level_note.fist_column_name}</th>\n`;
      markdown += `    <th ${verticalAlignmentStyle}>${CONFIGS.constants.two_level_note.second_column_name}</th>\n`;
      markdown += `    <th>${CONFIGS.constants.two_level_note.third_column_name}</th>\n`;
      markdown += '  </tr>\n';

      let currentTheme: string = '';
      let currentTopic: string = '';

      for (const item of jsonData) {
        if (item.theme !== currentTheme) {
          const countRows = jsonData.filter((it) => it.theme === item.theme).length;
          markdown += `  <tr>\n`;
          markdown += `    <td rowspan="${countRows}" ${verticalAlignmentStyle}>${item.theme}</td>\n`;
          currentTheme = item.theme;
          currentTopic = '';
        }

        if (item.topic !== currentTopic) {
          const countRows = jsonData.filter((it) => it.theme === item.theme && it.topic === item.topic).length;
          markdown += `    <td rowspan="${countRows}" ${verticalAlignmentStyle}>${item.topic}</td>\n`;
          currentTopic = item.topic;
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
    if (this.configs.type === FILE_TYPE_ENUM.MARKDOWN) {
      return this.configs.content;
    } else if (this.configs.type === FILE_TYPE_ENUM.TABLE) {
      const jsonData = this.toJson() as TTwoLevelNote[];
      const linksGroupedByTheme = groupObjectArrayByKey(jsonData, 'theme');

      const contentArr: string[] = [];

      for (const [theme, themeLinks] of Object.entries(linksGroupedByTheme)) {
        contentArr.push('# ' + theme, '');
        const linksGroupedByTopic = groupObjectArrayByKey(themeLinks, 'topic');
        const groupedEntries = Object.entries(linksGroupedByTopic);

        for (let x = 0; x < groupedEntries.length; x++) {
          const [topic, topicLinks] = groupedEntries[x];
          contentArr.push('## ' + topic, '');
          for (const linkInfo of topicLinks) {
            contentArr.push(`- [${linkInfo.title}](${linkInfo.link})`);
          }

          if (x !== groupedEntries.length - 1) {
            contentArr.push('');
          }
        }

        contentArr.push('');
      }

      return contentArr.join('\n');
    } else if (this.configs.type === FILE_TYPE_ENUM.JSON) {
      const linksGroupedByTheme = groupObjectArrayByKey(this.configs.content as TLinkInfo[], 'theme');

      const contentArr: string[] = [];

      for (const [theme, themeLinks] of Object.entries(linksGroupedByTheme)) {
        contentArr.push('# ' + theme, '');
        const linksGroupedByTopic = groupObjectArrayByKey(themeLinks, 'topic');
        const groupedEntries = Object.entries(linksGroupedByTopic);

        for (let x = 0; x < groupedEntries.length; x++) {
          const [topic, topicLinks] = groupedEntries[x];
          contentArr.push('## ' + topic, '');
          for (const linkInfo of topicLinks) {
            contentArr.push(`- [${linkInfo.title}](${linkInfo.link})`);
          }

          if (x !== groupedEntries.length - 1) {
            contentArr.push('');
          }
        }

        contentArr.push('');
      }

      return contentArr.join('\n');
    }
    return '';
  }
}
