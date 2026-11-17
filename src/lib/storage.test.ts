import assert from 'node:assert/strict';
import { it } from 'node:test';
import { SAMPLE_CORPORATE_REPORT } from '../data/samples.ts';
import { createReportStore, type StorageLike } from './storage.ts';

function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
}

it('saves, updates, and deletes reports', () => {
  const store = createReportStore(memoryStorage());

  store.upsert(SAMPLE_CORPORATE_REPORT);
  assert.equal(store.list().length, 1);
  assert.equal(store.getActiveId(), SAMPLE_CORPORATE_REPORT.id);

  store.upsert({ ...SAMPLE_CORPORATE_REPORT, ideaName: '更新後の事業構想名' });
  const reloaded = store.list();
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].ideaName, '更新後の事業構想名');

  assert.equal(store.remove(SAMPLE_CORPORATE_REPORT.id).length, 0);
  assert.equal(store.getActiveId(), null);
});

it('skips malformed entries', () => {
  const storage = memoryStorage();
  storage.setItem(
    'idea_decision_engine_reports_v1',
    JSON.stringify([{ id: 'broken' }, SAMPLE_CORPORATE_REPORT]),
  );
  assert.deepEqual(
    createReportStore(storage).list().map((r) => r.id),
    [SAMPLE_CORPORATE_REPORT.id],
  );
});

it('migrates reports saved with the legacy aiStudioBuildPrompt field', () => {
  const storage = memoryStorage();
  const { buildPrompt, ...spec } = SAMPLE_CORPORATE_REPORT.mvpSpecification;
  const legacy = { ...SAMPLE_CORPORATE_REPORT, mvpSpecification: { ...spec, aiStudioBuildPrompt: buildPrompt } };
  storage.setItem('idea_decision_engine_reports_v1', JSON.stringify([legacy]));

  const [report] = createReportStore(storage).list();
  assert.equal(report.mvpSpecification.buildPrompt, buildPrompt);
  assert.equal('aiStudioBuildPrompt' in report.mvpSpecification, false);
});
