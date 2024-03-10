type TTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';

type TTagRegex = {
  level: number;
  mdRegex: RegExp;
  htmlRegex: RegExp;
};

const MD_TAGS = new Map<TTag, TTagRegex>([
  ['h1', { level: 1, mdRegex: /^#\s+(.*)/, htmlRegex: /<h1>(.*?)<\/h1>/ }],
  ['h2', { level: 2, mdRegex: /^##\s+(.*)/, htmlRegex: /<h2>(.*?)<\/h2>/ }],
  ['h3', { level: 3, mdRegex: /^###\s+(.*)/, htmlRegex: /<h3>(.*?)<\/h3>/ }],
  ['h4', { level: 4, mdRegex: /^####\s+(.*)/, htmlRegex: /<h4>(.*?)<\/h4>/ }],
  ['h5', { level: 5, mdRegex: /^#####\s+(.*)/, htmlRegex: /<h5>(.*?)<\/h5>/ }],
  ['h6', { level: 6, mdRegex: /^#####\s+(.*)/, htmlRegex: /<h6>(.*?)<\/h6>/ }],
  ['h7', { level: 7, mdRegex: /^#####\s+(.*)/, htmlRegex: /<h7>(.*?)<\/h7>/ }]
]);

export const checkLine = (line: string) => {
  let tag: {
    value: string;
    type: TTag | 'none';
    level: number;
  } = {
    value: '',
    type: 'none',
    level: -1
  };

  for (const [key, value] of MD_TAGS.entries()) {
    const regex = MD_TAGS.get(key) as TTagRegex;
    const mdMatch = regex.mdRegex.exec(line);
    const htmlMatch = regex.htmlRegex.exec(line);

    if (mdMatch && mdMatch[1]) {
      tag = {
        type: key,
        value: mdMatch[1],
        level: value.level
      };
      break;
    } else if (htmlMatch && htmlMatch[1]) {
      tag = {
        type: key,
        value: htmlMatch[1].replace(/<\/?h1>/g, '').trim(),
        level: value.level
      };
      break;
    }
  }

  return tag;
};

export const generateTOC = (content: string) => {
  const lines = content.split('\n');
  const tocLines = lines.map((line, lineIndex) => ({ ...checkLine(line), line: lineIndex })).filter((line) => line.level !== -1);

  const tocMap = new Map<string, { title: string; level: number; line: number }>();
  const levelIndex: number[] = [];

  for (const tocItem of tocLines) {
    const { level, value, line } = tocItem;
    levelIndex[level - 1] = (levelIndex[level - 1] || 0) + 1;
    tocMap.set(`${levelIndex.slice(0, level).join('.')}`, { line, level, title: value });
    levelIndex.fill(0, level);
  }

  return tocMap;
};

export function markdownTableToJson({ mdContent }: { mdContent: string }) {
  const trArray = (() => {
    const trRegex = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi;
    const trMatches = mdContent.match(trRegex);
    return trMatches || [];
  })();

  const headerItem = trArray.find((line) => line.includes('<th>') && line.includes('</th>'));
  const bodyItems = trArray.filter((line) => !line.includes('<th>') && !line.includes('</th>'));

  const tableColumns = (() => {
    const thContentRegex = /<th\b[^>]*>(.*?)<\/th>/gi;
    const thMatches = (headerItem ?? '').match(thContentRegex);
    if (!thMatches) return [];
    return thMatches.map((match) => match.replace(/<\/?th[^>]*>/g, ''));
  })();

  const tableRows = (() => {
    return bodyItems.map((line) => {
      const tdContentRegex = /<td\b[^>]*>(.*?)<\/td>/gi;
      const tdMatches = [...line.matchAll(tdContentRegex)];
      const tdContents = tdMatches.reduce(
        (acc, match, index) => {
          acc[tableColumns[index]] = match[1];
          return acc;
        },
        {} as Record<string, string>
      );
      return tdContents;
    });
  })();

  return tableRows;
}

export function extractLinkInfo(linkHTML: string) {
  const regex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)?>(.*?)<\/a>/;
  const match = linkHTML.match(regex);

  if (match) {
    const link = match[1];
    const label = match[3];
    return { label, link };
  } else {
    throw new Error('Failed to extract link info from HTML');
  }
}

export function extractMarkdownLinks(markdown: string): { title: string; link: string }[] {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;

  return [...markdown.matchAll(regex)].map((match) => ({
    title: match[1],
    link: match[2]
  }));
}

// =============================================================================

const getSectionLines = (content: string, value: string, mode: 'index' | 'title') => {
  const contentArr = content.split('\n');

  const markdownToc = generateTOC(content);
  const sectionMapItemIndex = mode === 'index' ? [...markdownToc.keys()].findIndex((item) => item === value) : [...markdownToc.values()].findIndex((item) => item.title === value);
  const secionLine = [...markdownToc.values()][sectionMapItemIndex].line;
  const nextSectionLine = sectionMapItemIndex + 1 < markdownToc.size ? [...markdownToc.values()][sectionMapItemIndex + 1].line : contentArr.length;

  return { secionLine, nextSectionLine };
};

const getSectionContent = (content: string, value: string, mode: 'title' | 'index') => {
  const contentArr = content.split('\n');
  const { secionLine, nextSectionLine } = getSectionLines(content, value, mode);
  return contentArr.slice(secionLine + 1, nextSectionLine).join('\n');
};

export const getSectionContentByTitle = (content: string, title: string) => {
  return getSectionContent(content, title, 'title');
};

export const getSectionContentByIndex = (content: string, index: string) => {
  return getSectionContent(content, index, 'index');
};

export const addSectionToContent = (content: string, sectionTitle: string, sectionContent: string) => {
  return `${content}${content === '' ? '' : '\n'}${sectionTitle}\n${sectionContent}`;
};
