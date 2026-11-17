import { Plus, Trash2 } from 'lucide-react';
import type { BusinessModelBlock, RevenueModelComparison, TaggedItem } from '#shared/schema.ts';
import { EpistemicBadge } from '../../../components/ui/Badges.tsx';
import { Button, IconButton } from '../../../components/ui/Button.tsx';
import { EditableText } from '../../../components/ui/EditableText.tsx';
import { Field, NumberedTitle, SectionHeader } from '../../../components/ui/Section.tsx';
import { removeAt, replaceAt, updateAt } from '../../../lib/immutable.ts';
import type { TabProps } from './types.ts';

type ComparisonTextKey = 'pricingMechanism' | 'pros' | 'cons' | 'suitability';

const COMPARISON_FIELDS: {
  key: ComparisonTextKey;
  title: string;
  label: string;
  tone: string;
}[] = [
  {
    key: 'pricingMechanism',
    title: '課金メカニズム',
    label: '課金メカニズムを編集',
    tone: 'text-zinc-500',
  },
  {
    key: 'pros',
    title: 'メリット',
    label: 'メリットを編集',
    tone: 'text-brand-800',
  },
  {
    key: 'cons',
    title: 'デメリット・リスク',
    label: 'デメリットを編集',
    tone: 'text-hypothesis-800',
  },
  {
    key: 'suitability',
    title: '適合条件',
    label: '適合条件を編集',
    tone: 'text-brand-800',
  },
];

const NEW_BLOCK_ITEM: TaggedItem = {
  content: '項目を入力してください',
  epistemic: 'HYPOTHESIS',
};

export function BusinessModelTab({ report, onChange }: TabProps<'businessModel'>) {
  const model = report.businessModel;
  const { blocks, revenueModelComparisons: comparisons } = model;

  const setBlock = (index: number, block: BusinessModelBlock) =>
    onChange({ ...model, blocks: replaceAt(blocks, index, block) });

  const patchComparison = (index: number, patch: Partial<RevenueModelComparison>) =>
    onChange({
      ...model,
      revenueModelComparisons: updateAt(comparisons, index, patch),
    });

  return (
    <div className="divide-y divide-zinc-200">
      <section>
        <SectionHeader eyebrow="BUSINESS MODEL ARCHITECTURE" title="ビジネスモデル構造（10要素マトリクス）" />
        <div className="grid grid-cols-1 divide-y divide-zinc-200 md:grid-cols-2 md:divide-x">
          {blocks.map((block, i) => (
            <BlockCard key={block.key} index={i + 1} block={block} onChange={(next) => setBlock(i, next)} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="MONETIZATION OPTIONS" title="収益化モデルの比較検討" />
        <div className="grid grid-cols-1 divide-y divide-zinc-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {comparisons.map((comparison, i) => (
            <article key={i} className="space-y-4 px-6 py-6 sm:px-7">
              <div className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
                <EditableText
                  value={comparison.modelName}
                  multiline={false}
                  label={`収益モデル ${i + 1} の名称を編集`}
                  textClassName="text-sm font-bold text-ink"
                  onSave={(modelName) => patchComparison(i, { modelName })}
                />
                <EpistemicBadge
                  tag={comparison.epistemic}
                  onChange={(epistemic) => patchComparison(i, { epistemic })}
                />
              </div>
              <div className="space-y-3">
                {COMPARISON_FIELDS.map(({ key, title, label, tone }) => (
                  <div key={key} className={key === 'suitability' ? 'border-t border-zinc-100 pt-2' : undefined}>
                    <Field label={title} labelClassName={tone}>
                      <EditableText
                        value={comparison[key]}
                        label={label}
                        textClassName="text-xs leading-relaxed text-zinc-700"
                        onSave={(next) => patchComparison(i, { [key]: next })}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function BlockCard({
  index,
  block,
  onChange,
}: {
  index: number;
  block: BusinessModelBlock;
  onChange: (next: BusinessModelBlock) => void;
}) {
  const { label, items } = block;
  const setItems = (next: TaggedItem[]) => onChange({ ...block, items: next });

  return (
    <div className="space-y-3 px-6 py-5 sm:px-8">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
        <NumberedTitle index={index}>{label}</NumberedTitle>
        <Button
          variant="link"
          aria-label={`${label} に項目を追加`}
          onClick={() => setItems([...items, NEW_BLOCK_ITEM])}
        >
          <Plus className="size-3.5" aria-hidden />
          追加
        </Button>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <EpistemicBadge
                tag={item.epistemic}
                onChange={(epistemic) => setItems(updateAt(items, i, { epistemic }))}
              />
              {items.length > 1 && (
                <IconButton
                  tone="danger"
                  label={`${label} の項目 ${i + 1} を削除`}
                  onClick={() => setItems(removeAt(items, i))}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </IconButton>
              )}
            </div>
            <EditableText
              value={item.content}
              label={`${label} の項目 ${i + 1} を編集`}
              onSave={(content) => setItems(updateAt(items, i, { content }))}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
