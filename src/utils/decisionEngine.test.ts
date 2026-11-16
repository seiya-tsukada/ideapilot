import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateIdeaInput,
  buildFallbackClarifyingQuestions,
} from './validation.ts';
import {
  proposalToMarkdown,
  mvpToMarkdown,
  reportToFullMarkdown,
  parseMarkdownBlocks,
} from './exportMarkdown.ts';
import {
  upsertReport,
  loadSavedReports,
  deleteSavedReport,
  getActiveReportId,
  type StorageLike,
} from './storage.ts';
import { SAMPLE_CORPORATE_REPORT } from '../data/sampleReports.ts';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test('validateIdeaInput rejects empty idea and accepts valid Corporate/Startup input', () => {
  assert.equal(validateIdeaInput({ idea: '', purpose: 'Corporate' }).valid, false);
  assert.equal(validateIdeaInput({ idea: 'abc', purpose: 'Startup' }).valid, false);
  assert.equal(
    validateIdeaInput({ idea: '工場の設備保全ナレッジAIを構築する', purpose: 'Corporate' }).valid,
    true,
  );
});

test('buildFallbackClarifyingQuestions returns at most 3 questions for sparse input and 0 for complete input', () => {
  const sparse = buildFallbackClarifyingQuestions({
    idea: '新しいB2B SaaSを作りたい',
    purpose: 'Startup',
  });
  assert.equal(sparse.length, 3);

  const complete = buildFallbackClarifyingQuestions({
    idea: '新しいB2B SaaS',
    purpose: 'Corporate',
    targetCustomer: '中堅製造業',
    problem: '手作業集計の負担',
    constraints: { budget: '300万円' },
  });
  assert.equal(complete.length, 0);
});

test('Markdown exporters include key sections, epistemic tags, and AI Studio prompt', () => {
  const proposalMd = proposalToMarkdown(SAMPLE_CORPORATE_REPORT);
  assert.match(proposalMd, /事業提案書 \(Corporate\)/);
  assert.match(proposalMd, /12\. 意思決定してほしい事項/);

  const mvpMd = mvpToMarkdown(SAMPLE_CORPORATE_REPORT);
  assert.match(mvpMd, /MVP Specification/);
  assert.match(mvpMd, /Google AI Studio Build用プロンプト/);

  const fullMd = reportToFullMarkdown(SAMPLE_CORPORATE_REPORT);
  assert.match(fullMd, /Executive Summary/);
  assert.match(fullMd, /Decision Brief/);
  assert.match(fullMd, /CONDITIONAL GO/);
  assert.match(fullMd, /Validation Plan/);
});

test('parseMarkdownBlocks parses headings, lists, code blocks, and paragraphs safely', () => {
  const blocks = parseMarkdownBlocks(`# Title
## Subtitle

- Item 1
- Item 2

1. First
2. Second

\`\`\`text
Prompt body
\`\`\`

Plain paragraph.`);

  assert.equal(blocks[0].type, 'h1');
  assert.equal(blocks[1].type, 'h2');
  assert.equal(blocks[2].type, 'ul');
  assert.equal(blocks[3].type, 'ol');
  assert.equal(blocks[4].type, 'code');
  assert.equal(blocks[5].type, 'paragraph');
});

test('storage helpers save, load, update, and delete reports reliably', () => {
  const storage = createMemoryStorage();
  upsertReport(SAMPLE_CORPORATE_REPORT, storage);

  const loaded = loadSavedReports(storage);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, SAMPLE_CORPORATE_REPORT.id);
  assert.equal(getActiveReportId(storage), SAMPLE_CORPORATE_REPORT.id);

  const modified = { ...SAMPLE_CORPORATE_REPORT, ideaName: '更新後の事業構想名' };
  upsertReport(modified, storage);
  const reloaded = loadSavedReports(storage);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].ideaName, '更新後の事業構想名');

  const afterDelete = deleteSavedReport(SAMPLE_CORPORATE_REPORT.id, storage);
  assert.equal(afterDelete.length, 0);
  assert.equal(getActiveReportId(storage), null);
});
