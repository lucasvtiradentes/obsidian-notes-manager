import { FILE_TYPE_ENUM } from '../consts/enums';
import { TPluginSettings } from '../obsidian/settings';
import { groupObjectArrayByKey, mergeArraysOfArrays } from './array_utils';
import { extractLinkInfo, extractMarkdownLinks, generateTOC, getSectionContentByIndex, markdownTableToJson } from './markdown_utils';
import { TLevelNoteConfigs } from './note_utils';

type TDynamicTwoLevelNote<A extends string, B extends string, C extends string> = { [K in A | B | C]: string } & { title: string };
export type TTwoLevelNote = TDynamicTwoLevelNote<TPluginSettings['two_level_note_first_column_name'], TPluginSettings['two_level_note_second_column_name'], TPluginSettings['two_level_note_third_column_name']>;
export type TTwoLevelNoteConfigs = TLevelNoteConfigs<TTwoLevelNote>;

export class TwoLevelNote {
  constructor(
    private configs: TTwoLevelNoteConfigs,
    private settings: TPluginSettings
  ) {}

  private getLinksGroupedByTheme(content: string) {
    const toc = generateTOC(content);
    const linksPerSection = Array.from(toc.keys()).map((index) => {
      const indexInfo = toc.get(index)!;
      return {
        section: indexInfo.title,
        level: indexInfo.level,
        links: extractMarkdownLinks(getSectionContentByIndex(content, index), this.settings.two_level_note_third_column_name)
      };
    });

    const indexes = linksPerSection
      .map((item, index) => ({ index, ...item }))
      .filter((item) => item.level === 1)
      .map((item) => item.index);

    const linksGroupedByTheme: TTwoLevelNote[][] = [];
    for (let x = 0; x < indexes.length; x++) {
      const currentIndex = indexes[x];
      const nextIndex = x + 1 === indexes.length ? linksPerSection.length : indexes[x + 1];
      const grouped = linksPerSection.slice(currentIndex, nextIndex);

      const theme = grouped.find((item) => item.level === 1)!.section;
      const items: TTwoLevelNote[] = mergeArraysOfArrays(
        grouped
          .filter((item) => item.level !== 1)
          .map((item) => item.links.map((it) => ({ [this.settings.two_level_note_first_column_name]: theme, [this.settings.two_level_note_second_column_name]: item.section, [this.settings.two_level_note_third_column_name]: it[this.settings.two_level_note_third_column_name], title: it.title })))
      );
      linksGroupedByTheme.push(items);
    }

    return linksGroupedByTheme;
  }

  toJson(): TTwoLevelNote[] {
    if (this.configs.type === FILE_TYPE_ENUM.JSON) {
      return this.configs.content;
    } else if (this.configs.type === FILE_TYPE_ENUM.MARKDOWN) {
      const linksGroupedByTheme = this.getLinksGroupedByTheme(this.configs.content);
      const finalContent = mergeArraysOfArrays(linksGroupedByTheme);
      return finalContent;
    } else if (this.configs.type === FILE_TYPE_ENUM.TABLE) {
      const jsonData = markdownTableToJson({ mdContent: this.configs.content });
      const result: TTwoLevelNote[] = jsonData.map((item) => {
        const { label, link } = extractLinkInfo(item[this.settings.two_level_note_third_column_name.toUpperCase()]);
        return {
          [this.settings.two_level_note_first_column_name]: item[this.settings.two_level_note_first_column_name.toUpperCase()],
          [this.settings.two_level_note_second_column_name]: item[this.settings.two_level_note_second_column_name.toUpperCase()],
          [this.settings.two_level_note_third_column_name]: link,
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
      markdown += `    <th ${verticalAlignmentStyle}>${this.settings.two_level_note_first_column_name.toUpperCase()}</th>\n`;
      markdown += `    <th ${verticalAlignmentStyle}>${this.settings.two_level_note_second_column_name.toUpperCase()}</th>\n`;
      markdown += `    <th>${this.settings.two_level_note_third_column_name.toUpperCase()}</th>\n`;
      markdown += '  </tr>\n';

      let currentTheme: string = '';
      let currentTopic: string = '';

      for (const item of jsonData) {
        if (item[this.settings.two_level_note_first_column_name] !== currentTheme) {
          const countRows = jsonData.filter((it) => it[this.settings.two_level_note_first_column_name] === item[this.settings.two_level_note_first_column_name]).length;
          markdown += `  <tr>\n`;
          markdown += `    <td rowspan="${countRows}" ${verticalAlignmentStyle}>${item[this.settings.two_level_note_first_column_name]}</td>\n`;
          currentTheme = item[this.settings.two_level_note_first_column_name];
          currentTopic = '';
        } else {
          markdown += `  <tr>\n`;
          markdown += `    <!-- <td>${item[this.settings.two_level_note_first_column_name]}</td> -->\n`;
        }

        if (item[this.settings.two_level_note_second_column_name] !== currentTopic) {
          const countRows = jsonData.filter((it) => it[this.settings.two_level_note_first_column_name] === item[this.settings.two_level_note_first_column_name] && it[this.settings.two_level_note_second_column_name] === item[this.settings.two_level_note_second_column_name]).length;
          markdown += `    <td rowspan="${countRows}" ${verticalAlignmentStyle}>${item[this.settings.two_level_note_second_column_name]}</td>\n`;
          currentTopic = item[this.settings.two_level_note_second_column_name];
        } else {
          markdown += `    <!-- <td>${item[this.settings.two_level_note_second_column_name]}</td> -->\n`;
        }

        markdown += `    <td><a href="${item[this.settings.two_level_note_third_column_name]}">${item.title}</a></td>\n`;
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
      const linksGroupedByTheme = groupObjectArrayByKey(jsonData, this.settings.two_level_note_first_column_name);

      const contentArr: string[] = [];

      for (const [theme, themeLinks] of Object.entries(linksGroupedByTheme)) {
        contentArr.push('# ' + theme, '');
        const linksGroupedByTopic = groupObjectArrayByKey(themeLinks, this.settings.two_level_note_second_column_name);
        const groupedEntries = Object.entries(linksGroupedByTopic);

        for (let x = 0; x < groupedEntries.length; x++) {
          const [topic, topicLinks] = groupedEntries[x];
          contentArr.push('## ' + topic, '');
          for (const linkInfo of topicLinks) {
            contentArr.push(`- [${linkInfo.title}](${linkInfo[this.settings.two_level_note_third_column_name]})`);
          }

          if (x !== groupedEntries.length - 1) {
            contentArr.push('');
          }
        }

        contentArr.push('');
      }

      return contentArr.join('\n');
    } else if (this.configs.type === FILE_TYPE_ENUM.JSON) {
      const linksGroupedByTheme = groupObjectArrayByKey(this.configs.content, this.settings.two_level_note_first_column_name);

      const contentArr: string[] = [];

      for (const [theme, themeLinks] of Object.entries(linksGroupedByTheme)) {
        contentArr.push('# ' + theme, '');
        const linksGroupedByTopic = groupObjectArrayByKey(themeLinks, this.settings.two_level_note_second_column_name);
        const groupedEntries = Object.entries(linksGroupedByTopic);

        for (let x = 0; x < groupedEntries.length; x++) {
          const [topic, topicLinks] = groupedEntries[x];
          contentArr.push('## ' + topic, '');
          for (const linkInfo of topicLinks) {
            contentArr.push(`- [${linkInfo.title}](${linkInfo[this.settings.two_level_note_third_column_name]})`);
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
