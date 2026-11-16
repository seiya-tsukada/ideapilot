import { useCallback, useEffect, useRef, useState } from 'react';
import { SAMPLE_CORPORATE_REPORT } from './data/sampleReports.ts';
import type {
  AnalysisStepState,
  DecisionReport,
  IdeaInput,
  ReportTabId,
  ScreenView,
} from './types/decision.ts';
import {
  deleteSavedReport,
  getActiveReportId,
  loadSavedReports,
  setActiveReportId,
  upsertReport,
} from './utils/storage.ts';
import { ANALYSIS_STEPS_TEMPLATE } from './utils/validation.ts';
import { TopNav } from './components/TopNav.tsx';
import { IdeaInputScreen } from './components/IdeaInputScreen.tsx';
import { AnalysisProgressScreen } from './components/AnalysisProgressScreen.tsx';
import { DecisionReportScreen } from './components/DecisionReportScreen.tsx';
import { ExportScreen } from './components/ExportScreen.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';

const DEFAULT_INPUT: IdeaInput = {
  idea: '',
  purpose: 'Corporate',
  targetCustomer: '',
  problem: '',
  valueProposition: '',
  constraints: {
    budget: '',
    timeline: '',
    team: '',
    other: '',
  },
  additionalContext: '',
};

function createInitialSteps(): AnalysisStepState[] {
  return ANALYSIS_STEPS_TEMPLATE.map((s) => ({ ...s, status: 'pending' }));
}

export default function App() {
  const [savedReports, setSavedReports] = useState<DecisionReport[]>(() => loadSavedReports());
  const [activeReport, setActiveReport] = useState<DecisionReport | null>(() => {
    const reports = loadSavedReports();
    const activeId = getActiveReportId();
    if (!activeId) return null;
    return reports.find((r) => r.id === activeId) ?? null;
  });

  const [screen, setScreen] = useState<ScreenView>(() => {
    const reports = loadSavedReports();
    const activeId = getActiveReportId();
    if (activeId && reports.some((r) => r.id === activeId)) {
      return 'report';
    }
    return 'input';
  });

  const [activeTab, setActiveTab] = useState<ReportTabId>('decision-brief');
  const [draftInput, setDraftInput] = useState<IdeaInput>(DEFAULT_INPUT);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Screen 2 (Analyzing) state
  const [analysisInput, setAnalysisInput] = useState<IdeaInput | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStepState[]>(createInitialSteps);
  const [analysisMessage, setAnalysisMessage] = useState('AI分析の準備をしています...');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopTimer();
    };
  }, [stopTimer]);

  const handleLoadSampleReport = useCallback(() => {
    const sampleCopy: DecisionReport = {
      ...SAMPLE_CORPORATE_REPORT,
      id: `sample-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextList = upsertReport(sampleCopy);
    setSavedReports(nextList);
    setActiveReport(sampleCopy);
    setActiveTab('decision-brief');
    setScreen('report');
  }, []);

  const runAnalysis = useCallback(
    async (input: IdeaInput) => {
      abortRef.current?.abort();
      stopTimer();

      const controller = new AbortController();
      abortRef.current = controller;

      setAnalysisInput(input);
      setDraftInput(input);
      setAnalysisSteps(createInitialSteps());
      setAnalysisMessage('サーバーへアイデアを送信しています...');
      setAnalysisError(null);
      setElapsedSeconds(0);
      setScreen('analyzing');

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errJson = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(errJson?.error ?? `サーバーエラーが発生しました (${res.status})`);
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error('ストリーミングレスポンスの読み取りに失敗しました。');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let completedReport: DecisionReport | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? '';

          for (const frame of frames) {
            const lines = frame.split('\n');
            let eventName = 'message';
            const dataLines: string[] = [];

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventName = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                dataLines.push(line.slice(6));
              }
            }

            if (dataLines.length === 0) continue;
            const payload = JSON.parse(dataLines.join('\n'));

            if (eventName === 'progress') {
              const { step, status, message } = payload as {
                step: number;
                status: 'in_progress' | 'completed';
                message: string;
              };
              setAnalysisMessage(message);
              setAnalysisSteps((prev) =>
                prev.map((item) => {
                  if (item.step === step) {
                    return { ...item, status };
                  }
                  if (item.step < step && item.status !== 'completed') {
                    return { ...item, status: 'completed' };
                  }
                  return item;
                }),
              );
            } else if (eventName === 'complete') {
              completedReport = (payload as { report: DecisionReport }).report;
            } else if (eventName === 'error') {
              throw new Error((payload as { message?: string }).message ?? 'AI生成に失敗しました。');
            }
          }
        }

        if (!completedReport) {
          throw new Error('分析結果の受信が完了しませんでした。再度お試しください。');
        }

        stopTimer();
        const nextList = upsertReport(completedReport);
        setSavedReports(nextList);
        setActiveReport(completedReport);
        setActiveTab('decision-brief');
        setScreen('report');
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        stopTimer();
        const message =
          err instanceof Error ? err.message : '分析中に予期しないエラーが発生しました。';
        setAnalysisError(message);
        setAnalysisSteps((prev) =>
          prev.map((item) =>
            item.status === 'in_progress' ? { ...item, status: 'error' } : item,
          ),
        );
      }
    },
    [stopTimer],
  );

  const handleUpdateReport = useCallback(
    (updater: (prev: DecisionReport) => DecisionReport) => {
      setSaveStatus('saving');
      setActiveReport((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        const nextList = upsertReport(updated);
        setSavedReports(nextList);
        window.setTimeout(() => setSaveStatus('saved'), 150);
        return updated;
      });
    },
    [],
  );

  const handleSelectReport = useCallback((report: DecisionReport) => {
    setActiveReportId(report.id);
    setActiveReport(report);
    setScreen('report');
  }, []);

  const handleDeleteReport = useCallback(
    (reportId: string) => {
      const nextList = deleteSavedReport(reportId);
      setSavedReports(nextList);
      if (activeReport?.id === reportId) {
        const nextActive = nextList[0] ?? null;
        setActiveReport(nextActive);
        if (!nextActive && (screen === 'report' || screen === 'export')) {
          setScreen('input');
        }
      }
    },
    [activeReport?.id, screen],
  );

  const handleCreateNew = useCallback(() => {
    setDraftInput(DEFAULT_INPUT);
    setScreen('input');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#EAECEB] via-[#F2F4F2] to-[#F7F8F7] text-[#161B18]">
      <TopNav
        currentScreen={screen}
        hasActiveReport={Boolean(activeReport)}
        historyCount={savedReports.length}
        onNavigate={(target) => {
          if ((target === 'report' || target === 'export') && !activeReport) return;
          setScreen(target);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLoadSample={handleLoadSampleReport}
      />

      <div className="flex-1">
        {screen === 'input' && (
          <IdeaInputScreen
            initialInput={draftInput}
            onStartAnalysis={runAnalysis}
            onViewSampleReport={handleLoadSampleReport}
          />
        )}

        {screen === 'analyzing' && analysisInput && (
          <AnalysisProgressScreen
            ideaText={analysisInput.idea}
            purpose={analysisInput.purpose}
            steps={analysisSteps}
            statusMessage={analysisMessage}
            elapsedSeconds={elapsedSeconds}
            errorMessage={analysisError}
            onRetry={() => runAnalysis(analysisInput)}
            onCancel={() => {
              abortRef.current?.abort();
              stopTimer();
              setScreen('input');
            }}
            onUseSampleFallback={handleLoadSampleReport}
          />
        )}

        {screen === 'report' && activeReport && (
          <DecisionReportScreen
            report={activeReport}
            activeTab={activeTab}
            saveStatus={saveStatus}
            onTabChange={setActiveTab}
            onUpdateReport={handleUpdateReport}
            onGoToExport={() => setScreen('export')}
          />
        )}

        {screen === 'export' && activeReport && (
          <ExportScreen
            report={activeReport}
            onBackToEdit={() => setScreen('report')}
          />
        )}
      </div>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        reports={savedReports}
        activeReportId={activeReport?.id ?? null}
        onClose={() => setIsHistoryOpen(false)}
        onSelectReport={handleSelectReport}
        onDeleteReport={handleDeleteReport}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
