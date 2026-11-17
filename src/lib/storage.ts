import { decisionReportSchema, type DecisionReport } from '#shared/schema.ts';

const REPORTS_KEY = 'idea_decision_engine_reports_v1';
const ACTIVE_ID_KEY = 'idea_decision_engine_active_id_v1';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Upgrades reports saved by earlier versions (`aiStudioBuildPrompt` → `buildPrompt`). */
function migrateLegacyReport(item: unknown): unknown {
  if (!isRecord(item) || !isRecord(item.mvpSpecification)) return item;
  const { aiStudioBuildPrompt, ...spec } = item.mvpSpecification;
  if (aiStudioBuildPrompt === undefined || 'buildPrompt' in spec) return item;
  return { ...item, mvpSpecification: { ...spec, buildPrompt: aiStudioBuildPrompt } };
}

const defaultStorage =(): StorageLike | null =>
  typeof window !== 'undefined' ? window.localStorage : null;

/**
 * Persists generated reports in Web Storage.
 * Malformed entries are skipped instead of breaking the whole list.
 */
export function createReportStore(storage: StorageLike | null = defaultStorage()) {
  const read = (key: string) => {
    try {
      return storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };

  const write = (key: string, value: string | null) => {
    try {
      if (value === null) storage?.removeItem(key);
      else storage?.setItem(key, value);
    } catch {
      // Quota exceeded or storage disabled — keep the in-memory state only.
    }
  };

  function list(): DecisionReport[] {
    const raw = read(REPORTS_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => {
        const result = decisionReportSchema.safeParse(migrateLegacyReport(item));
        return result.success ? [result.data] : [];
      });
    } catch {
      return [];
    }
  }

  const saveAll = (reports: DecisionReport[]) => write(REPORTS_KEY, JSON.stringify(reports));

  const getActiveId = () => read(ACTIVE_ID_KEY);
  const setActiveId = (id: string | null) => write(ACTIVE_ID_KEY, id);

  function upsert(report: DecisionReport): DecisionReport[] {
    const existing = list();
    const next = existing.some((r) => r.id === report.id)
      ? existing.map((r) => (r.id === report.id ? report : r))
      : [report, ...existing];
    saveAll(next);
    setActiveId(report.id);
    return next;
  }

  function remove(id: string): DecisionReport[] {
    const next = list().filter((r) => r.id !== id);
    saveAll(next);
    if (getActiveId() === id) setActiveId(next[0]?.id ?? null);
    return next;
  }

  return { list, upsert, remove, getActiveId, setActiveId };
}

export type ReportStore = ReturnType<typeof createReportStore>;
