import { useCallback, useMemo, useState } from 'react';
import type { DecisionReport } from '#shared/schema.ts';
import { createReportStore, type ReportStore } from '../lib/storage.ts';

const defaultStore = createReportStore();

/** Saved reports + the currently active one, persisted to localStorage. */
export function useReports(store: ReportStore = defaultStore) {
  const [reports, setReports] = useState(store.list);
  const [activeId, setActiveId] = useState(store.getActiveId);

  const active = useMemo(() => reports.find((r) => r.id === activeId) ?? null, [reports, activeId]);

  const save = useCallback(
    (report: DecisionReport) => {
      setReports(store.upsert(report));
      setActiveId(report.id);
    },
    [store],
  );

  const select = useCallback(
    (id: string) => {
      store.setActiveId(id);
      setActiveId(id);
    },
    [store],
  );

  const remove = useCallback(
    (id: string) => {
      const next = store.remove(id);
      setReports(next);
      setActiveId(store.getActiveId());
      return next;
    },
    [store],
  );

  /** Applies an edit to the active report and bumps `updatedAt`. */
  const updateActive = useCallback(
    (updater: (report: DecisionReport) => DecisionReport) => {
      if (!active) return;
      save({ ...updater(active), updatedAt: new Date().toISOString() });
    },
    [active, save],
  );

  return { reports, active, save, select, remove, updateActive };
}
