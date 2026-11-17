import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Check, Copy, Download, FileCode2, FileText, type LucideIcon } from 'lucide-react';
import type { DecisionReport } from '#shared/schema.ts';
import { Button } from '../../components/ui/Button.tsx';
import { CodeBlock, MarkdownView } from '../../components/ui/MarkdownView.tsx';
import { copyToClipboard, downloadTextFile } from '../../lib/browser.ts';
import { toFileSlug } from '../../lib/format.ts';
import {
  businessModelToMarkdown,
  decisionBriefToMarkdown,
  executiveSummaryToMarkdown,
  mvpToMarkdown,
  proposalToMarkdown,
  reportToFullMarkdown,
  validationPlanToMarkdown,
} from '../../lib/markdown/export.ts';

interface ExportScreenProps {
  report: DecisionReport;
  onBack: () => void;
}

const DELIVERABLES = [
  { key: 'all', label: '全成果物（統合Markdown）', render: reportToFullMarkdown },
  { key: 'executive-summary', label: '01. Executive Summary', render: executiveSummaryToMarkdown },
  { key: 'business-model', label: '02. Business Model', render: businessModelToMarkdown },
  { key: 'decision-brief', label: '03. Decision Brief', render: decisionBriefToMarkdown },
  { key: 'business-proposal', label: '04. Business Proposal（事業提案書）', render: proposalToMarkdown },
  { key: 'mvp-specification', label: '05. MVP Specification（仕様書）', render: mvpToMarkdown },
  { key: 'validation-plan', label: '06. Validation Plan（検証計画）', render: validationPlanToMarkdown },
  {
    key: 'build-prompt',
    label: 'AI開発プロンプト',
    render: (r: DecisionReport) => r.mvpSpecification.buildPrompt,
  },
] as const;

type DeliverableKey = (typeof DELIVERABLES)[number]['key'];

/** Shows a transient status message. */
function useFlash(durationMs = 3500) {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), durationMs);
    return () => window.clearTimeout(id);
  }, [message, durationMs]);
  return [message, setMessage] as const;
}

export function ExportScreen({ report, onBack }: ExportScreenProps) {
  const [selectedKey, setSelectedKey] = useState<DeliverableKey>('all');
  const [flash, setFlash] = useFlash();

  const selected = DELIVERABLES.find((d) => d.key === selectedKey) ?? DELIVERABLES[0];
  const selectedContent = useMemo(() => selected.render(report), [selected, report]);
  const slug = toFileSlug(report.ideaName);

  const copy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      setFlash(`「${label}」をクリップボードにコピーしました。`);
    } catch {
      setFlash('クリップボードへのコピーに失敗しました。ブラウザの権限設定をご確認ください。');
    }
  };

  const download = (suffix: string, content: string, label: string) => {
    const filename = `${slug}_${suffix}.md`;
    downloadTextFile(filename, content);
    setFlash(`「${label}」(${filename}) をダウンロードしました。`);
  };

  const actions: { icon: LucideIcon; title: string; subtitle: ReactNode; run: () => void }[] = [
    {
      icon: Copy,
      title: '全成果物をMarkdown形式でコピー',
      subtitle: '6成果物を統合してコピー',
      run: () => copy(reportToFullMarkdown(report), '全成果物（Markdown形式）'),
    },
    {
      icon: FileCode2,
      title: 'AI開発プロンプトをコピー',
      subtitle: 'AIアプリビルダー投入用',
      run: () => copy(report.mvpSpecification.buildPrompt, 'AI開発プロンプト'),
    },
    {
      icon: FileText,
      title: '選択中の個別成果物をコピー',
      subtitle: `対象: ${selected.label}`,
      run: () => copy(selectedContent, selected.label),
    },
    {
      icon: Download,
      title: '提案書をMarkdownファイルとしてダウンロード',
      subtitle: `${report.input.purpose}向け12セクション構成（.md）`,
      run: () => download('proposal', proposalToMarkdown(report), '事業提案書（Markdown）'),
    },
    {
      icon: Download,
      title: 'MVP仕様書をMarkdownファイルとしてダウンロード',
      subtitle: '機能一覧・データ構造・AI開発プロンプト（.md）',
      run: () => download('mvp_spec', mvpToMarkdown(report), 'MVP仕様書（Markdown）'),
    },
    {
      icon: Download,
      title: '全成果物一式をMarkdown保存',
      subtitle: '全6タブの統合アーカイブ',
      run: () => download('full_report', reportToFullMarkdown(report), '全成果物一式（Markdown）'),
    },
  ];

  return (
    <main className="mx-auto max-w-[1320px] space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      {flash && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-sm border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800"
        >
          <Check className="size-4 shrink-0 text-brand-700" aria-hidden />
          {flash}
        </div>
      )}

      <article className="sheet">
        <header className="flex flex-col gap-4 border-b border-zinc-200 bg-surface-muted px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <div className="eyebrow">EXPORT & HANDOFF · {report.input.purpose}</div>
            <h1 className="mt-1 text-2xl font-bold">{report.ideaName}</h1>
            <p className="mt-1 text-sm text-zinc-600">
              生成した意思決定資料とMVP開発プロンプトを外部ドキュメントや開発環境へ出力します。
            </p>
          </div>
          <Button variant="secondary" size="md" onClick={onBack}>
            <ArrowLeft className="size-4" aria-hidden />
            生成内容を再編集する
          </Button>
        </header>

        <div className="grid grid-cols-1 divide-y divide-zinc-200 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          <aside className="divide-y divide-zinc-200 bg-surface-subtle lg:col-span-4">
            <div className="bg-night-700 px-5 py-3 font-mono text-xs font-semibold text-brand-200">COPY & DOWNLOAD ACTIONS</div>
            {actions.map(({ icon: Icon, title, subtitle, run }) => (
              <button
                key={title}
                type="button"
                onClick={run}
                className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-brand-50"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">{subtitle}</span>
                </span>
              </button>
            ))}
          </aside>

          <section className="flex flex-col lg:col-span-8">
            <div className="flex flex-col gap-3 border-b border-zinc-200 bg-surface-muted px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <label htmlFor="deliverable-select" className="text-xs font-semibold text-zinc-700">
                  プレビュー対象:
                </label>
                <select
                  id="deliverable-select"
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value as DeliverableKey)}
                  className="field w-auto bg-white py-1.5"
                >
                  {DELIVERABLES.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="soft" onClick={() => copy(selectedContent, selected.label)}>
                <Copy className="size-3.5" aria-hidden />
                この内容をコピー
              </Button>
            </div>

            <div className="max-h-[700px] overflow-y-auto p-6 sm:p-8">
              {selectedKey === 'build-prompt' ? (
                <CodeBlock wrap>{selectedContent}</CodeBlock>
              ) : (
                <MarkdownView content={selectedContent} />
              )}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
