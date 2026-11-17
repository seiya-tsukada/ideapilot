import type { DecisionReport, EpistemicTag } from '#shared/schema.ts';
import { EPISTEMIC_TAGS } from '#shared/schema.ts';
import type { ReportSectionKey } from './tabs/types.ts';

export const REPORT_TABS = [
  { id: 'executive-summary', section: 'executiveSummary', label: 'Executive Summary', hint: '経営サマリー' },
  { id: 'business-model', section: 'businessModel', label: 'Business Model', hint: '事業構造・収益比較' },
  { id: 'decision-brief', section: 'decisionBrief', label: 'Decision Brief', hint: 'GO/NO-GO 判断材料' },
  { id: 'business-proposal', section: 'businessProposal', label: 'Business Proposal', hint: '12章 事業提案書' },
  { id: 'mvp-specification', section: 'mvpSpecification', label: 'MVP Specification', hint: '3日MVP・開発指示' },
  { id: 'validation-plan', section: 'validationPlan', label: 'Validation Plan', hint: '検証計画・質問集' },
] as const satisfies readonly { id: string; section: ReportSectionKey; label: string; hint: string }[];

export type ReportTabId = (typeof REPORT_TABS)[number]['id'];

export const DEFAULT_TAB: ReportTabId = 'decision-brief';

/** Counts epistemic tags across every tagged item in the report. */
export function countEpistemicTags(report: DecisionReport): Record<EpistemicTag, number> {
  const counts = Object.fromEntries(EPISTEMIC_TAGS.map((t) => [t, 0])) as Record<EpistemicTag, number>;
  const add = (...items: { epistemic: EpistemicTag }[]) => {
    for (const { epistemic } of items) counts[epistemic]++;
  };

  const { executiveSummary: es, businessModel: bm, decisionBrief: db, mvpSpecification: mvp } = report;
  const { keyIssuesToResolve, ...esFields } = es;

  add(...Object.values(esFields), ...keyIssuesToResolve);
  add(...bm.blocks.flatMap((b) => b.items), ...bm.revenueModelComparisons);
  add(db.executiveDecision, ...db.opportunityAssessment, ...db.keyRisks, ...db.criticalAssumptions);
  add(...report.businessProposal.sections);
  add(mvp.productConcept, mvp.targetUsers, mvp.problemSolved);

  return counts;
}
