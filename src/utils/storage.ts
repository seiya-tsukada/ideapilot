import type { DecisionReport } from '../types/decision.ts';

const REPORTS_STORAGE_KEY = 'idea_decision_engine_reports_v1';
const ACTIVE_REPORT_ID_KEY = 'idea_decision_engine_active_id_v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function loadSavedReports(storage: StorageLike | null = getDefaultStorage()): DecisionReport[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is DecisionReport => Boolean(item && item.id && item.ideaName));
  } catch {
    return [];
  }
}

export function saveReports(
  reports: DecisionReport[],
  storage: StorageLike | null = getDefaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    return true;
  } catch {
    return false;
  }
}

export function upsertReport(
  report: DecisionReport,
  storage: StorageLike | null = getDefaultStorage(),
): DecisionReport[] {
  const existing = loadSavedReports(storage);
  const idx = existing.findIndex((r) => r.id === report.id);
  const updatedList =
    idx >= 0
      ? existing.map((r, i) => (i === idx ? report : r))
      : [report, ...existing];
  saveReports(updatedList, storage);
  setActiveReportId(report.id, storage);
  return updatedList;
}

export function deleteSavedReport(
  reportId: string,
  storage: StorageLike | null = getDefaultStorage(),
): DecisionReport[] {
  const existing = loadSavedReports(storage);
  const filtered = existing.filter((r) => r.id !== reportId);
  saveReports(filtered, storage);
  if (getActiveReportId(storage) === reportId) {
    setActiveReportId(filtered[0]?.id ?? null, storage);
  }
  return filtered;
}

export function getActiveReportId(storage: StorageLike | null = getDefaultStorage()): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(ACTIVE_REPORT_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveReportId(
  id: string | null,
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!storage) return;
  try {
    if (id) {
      storage.setItem(ACTIVE_REPORT_ID_KEY, id);
    } else {
      storage.removeItem(ACTIVE_REPORT_ID_KEY);
    }
  } catch {
    // ignore storage errors
  }
}
