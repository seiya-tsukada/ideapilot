import { useEffect, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { PRIORITIES, type MvpFeatureItem, type MvpSpecification, type TaggedItem } from '#shared/schema.ts';
import { EpistemicBadge, PriorityBadge } from '../../../components/ui/Badges.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { EditableText } from '../../../components/ui/EditableText.tsx';
import { SectionHeader } from '../../../components/ui/Section.tsx';
import { copyToClipboard } from '../../../lib/browser.ts';
import { cn } from '../../../lib/cn.ts';
import { replaceAt, updateAt } from '../../../lib/immutable.ts';
import type { TabProps } from './types.ts';

type ConceptKey = 'productConcept' | 'targetUsers' | 'problemSolved';
type ScopeKey = 'mvpScope' | 'outOfScope' | 'futureExtensions';

const CONCEPT_FIELDS: { key: ConceptKey; title: string }[] = [
  { key: 'productConcept', title: 'プロダクトコンセプト' },
  { key: 'targetUsers', title: '想定ユーザー' },
  { key: 'problemSolved', title: '解決する課題' },
];

const SCOPE_LISTS: { key: ScopeKey; title: string; accent: string }[] = [
  {
    key: 'mvpScope',
    title: 'MVPの開発範囲（実装する）',
    accent: 'text-brand-800',
  },
  { key: 'outOfScope', title: 'MVPでは実装しない機能', accent: 'text-red-800' },
  { key: 'futureExtensions', title: '将来的な拡張案', accent: 'text-zinc-800' },
];

const SMALL_TEXT = 'text-xs leading-relaxed text-zinc-700';
const COPIED_RESET_MS = 3000;

const nextPriority = (p: MvpFeatureItem['priority']) => PRIORITIES[(PRIORITIES.indexOf(p) + 1) % PRIORITIES.length];

export function MvpSpecTab({ report, onChange }: TabProps<'mvpSpecification'>) {
  const spec = report.mvpSpecification;
  const features = spec.essentialFeatures;

  const patch = (next: Partial<MvpSpecification>) => onChange({ ...spec, ...next });
  const patchConcept = (key: ConceptKey, next: Partial<TaggedItem>) => patch({ [key]: { ...spec[key], ...next } });
  const patchFeature = (i: number, next: Partial<MvpFeatureItem>) =>
    patch({ essentialFeatures: updateAt(features, i, next) });

  return (
    <div className="divide-y divide-zinc-200">
      <div className="grid grid-cols-1 divide-y divide-zinc-200 md:grid-cols-3 md:divide-x md:divide-y-0">
        {CONCEPT_FIELDS.map(({ key, title }) => (
          <section key={key} className="space-y-2.5 px-6 py-5">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
              <h3 className="text-sm font-bold text-ink">{title}</h3>
              <EpistemicBadge tag={spec[key].epistemic} onChange={(epistemic) => patchConcept(key, { epistemic })} />
            </div>
            <EditableText
              value={spec[key].content}
              label={`${title}を編集`}
              onSave={(content) => patchConcept(key, { content })}
            />
          </section>
        ))}
      </div>

      <section>
        <SectionHeader
          title="必須機能一覧（最短3日プロトタイプ優先順位）"
          description="P0は3日以内に動かせる最小検証機能。優先度タグをクリックして調整できます。"
        />
        <ul className="divide-y divide-zinc-200">
          {features.map((feature, i) => (
            <li key={i} className="space-y-2 px-6 py-4 sm:px-9">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    title="クリックで優先度を切り替え"
                    onClick={() =>
                      patchFeature(i, {
                        priority: nextPriority(feature.priority),
                      })
                    }
                    className="rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    <PriorityBadge priority={feature.priority} />
                  </button>
                  <EditableText
                    value={feature.name}
                    multiline={false}
                    label={`機能 ${i + 1} の名称を編集`}
                    textClassName="text-sm font-semibold text-ink"
                    onSave={(name) => patchFeature(i, { name })}
                  />
                </div>
                <span
                  className={cn(
                    'rounded-xs border px-2 py-0.5 font-mono text-[11px]',
                    feature.threeDayFeasible
                      ? 'border-brand-200 bg-brand-50 text-brand-800'
                      : 'border-zinc-300 bg-zinc-50 text-zinc-600',
                  )}
                >
                  {feature.threeDayFeasible ? '3日実装対象' : '後続フェーズ推奨'}
                </span>
              </div>
              <EditableText
                value={feature.description}
                label={`機能 ${i + 1} の説明を編集`}
                textClassName="text-xs leading-relaxed text-zinc-600"
                onSave={(description) => patchFeature(i, { description })}
              />
            </li>
          ))}
        </ul>
      </section>

      <SplitRow>
        <Panel title="ユーザーストーリー">
          <PriorityList
            items={spec.userStories.map((s) => ({
              priority: s.priority,
              title: s.role,
              body: `${s.benefit}のために、${s.goal}`,
            }))}
          />
        </Panel>
        <Panel title="主要ユースケース">
          <PriorityList
            items={spec.keyUseCases.map((u) => ({
              priority: u.priority,
              title: u.title,
              body: u.flow,
            }))}
            bodyClassName="text-zinc-600"
          />
        </Panel>
      </SplitRow>

      <SplitRow>
        <Panel title="画面一覧と画面遷移" className="space-y-4">
          <SpecRows>
            {spec.screens.map((screen, i) => (
              <div key={i} className="space-y-1 py-3">
                <div className="text-xs font-bold text-ink">{screen.name}</div>
                <div className="text-xs text-zinc-700">{screen.purpose}</div>
                <div className="text-[11px] text-zinc-500">主要要素: {screen.primaryElements}</div>
              </div>
            ))}
          </SpecRows>
          <div className="pt-1">
            <div className="mb-1.5 text-xs font-semibold text-zinc-700">画面遷移フロー</div>
            <ol className="list-decimal space-y-1 pl-4 text-xs text-zinc-600 tabular-nums">
              {spec.screenTransitions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </Panel>
        <Panel title="データ構造の概要" className="space-y-4">
          <SpecRows>
            {spec.dataStructureOverview.map((entity, i) => (
              <div key={i} className="space-y-1 py-3">
                <div className="font-mono text-xs font-bold text-brand-700">{entity.entity}</div>
                <div className="font-mono text-xs break-words text-zinc-800">{entity.fields}</div>
                <div className="text-[11px] text-zinc-600">{entity.notes}</div>
              </div>
            ))}
          </SpecRows>
        </Panel>
      </SplitRow>

      <div className="grid grid-cols-1 divide-y divide-zinc-200 md:grid-cols-3 md:divide-x md:divide-y-0">
        {SCOPE_LISTS.map(({ key, title, accent }) => (
          <Panel key={key} title={title} titleClassName={accent}>
            <ul className="space-y-2">
              {spec[key].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                  <span className="mt-1 text-zinc-400" aria-hidden>
                    •
                  </span>
                  <EditableText
                    value={item}
                    multiline={false}
                    label={`${title} 項目 ${i + 1} を編集`}
                    className="flex-1"
                    textClassName={SMALL_TEXT}
                    onSave={(next) => patch({ [key]: replaceAt(spec[key], i, next) })}
                  />
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <BuildPromptSection
        prompt={spec.buildPrompt}
        onSave={(buildPrompt) => patch({ buildPrompt })}
      />
    </div>
  );
}

function BuildPromptSection({ prompt, onSave }: { prompt: string; onSave: (next: string) => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await copyToClipboard(prompt);
      setCopied(true);
    } catch {
      window.alert('クリップボードへのコピーに失敗しました。ブラウザの権限設定をご確認ください。');
    }
  };

  const Icon = copied ? Check : Copy;

  return (
    <section>
      <div className="flex flex-col gap-3 bg-night-700 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-9">
        <div>
          <span className="eyebrow text-brand-400">GOOGLE AI STUDIO BUILD PROMPT</span>
          <h2 className="mt-0.5 text-base font-bold text-white">AIアプリ開発プロンプト</h2>
        </div>
        <Button onClick={copy}>
          <Icon className="size-4" aria-hidden />
          {copied ? 'コピーしました' : '開発プロンプトをコピー'}
        </Button>
      </div>
      <div className="bg-surface-subtle px-6 py-5 sm:px-9">
        <EditableText
          value={prompt}
          label="AIアプリ開発プロンプトを編集"
          textClassName="overflow-x-auto rounded-sm border border-zinc-200 bg-white p-4 font-mono text-xs leading-relaxed text-zinc-800"
          onSave={onSave}
        />
      </div>
    </section>
  );
}

function SplitRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-zinc-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">{children}</div>
  );
}

function Panel({
  title,
  titleClassName = 'text-ink',
  className = 'space-y-3',
  children,
}: {
  title: string;
  titleClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('px-6 py-6 sm:px-8', className)}>
      <h3 className={cn('border-b border-zinc-100 pb-2 text-sm font-bold', titleClassName)}>{title}</h3>
      {children}
    </section>
  );
}

function SpecRows({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-zinc-200 border-y border-zinc-200">{children}</div>;
}

function PriorityList({
  items,
  bodyClassName,
}: {
  items: {
    priority: MvpFeatureItem['priority'];
    title: string;
    body: string;
  }[];
  bodyClassName?: string;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="space-y-1 text-xs text-zinc-700">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={item.priority} />
            <span className="font-semibold text-ink">{item.title}</span>
          </div>
          <p className={cn('leading-relaxed', bodyClassName)}>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
