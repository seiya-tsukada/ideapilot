import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SAMPLE_CORPORATE_REPORT } from '../../data/samples.ts';
import { mvpToMarkdown, proposalToMarkdown, reportToFullMarkdown } from './export.ts';
import { parseMarkdownBlocks } from './parse.ts';

describe('markdown exporters', () => {
  it('include key sections, epistemic tags, and the build prompt', () => {
    const proposal = proposalToMarkdown(SAMPLE_CORPORATE_REPORT);
    assert.match(proposal, /事業提案書 \(Corporate\)/);
    assert.match(proposal, /12\. 意思決定してほしい事項/);

    const mvp = mvpToMarkdown(SAMPLE_CORPORATE_REPORT);
    assert.match(mvp, /MVP Specification/);
    assert.match(mvp, /AIアプリ開発プロンプト/);

    const full = reportToFullMarkdown(SAMPLE_CORPORATE_REPORT);
    for (const heading of ['Executive Summary', 'Decision Brief', 'CONDITIONAL GO', 'Validation Plan']) {
      assert.match(full, new RegExp(heading));
    }
  });
});

describe('parseMarkdownBlocks', () => {
  it('parses headings, lists, code blocks, and paragraphs', () => {
    const blocks = parseMarkdownBlocks(
      ['# Title', '## Subtitle', '', '- Item 1', '- Item 2', '', '1. First', '2. Second', '', '```text', 'Prompt body', '```', '', 'Plain paragraph.'].join('\n'),
    );
    assert.deepEqual(
      blocks.map((b) => b.type),
      ['h1', 'h2', 'ul', 'ol', 'code', 'paragraph'],
    );
  });

  it('treats unsupported syntax as a paragraph instead of looping forever', () => {
    assert.deepEqual(parseMarkdownBlocks('#### Deep heading'), [
      { type: 'paragraph', text: '#### Deep heading' },
    ]);
  });
});
