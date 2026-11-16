import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type {
  MvpFeatureItem,
  MvpSpecification,
  PriorityLevel,
} from '../../types/decision.ts';
import { EpistemicBadge, PriorityBadge } from '../EpistemicTag.tsx';
import { EditableText } from '../EditableText.tsx';

interface MvpSpecTabProps {
  spec: MvpSpecification;
  onUpdate: (next: MvpSpecification) => void;
}

const PRIORITIES: PriorityLevel[] = ['P0', 'P1', 'P2'];

export const MvpSpecTab: React.FC<MvpSpecTabProps> = ({ spec, onUpdate }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(spec.aiStudioBuildPrompt);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = spec.aiStudioBuildPrompt;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedPrompt(true);
    window.setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const updateFeature = (idx: number, patch: Partial<MvpFeatureItem>) => {
    onUpdate({
      ...spec,
      essentialFeatures: spec.essentialFeatures.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    });
  };

  const updateScopeList = (
    key: 'mvpScope' | 'outOfScope' | 'futureExtensions',
    idx: number,
    nextText: string,
  ) => {
    onUpdate({
      ...spec,
      [key]: spec[key].map((item, i) => (i === idx ? nextText : item)),
    });
  };

  return (
    <div className="divide-y divide-zinc-200">
      {/* Top 3 Core Concept Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
        {(
          [
            { key: 'productConcept', title: 'プロダクトコンセプト' },
            { key: 'targetUsers', title: '想定ユーザー' },
            { key: 'problemSolved', title: '解決する課題' },
          ] as const
        ).map(({ key, title }) => {
          const item = spec[key];
          return (
            <section key={key} className="px-6 py-5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                <h3 className="text-sm font-bold text-[#161B18]">{title}</h3>
                <EpistemicBadge
                  tag={item.epistemic}
                  onChange={(next) =>
                    onUpdate({ ...spec, [key]: { ...item, epistemic: next } })
                  }
                />
              </div>
              <EditableText
                value={item.content}
                label={`${title}を編集`}
                onSave={(nextText) =>
                  onUpdate({ ...spec, [key]: { ...item, content: nextText } })
                }
              />
            </section>
          );
        })}
      </div>

      {/* Essential Features Ledger */}
      <section>
        <div className="px-6 py-4 sm:px-9 bg-[#FAFBFA] border-b border-zinc-200">
          <h2 className="text-base font-bold text-[#161B18]">
            必須機能一覧（最短3日プロトタイプ優先順位）
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            P0は3日以内に動かせる最小検証機能。優先度タグをクリックして調整できます。
          </p>
        </div>

        <div className="divide-y divide-zinc-200">
          {spec.essentialFeatures.map((feat, idx) => (
            <div key={idx} className="px-6 py-4 sm:px-9 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const nextP =
                        PRIORITIES[(PRIORITIES.indexOf(feat.priority) + 1) % PRIORITIES.length];
                      updateFeature(idx, { priority: nextP });
                    }}
                    title="クリックで優先度を切り替え"
                    className="focus-visible:outline-none"
                  >
                    <PriorityBadge priority={feat.priority} />
                  </button>
                  <EditableText
                    value={feat.name}
                    multiline={false}
                    label={`機能 ${idx + 1} の名称を編集`}
                    textClassName="text-sm font-semibold text-[#161B18]"
                    onSave={(next) => updateFeature(idx, { name: next })}
                  />
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-xs border ${
                    feat.threeDayFeasible
                      ? 'text-[#14532D] bg-[#EAF4EE] border-[#A7D3B9]'
                      : 'text-zinc-600 bg-zinc-50 border-zinc-300'
                  }`}
                >
                  {feat.threeDayFeasible ? '3日実装対象' : '後続フェーズ推奨'}
                </span>
              </div>
              <EditableText
                value={feat.description}
                label={`機能 ${idx + 1} の説明を編集`}
                textClassName="text-xs text-zinc-600 leading-relaxed"
                onSave={(next) => updateFeature(idx, { description: next })}
              />
            </div>
          ))}
        </div>
      </section>

      {/* User Stories & Use Cases Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
        <section className="px-6 py-6 sm:px-8 space-y-3">
          <h3 className="text-sm font-bold text-[#161B18] pb-2 border-b border-zinc-100">
            ユーザーストーリー
          </h3>
          <ul className="space-y-3">
            {spec.userStories.map((st, idx) => (
              <li key={idx} className="text-xs text-zinc-700 space-y-1">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={st.priority} />
                  <span className="font-semibold text-[#161B18]">{st.role}</span>
                </div>
                <p className="leading-relaxed">
                  {st.benefit}のために、{st.goal}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-6 py-6 sm:px-8 space-y-3">
          <h3 className="text-sm font-bold text-[#161B18] pb-2 border-b border-zinc-100">
            主要ユースケース
          </h3>
          <ul className="space-y-3">
            {spec.keyUseCases.map((uc, idx) => (
              <li key={idx} className="text-xs text-zinc-700 space-y-1">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={uc.priority} />
                  <span className="font-semibold text-[#161B18]">{uc.title}</span>
                </div>
                <p className="leading-relaxed text-zinc-600">{uc.flow}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Screens & Data Structure Split — Flat Specification Rows (No nested boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
        <section className="px-6 py-6 sm:px-8 space-y-4">
          <h3 className="text-sm font-bold text-[#161B18] pb-2 border-b border-zinc-100">
            画面一覧と画面遷移
          </h3>
          <div className="divide-y divide-zinc-200 border-y border-zinc-200">
            {spec.screens.map((sc, idx) => (
              <div key={idx} className="py-3 space-y-1">
                <div className="text-xs font-bold text-[#161B18]">{sc.name}</div>
                <div className="text-xs text-zinc-700">{sc.purpose}</div>
                <div className="text-[11px] text-zinc-500">主要要素: {sc.primaryElements}</div>
              </div>
            ))}
          </div>
          <div className="pt-1">
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">画面遷移フロー</div>
            <ol className="list-decimal pl-4 space-y-1 text-xs text-zinc-600 tabular-nums">
              {spec.screenTransitions.map((tr, i) => (
                <li key={i}>{tr}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 py-6 sm:px-8 space-y-4">
          <h3 className="text-sm font-bold text-[#161B18] pb-2 border-b border-zinc-100">
            データ構造の概要
          </h3>
          <div className="divide-y divide-zinc-200 border-y border-zinc-200">
            {spec.dataStructureOverview.map((entity, idx) => (
              <div key={idx} className="py-3 space-y-1">
                <div className="text-xs font-mono font-bold text-[#166534]">{entity.entity}</div>
                <div className="text-xs font-mono text-zinc-800 break-words">{entity.fields}</div>
                <div className="text-[11px] text-zinc-600">{entity.notes}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Scope Boundaries Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
        {(
          [
            { key: 'mvpScope', title: 'MVPの開発範囲（実装する）', accent: 'text-[#14532D]' },
            { key: 'outOfScope', title: 'MVPでは実装しない機能', accent: 'text-red-800' },
            { key: 'futureExtensions', title: '将来的な拡張案', accent: 'text-zinc-800' },
          ] as const
        ).map(({ key, title, accent }) => (
          <section key={key} className="px-6 py-5 space-y-3">
            <h3 className={`text-sm font-bold pb-2 border-b border-zinc-100 ${accent}`}>
              {title}
            </h3>
            <ul className="space-y-2">
              {spec[key].map((item, idx) => (
                <li key={idx} className="text-xs text-zinc-700 flex items-start gap-2">
                  <span className="text-zinc-400 mt-1">•</span>
                  <div className="flex-1">
                    <EditableText
                      value={item}
                      multiline={false}
                      label={`${title} 項目 ${idx + 1} を編集`}
                      textClassName="text-xs text-zinc-700 leading-relaxed"
                      onSave={(next) => updateScopeList(key, idx, next)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Google AI Studio Build Prompt */}
      <section>
        <div className="px-6 py-4 sm:px-9 bg-gradient-to-r from-[#1B2822] via-[#16201B] to-[#111815] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-semibold text-emerald-300">
              GOOGLE AI STUDIO BUILD PROMPT
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              Google AI Studio用 アプリ開発プロンプト
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] rounded-sm transition-colors whitespace-nowrap shrink-0"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>コピーしました</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>開発プロンプトをコピー</span>
              </>
            )}
          </button>
        </div>

        <div className="px-6 py-5 sm:px-9 bg-[#FAFBFA]">
          <EditableText
            value={spec.aiStudioBuildPrompt}
            label="Google AI Studio用開発プロンプトを編集"
            textClassName="text-xs font-mono text-zinc-800 bg-white border border-zinc-200 rounded-sm p-4 leading-relaxed overflow-x-auto"
            onSave={(next) => onUpdate({ ...spec, aiStudioBuildPrompt: next })}
          />
        </div>
      </section>
    </div>
  );
};
