import type { DecisionReport } from '#shared/schema.ts';

export type ReportSectionKey =
  | 'executiveSummary'
  | 'businessModel'
  | 'decisionBrief'
  | 'businessProposal'
  | 'mvpSpecification'
  | 'validationPlan';

/** Common props for every report tab: the full report plus a setter for its own section. */
export interface TabProps<K extends ReportSectionKey> {
  report: DecisionReport;
  onChange: (next: DecisionReport[K]) => void;
}
