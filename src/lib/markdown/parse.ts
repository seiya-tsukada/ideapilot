export type MarkdownBlock =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'code'; lang: string; content: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string };

const HEADING = /^(#{1,3})\s+(.*)$/;
const BULLET = /^[-*]\s+/;
const ORDERED = /^\d+\.\s+/;
const QUOTE = /^>\s?/;
const FENCE = '```';
const isRule = (line: string) => line === '---' || line === '***';

const startsBlock = (line: string) =>
  line.startsWith('#') ||
  line.startsWith(FENCE) ||
  QUOTE.test(line) ||
  BULLET.test(line) ||
  ORDERED.test(line) ||
  isRule(line);

/**
 * Minimal Markdown block parser for the subset produced by the exporters
 * (headings, lists, fenced code, blockquotes, rules and paragraphs).
 */
export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  /** Consumes consecutive trimmed lines matching `pattern`, stripping the prefix. */
  const takeWhile = (pattern: RegExp) => {
    const taken: string[] = [];
    while (i < lines.length && pattern.test(lines[i].trim())) {
      taken.push(lines[i].trim().replace(pattern, ''));
      i++;
    }
    return taken;
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith(FENCE)) {
      const lang = line.slice(FENCE.length).trim();
      const content: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(FENCE)) content.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: 'code', lang, content: content.join('\n') });
      continue;
    }

    if (isRule(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3;
      blocks.push({ type: `h${level}`, text: heading[2].trim() });
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      blocks.push({ type: 'blockquote', text: takeWhile(QUOTE).join(' ') });
      continue;
    }

    if (BULLET.test(line)) {
      blocks.push({ type: 'ul', items: takeWhile(BULLET) });
      continue;
    }

    if (ORDERED.test(line)) {
      blocks.push({ type: 'ol', items: takeWhile(ORDERED) });
      continue;
    }

    // Always consume the current line so unknown syntax (e.g. `####`) cannot stall the loop.
    const paragraph = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i].trim())) {
      paragraph.push(lines[i++].trim());
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks;
}
