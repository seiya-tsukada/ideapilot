export type PurposeType = 'Corporate' | 'Startup';

export type EpistemicTag = 'FACT' | 'HYPOTHESIS' | 'ESTIMATE' | 'UNKNOWN';

export type DecisionVerdict = 'GO' | 'CONDITIONAL GO' | 'NO-GO';

export type PriorityLevel = 'P0' | 'P1' | 'P2';

export type RatingLevel = '高' | '中' | '低' | '要調査';

export type ConfidenceLevel = '高' | '中' | '低';

export type ValidationMethod =
  | 'ユーザーインタビュー'
  | '画面プロトタイプテスト'
  | 'ランディングページテスト'
  | 'Wizard of Oz型の疑似サービス'
  | '実際の業務でのPoC'
  | '実サービスMVP';

export type ReportTabId =
  | 'executive-summary'
  | 'business-model'
  | 'decision-brief'
  | 'business-proposal'
  | 'mvp-specification'
  | 'validation-plan';

export type ScreenView = 'input' | 'analyzing' | 'report' | 'export';

export interface IdeaConstraints {
  budget?: string;
  timeline?: string;
  team?: string;
  other?: string;
}

export interface ClarifyingAnswer {
  id: string;
  question: string;
  answer: string;
}

export interface ClarifyingQuestion {
  id: string;
  label: string;
  question: string;
  placeholder: string;
}

export interface IdeaInput {
  idea: string;
  purpose: PurposeType;
  targetCustomer?: string;
  problem?: string;
  valueProposition?: string;
  constraints?: IdeaConstraints;
  additionalContext?: string;
  clarifyingAnswers?: ClarifyingAnswer[];
}

export interface TaggedItem {
  content: string;
  epistemic: EpistemicTag;
  sourceNote?: string;
}

export interface ExecutiveSummary {
  ideaOverview: TaggedItem;
  customerProblem: TaggedItem;
  targetCustomer: TaggedItem;
  valueProposition: TaggedItem;
  monetizationDirection: TaggedItem;
  competitiveAdvantageHypothesis: TaggedItem;
  keyIssuesToResolve: TaggedItem[];
}

export interface BusinessModelBlock {
  key:
    | 'problem'
    | 'customerSegment'
    | 'valueProposition'
    | 'solution'
    | 'revenueModel'
    | 'costStructure'
    | 'distributionChannel'
    | 'competitiveAdvantage'
    | 'keyPartners'
    | 'keyResources';
  label: string;
  items: TaggedItem[];
}

export interface RevenueModelComparison {
  modelName: string;
  pricingMechanism: string;
  pros: string;
  cons: string;
  suitability: string;
  epistemic: EpistemicTag;
}

export interface BusinessModel {
  blocks: BusinessModelBlock[];
  revenueModelComparisons: RevenueModelComparison[];
}

export interface OpportunityDimension {
  dimension:
    | '顧客課題の強さ'
    | '市場機会'
    | '収益化の可能性'
    | '競争優位性'
    | '実行可能性';
  rating: RatingLevel;
  rationale: string;
  evidence: string;
  missingInfo: string;
  confidence: ConfidenceLevel;
  epistemic: EpistemicTag;
}

export interface KeyRiskItem {
  category:
    | '市場リスク'
    | '顧客ニーズのリスク'
    | '技術リスク'
    | '収益性リスク'
    | '競合リスク'
    | '実行体制のリスク';
  risk: string;
  severity: ConfidenceLevel;
  mitigation: string;
  epistemic: EpistemicTag;
}

export interface CriticalAssumption {
  assumption: string;
  whyImportant: string;
  currentEvidence: string;
  validationMethod: string;
  priority: PriorityLevel;
  epistemic: EpistemicTag;
}

export interface NextActionItem {
  action: string;
  purpose: string;
  executionSteps: string;
  requiredDeliverable: string;
  successCriteria: string;
}

export interface DecisionBrief {
  executiveDecision: {
    verdict: DecisionVerdict;
    rationale: string;
    keyUncertainties: string[];
    conditionsToProceed: string[];
    epistemic: EpistemicTag;
  };
  opportunityAssessment: OpportunityDimension[];
  keyRisks: KeyRiskItem[];
  criticalAssumptions: CriticalAssumption[];
  nextActions: NextActionItem[];
}

export interface ProposalSection {
  number: number;
  title: string;
  content: string;
  epistemic: EpistemicTag;
  unknownsOrAssumptions: string[];
}

export interface BusinessProposal {
  purpose: PurposeType;
  sections: ProposalSection[];
}

export interface UserStoryItem {
  role: string;
  goal: string;
  benefit: string;
  priority: PriorityLevel;
}

export interface UseCaseItem {
  title: string;
  flow: string;
  priority: PriorityLevel;
}

export interface MvpFeatureItem {
  name: string;
  description: string;
  priority: PriorityLevel;
  threeDayFeasible: boolean;
}

export interface MvpScreenItem {
  name: string;
  purpose: string;
  primaryElements: string;
}

export interface DataEntityItem {
  entity: string;
  fields: string;
  notes: string;
}

export interface MvpSpecification {
  productConcept: TaggedItem;
  targetUsers: TaggedItem;
  problemSolved: TaggedItem;
  userStories: UserStoryItem[];
  keyUseCases: UseCaseItem[];
  essentialFeatures: MvpFeatureItem[];
  screens: MvpScreenItem[];
  screenTransitions: string[];
  dataStructureOverview: DataEntityItem[];
  mvpScope: string[];
  outOfScope: string[];
  futureExtensions: string[];
  aiStudioBuildPrompt: string;
}

export interface ValidationKpi {
  metric: string;
  target: string;
  measurementNote: string;
}

export interface InterviewQuestion {
  topic: string;
  question: string;
  intent: string;
}

export interface ValidationPlan {
  hypothesesToValidate: string[];
  targetValidationUsers: string;
  recommendedMethod: ValidationMethod;
  methodRationale: string;
  validationScenario: string;
  kpis: ValidationKpi[];
  successCriteria: string;
  failureCriteria: string;
  requiredImplementationScope: string;
  postValidationDecision: string;
  interviewGuide: {
    objective: string;
    screeningCriteria: string;
    questions: InterviewQuestion[];
    cautionNotes: string;
  };
}

export interface DecisionReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
  input: IdeaInput;
  ideaName: string;
  overallSummary: string;
  executiveSummary: ExecutiveSummary;
  businessModel: BusinessModel;
  decisionBrief: DecisionBrief;
  businessProposal: BusinessProposal;
  mvpSpecification: MvpSpecification;
  validationPlan: ValidationPlan;
}

export interface AnalysisStepState {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}
