import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildFallbackClarifyingQuestions, validateIdeaInput } from './validation.ts';

describe('validateIdeaInput', () => {
  it('rejects empty or too-short ideas', () => {
    assert.equal(validateIdeaInput({ idea: '', purpose: 'Corporate' }).success, false);
    assert.equal(validateIdeaInput({ idea: 'abc', purpose: 'Startup' }).success, false);
  });

  it('rejects unknown purposes and non-object payloads', () => {
    assert.equal(validateIdeaInput({ idea: '十分な長さのアイデア', purpose: 'Other' }).success, false);
    assert.equal(validateIdeaInput(null).success, false);
  });

  it('accepts valid input and trims the idea', () => {
    const result = validateIdeaInput({ idea: '  工場の設備保全ナレッジAI  ', purpose: 'Corporate' });
    assert.ok(result.success);
    assert.equal(result.data.idea, '工場の設備保全ナレッジAI');
  });
});

describe('buildFallbackClarifyingQuestions', () => {
  it('returns up to 3 questions for sparse input', () => {
    const questions = buildFallbackClarifyingQuestions({
      idea: '新しいB2B SaaSを作りたい',
      purpose: 'Startup',
    });
    assert.equal(questions.length, 3);
  });

  it('returns nothing when key context is provided', () => {
    const questions = buildFallbackClarifyingQuestions({
      idea: '新しいB2B SaaS',
      purpose: 'Corporate',
      targetCustomer: '中堅製造業',
      problem: '手作業集計の負担',
      constraints: { budget: '300万円' },
    });
    assert.equal(questions.length, 0);
  });
});
