import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type {
  BusinessModel,
  BusinessModelBlock,
  RevenueModelComparison,
  TaggedItem,
} from '../../types/decision.ts';
import { EpistemicBadge } from '../EpistemicTag.tsx';
import { EditableText } from '../EditableText.tsx';

interface BusinessModelTabProps {
  businessModel: BusinessModel;
  onUpdate: (next: BusinessModel) => void;
}

export const BusinessModelTab: React.FC<BusinessModelTabProps> = ({
  businessModel,
  onUpdate,
}) => {
  const updateBlockItem = (
    blockKey: BusinessModelBlock['key'],
    itemIdx: number,
    patch: Partial<TaggedItem>,
  ) => {
    const nextBlocks = businessModel.blocks.map((block) => {
      if (block.key !== blockKey) return block;
      return {
        ...block,
        items: block.items.map((it, i) => (i === itemIdx ? { ...it, ...patch } : it)),
      };
    });
    onUpdate({ ...businessModel, blocks: nextBlocks });
  };

  const addBlockItem = (blockKey: BusinessModelBlock['key']) => {
    const nextBlocks = businessModel.blocks.map((block) => {
      if (block.key !== blockKey) return block;
      return {
        ...block,
        items: [
          ...block.items,
          { content: '項目を入力してください', epistemic: 'HYPOTHESIS' as const },
        ],
      };
    });
    onUpdate({ ...businessModel, blocks: nextBlocks });
  };

  const removeBlockItem = (blockKey: BusinessModelBlock['key'], itemIdx: number) => {
    const nextBlocks = businessModel.blocks.map((block) => {
      if (block.key !== blockKey) return block;
      return {
        ...block,
        items: block.items.filter((_, i) => i !== itemIdx),
      };
    });
    onUpdate({ ...businessModel, blocks: nextBlocks });
  };

  const updateComparison = (idx: number, patch: Partial<RevenueModelComparison>) => {
    const nextComparisons = businessModel.revenueModelComparisons.map((c, i) =>
      i === idx ? { ...c, ...patch } : c,
    );
    onUpdate({ ...businessModel, revenueModelComparisons: nextComparisons });
  };

  return (
    <div className="divide-y divide-zinc-200">
      {/* 10-Block Business Model Matrix */}
      <section>
        <div className="px-6 py-4 sm:px-9 bg-[#FAFBFA] border-b border-zinc-200">
          <span className="text-[11px] font-mono font-semibold text-[#166534]">
            BUSINESS MODEL ARCHITECTURE
          </span>
          <h2 className="text-base font-bold text-[#161B18] mt-0.5">
            ビジネスモデル構造（10要素マトリクス）
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-x divide-zinc-200">
          {businessModel.blocks.map((block, bIdx) => (
            <div key={block.key} className="px-6 py-5 sm:px-8 flex flex-col justify-between gap-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                  <h3 className="text-sm font-bold text-[#161B18] tabular-nums">
                    <span className="font-mono text-[#166534] mr-1.5">
                      {String(bIdx + 1).padStart(2, '0')}.
                    </span>
                    {block.label}
                  </h3>
                  <button
                    type="button"
                    onClick={() => addBlockItem(block.key)}
                    aria-label={`${block.label} に項目を追加`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#166534] hover:bg-[#EAF4EE] rounded-xs transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>追加</span>
                  </button>
                </div>

                <ul className="space-y-3">
                  {block.items.map((item, idx) => (
                    <li key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <EpistemicBadge
                          tag={item.epistemic}
                          onChange={(next) =>
                            updateBlockItem(block.key, idx, { epistemic: next })
                          }
                        />
                        {block.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBlockItem(block.key, idx)}
                            aria-label={`${block.label} の項目 ${idx + 1} を削除`}
                            className="p-1 text-zinc-400 hover:text-red-700 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      <EditableText
                        value={item.content}
                        label={`${block.label} の項目 ${idx + 1} を編集`}
                        onSave={(nextText) =>
                          updateBlockItem(block.key, idx, { content: nextText })
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Model Comparison Table */}
      <section>
        <div className="px-6 py-4 sm:px-9 bg-[#FAFBFA] border-b border-zinc-200">
          <span className="text-[11px] font-mono font-semibold text-[#166534]">
            MONETIZATION OPTIONS
          </span>
          <h2 className="text-base font-bold text-[#161B18] mt-0.5">収益化モデルの比較検討</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
          {businessModel.revenueModelComparisons.map((model, idx) => (
            <div key={idx} className="px-6 py-6 sm:px-7 space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-200">
                <EditableText
                  value={model.modelName}
                  multiline={false}
                  label={`収益モデル ${idx + 1} の名称を編集`}
                  textClassName="text-sm font-bold text-[#161B18]"
                  onSave={(next) => updateComparison(idx, { modelName: next })}
                />
                <EpistemicBadge
                  tag={model.epistemic}
                  onChange={(next) => updateComparison(idx, { epistemic: next })}
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-semibold text-zinc-500 mb-1">課金メカニズム</div>
                  <EditableText
                    value={model.pricingMechanism}
                    label="課金メカニズムを編集"
                    textClassName="text-xs text-zinc-700 leading-relaxed"
                    onSave={(next) => updateComparison(idx, { pricingMechanism: next })}
                  />
                </div>
                <div>
                  <div className="font-semibold text-[#14532D] mb-1">メリット</div>
                  <EditableText
                    value={model.pros}
                    label="メリットを編集"
                    textClassName="text-xs text-zinc-700 leading-relaxed"
                    onSave={(next) => updateComparison(idx, { pros: next })}
                  />
                </div>
                <div>
                  <div className="font-semibold text-[#6B4F1D] mb-1">デメリット・リスク</div>
                  <EditableText
                    value={model.cons}
                    label="デメリットを編集"
                    textClassName="text-xs text-zinc-700 leading-relaxed"
                    onSave={(next) => updateComparison(idx, { cons: next })}
                  />
                </div>
                <div className="pt-2 border-t border-zinc-100">
                  <div className="font-semibold text-[#14532D] mb-1">適合条件</div>
                  <EditableText
                    value={model.suitability}
                    label="適合条件を編集"
                    textClassName="text-xs text-zinc-700 leading-relaxed"
                    onSave={(next) => updateComparison(idx, { suitability: next })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
