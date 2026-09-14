/**
 * Minimal markdown -> Sanity Portable Text converter shared by the blog
 * publish script and any one-off repair scripts, so they never drift apart.
 * Supports: H2/H3, paragraphs, bullet/numbered lists, bold/italic, links,
 * and GitHub-style pipe tables (rendered as a `table` object block).
 */

export type Span = { _type: 'span'; _key: string; text: string; marks: string[] };
export type MarkDef = { _type: 'link'; _key: string; href: string };
export type Block = {
  _type: 'block';
  _key: string;
  style: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  markDefs: MarkDef[];
  children: Span[];
};
export type TableBlock = {
  _type: 'table';
  _key: string;
  rows: Array<{ _type: 'tableRow'; _key: string; cells: string[] }>;
};
export type AnyBlock = Block | TableBlock;

let keyCounter = 0;
const k = () => `b${++keyCounter}`;

function parseInline(text: string): { children: Span[]; markDefs: MarkDef[] } {
  const markDefs: MarkDef[] = [];
  const children: Span[] = [];
  const tokenRegex = /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  const pushSpan = (t: string, marks: string[] = []) => {
    if (!t) return;
    children.push({ _type: 'span', _key: k(), text: t, marks });
  };
  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) pushSpan(text.slice(lastIdx, match.index));
    if (match[1]) {
      const lm = match[1].match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      const linkKey = k();
      markDefs.push({ _type: 'link', _key: linkKey, href: lm[2] });
      pushSpan(lm[1], [linkKey]);
    } else if (match[2]) {
      pushSpan(match[2].slice(2, -2), ['strong']);
    } else if (match[3]) {
      pushSpan(match[3].slice(1, -1), ['em']);
    }
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) pushSpan(text.slice(lastIdx));
  return { children, markDefs };
}

function parseTableRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}

const isTableSeparator = (line: string) => /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(line.trim());
const isTableRow = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|');

export function markdownToBlocks(md: string): AnyBlock[] {
  keyCounter = 0;
  const blocks: AnyBlock[] = [];
  const lines = md.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    if (line.startsWith('# ')) {
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      const { children, markDefs } = parseInline(line.slice(3).trim());
      blocks.push({ _type: 'block', _key: k(), style: 'h2', markDefs, children });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      const { children, markDefs } = parseInline(line.slice(4).trim());
      blocks.push({ _type: 'block', _key: k(), style: 'h3', markDefs, children });
      i++;
      continue;
    }
    if (line.match(/^[-*]\s/)) {
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        const { children, markDefs } = parseInline(lines[i].replace(/^[-*]\s/, ''));
        blocks.push({ _type: 'block', _key: k(), style: 'normal', listItem: 'bullet', level: 1, markDefs, children });
        i++;
      }
      continue;
    }
    if (line.match(/^\d+\.\s/)) {
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const { children, markDefs } = parseInline(lines[i].replace(/^\d+\.\s/, ''));
        blocks.push({ _type: 'block', _key: k(), style: 'normal', listItem: 'number', level: 1, markDefs, children });
        i++;
      }
      continue;
    }
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const rows: Array<{ _type: 'tableRow'; _key: string; cells: string[] }> = [];
      rows.push({ _type: 'tableRow', _key: k(), cells: parseTableRow(line) });
      i += 2; // skip header + separator
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push({ _type: 'tableRow', _key: k(), cells: parseTableRow(lines[i]) });
        i++;
      }
      blocks.push({ _type: 'table', _key: k(), rows });
      continue;
    }
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].match(/^[-*]\s/) &&
      !lines[i].match(/^\d+\.\s/) &&
      !isTableRow(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    const { children, markDefs } = parseInline(para.join(' '));
    blocks.push({ _type: 'block', _key: k(), style: 'normal', markDefs, children });
  }
  return blocks;
}
