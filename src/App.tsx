import { useEffect, useState } from 'react';
import type { DecisionReport, IdeaInput } from '#shared/schema.ts';
import { HistoryDrawer } from './components/layout/HistoryDrawer.tsx';
import { TopNav } from './components/layout/TopNav.tsx';
import { createSampleReport } from './data/samples.ts';
import { AnalysisScreen } from './features/analysis/AnalysisScreen.tsx';
import { useAnalysis } from './features/analysis/useAnalysis.ts';
import { ExportScreen } from './features/export/ExportScreen.tsx';
import { EMPTY_IDEA_INPUT } from './features/idea-input/content.ts';
import { IdeaInputScreen } from './features/idea-input/IdeaInputScreen.tsx';
import { ReportScreen } from './features/report/ReportScreen.tsx';
import { DEFAULT_TAB, type ReportTabId } from './features/report/sections.ts';
import { useReports } from './hooks/useReports.ts';
import type { Screen } from './navigation.ts';

export default function App() {
  const reports = useReports();
  const analysis = useAnalysis();

  const [screen, setScreen] = useState<Screen>(() => (reports.active ? 'report' : 'input'));
  const [activeTab, setActiveTab] = useState<ReportTabId>(DEFAULT_TAB);
  const [draft, setDraft] = useState<IdeaInput>(EMPTY_IDEA_INPUT);
  const [draftKey, setDraftKey] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen]);

  // Report-dependent screens fall back to the input screen when no report is active.
  const visibleScreen: Screen = (screen === 'report' || screen === 'export') && !reports.active ? 'input' : screen;

  const showReport = (report: DecisionReport) => {
    reports.save(report);
    setActiveTab(DEFAULT_TAB);
    setScreen('report');
  };

  const loadSample = () => showReport(createSampleReport());

  const startAnalysis = async (input: IdeaInput) => {
    setDraft(input);
    setScreen('analyzing');
    const report = await analysis.run(input);
    if (report) showReport(report);
  };

  const cancelAnalysis = () => {
    analysis.cancel();
    setScreen('input');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav
        current={visibleScreen}
        hasActiveReport={reports.active !== null}
        historyCount={reports.reports.length}
        onNavigate={setScreen}
        onOpenHistory={() => setHistoryOpen(true)}
        onLoadSample={loadSample}
      />

      <div className="flex-1">
        {visibleScreen === 'input' && (
          <IdeaInputScreen key={draftKey} initialInput={draft} onSubmit={startAnalysis} onViewSample={loadSample} />
        )}

        {visibleScreen === 'analyzing' && (
          <AnalysisScreen
            state={analysis.state}
            onRetry={() => analysis.state.input && startAnalysis(analysis.state.input)}
            onCancel={cancelAnalysis}
            onUseSample={loadSample}
          />
        )}

        {visibleScreen === 'report' && reports.active && (
          <ReportScreen
            report={reports.active}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onUpdate={reports.updateActive}
            onGoToExport={() => setScreen('export')}
          />
        )}

        {visibleScreen === 'export' && reports.active && (
          <ExportScreen report={reports.active} onBack={() => setScreen('report')} />
        )}
      </div>

      <HistoryDrawer
        open={historyOpen}
        reports={reports.reports}
        activeReportId={reports.active?.id ?? null}
        onClose={() => setHistoryOpen(false)}
        onSelect={(report) => {
          reports.select(report.id);
          setScreen('report');
        }}
        onDelete={reports.remove}
        onCreateNew={() => {
          setDraft(EMPTY_IDEA_INPUT);
          setDraftKey((k) => k + 1);
          setScreen('input');
        }}
      />
    </div>
  );
}
