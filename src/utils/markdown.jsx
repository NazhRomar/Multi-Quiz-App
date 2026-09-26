// A small Markdown renderer for the study notes viewer. Covers the
// subset study notes actually use — headings, paragraphs, bullet/numbered/
// task lists, tables, blockquotes, fenced code, rules, and inline bold/
// italic/code/links — and builds React elements directly (no innerHTML),
// so nothing in a note can inject markup.
import { slugify } from './slugify.js';

const HEADING = /^(#{1,6})\s+(.*)$/;
const FENCE = /^```/;
const RULE = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;
const LIST_ITEM = /^\s*([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

// Parses Markdown text into a flat list of block nodes. Blockquotes parse
// their own contents recursively.
export function parseMarkdown(src) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  const isBlockStart = (line, next) =>
    HEADING.test(line) || FENCE.test(line) || RULE.test(line) || /^\s*>/.test(line) || LIST_ITEM.test(line) || (line.trim().startsWith('|') && next != null && TABLE_SEP.test(next));

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (FENCE.test(line)) {
      const lang = line.slice(3).trim();
      const body = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: 'code', lang, text: body.join('\n') });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2].trim() });
      i++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: 'rule' });
      i++;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      blocks.push({ type: 'quote', children: parseMarkdown(body.join('\n')) });
      continue;
    }

    if (line.trim().startsWith('|') && TABLE_SEP.test(lines[i + 1] || '')) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]));
      blocks.push({ type: 'table', head, rows });
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const ordered = /^\s*\d/.test(line);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(LIST_ITEM);
        if (m && /^\s*\d/.test(lines[i]) === ordered) {
          const task = m[2].match(/^\[( |x|X)\]\s+(.*)$/);
          items.push(task ? { text: task[2], checked: task[1] !== ' ' } : { text: m[2] });
          i++;
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length && !m) {
          // Indented continuation of the previous item.
          items[items.length - 1].text += ' ' + lines[i].trim();
          i++;
        } else break;
      }
      const start = ordered ? parseInt(line.trim(), 10) : undefined;
      blocks.push({ type: 'list', ordered, start, items });
      continue;
    }

    const para = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i], lines[i + 1])) para.push(lines[i++].trim());
    blocks.push({ type: 'para', text: para.join(' ') });
  }

  return blocks;
}

// `code`, **bold**, *italic* / _italic_, [text](url). Bold/italic/link
// text is parsed again so they can nest.
const INLINE = /(`+)([\s\S]+?)\1|\*\*([\s\S]+?)\*\*|__([\s\S]+?)__|\*([^*\s][^*]*?)\*|(?<![\w])_([^_\s][^_]*?)_(?![\w])|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function renderInline(text, keyPrefix = 'i') {
  const out = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${n++}`;
    if (m[2] != null) out.push(<code key={key}>{m[2].trim()}</code>);
    else if (m[3] != null || m[4] != null) out.push(<strong key={key}>{renderInline(m[3] ?? m[4], key)}</strong>);
    else if (m[5] != null || m[6] != null) out.push(<em key={key}>{renderInline(m[5] ?? m[6], key)}</em>);
    else if (m[7] != null) {
      const href = /^(https?:|mailto:)/i.test(m[8]) ? m[8] : undefined;
      out.push(
        <a key={key} href={href} target="_blank" rel="noopener noreferrer">
          {renderInline(m[7], key)}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Plain text of a heading, for its id and the table of contents.
export const stripInline = (text) => text.replace(/[*_`]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

// Gives every heading a unique id (slugified text, de-duplicated with -2,
// -3...) and returns them in document order for the table of contents.
export function collectHeadings(blocks) {
  const seen = new Map();
  const headings = [];
  for (const block of blocks) {
    if (block.type !== 'heading') continue;
    const label = stripInline(block.text);
    const base = slugify(label) || 'section';
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    block.id = count === 1 ? base : `${base}-${count}`;
    headings.push({ id: block.id, level: block.level, label });
  }
  return headings;
}

export function MarkdownBlocks({ blocks }) {
  return blocks.map((block, i) => {
    const key = `b${i}`;
    switch (block.type) {
      case 'heading': {
        const Tag = `h${block.level}`;
        return (
          <Tag key={key} id={block.id} className={`md-h md-h${block.level}`}>
            {renderInline(block.text, key)}
          </Tag>
        );
      }
      case 'para':
        return <p key={key}>{renderInline(block.text, key)}</p>;
      case 'rule':
        return <hr key={key} />;
      case 'quote':
        return (
          <blockquote key={key}>
            <MarkdownBlocks blocks={block.children} />
          </blockquote>
        );
      case 'code':
        return (
          <pre key={key} className="md-code">
            <code>{block.text}</code>
          </pre>
        );
      case 'table':
        return (
          <div key={key} className="md-table-wrap">
            <table>
              <thead>
                <tr>
                  {block.head.map((cell, c) => (
                    <th key={c}>{renderInline(cell, `${key}-h${c}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {block.head.map((_, c) => (
                      <td key={c}>{renderInline(row[c] ?? '', `${key}-${r}-${c}`)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'list': {
        const Tag = block.ordered ? 'ol' : 'ul';
        const isTasks = block.items.some((it) => it.checked != null);
        return (
          <Tag key={key} start={block.start !== 1 ? block.start : undefined} className={isTasks ? 'md-tasks' : undefined}>
            {block.items.map((item, j) => (
              <li key={j} className={item.checked != null ? 'md-task' : undefined}>
                {item.checked != null && <TaskBox defaultChecked={item.checked} />}
                <span>{renderInline(item.text, `${key}-${j}`)}</span>
              </li>
            ))}
          </Tag>
        );
      }
      default:
        return null;
    }
  });
}

// Tickable for the current visit only — handy for self-check lists, but
// nothing is saved.
function TaskBox({ defaultChecked }) {
  return <input type="checkbox" className="md-task-box" defaultChecked={defaultChecked} aria-label="Done" />;
}
