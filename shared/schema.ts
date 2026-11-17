import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const PURPOSES = ['Corporate', 'Startup'] as const;
export const EPISTEMIC_TAGS = ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'] as const;
export const VERDICTS = ['GO', 'CONDITIONAL GO', 'NO-GO'] as const;
export const PRIORITIES = ['P0', 'P1', 'P2'] as const;
export const RATINGS = ['高', '中', '低', '要調査'] as const;
export const CONFIDENCE_LEVELS = ['高', '中', '低'] as const;

export const VALIDATION_METHODS = [
  'ユーザーインタビュー',
  '画面プロトタイプテスト',
  'ランディングページテスト',
  'Wizard of Oz型の疑似サービス',
  '実際の業務でのPoC',
  '実サービスMVP',
] as const;

export const OPPORTUNITY_DIMENSIONS = [
  '顧客課題の強さ',
  '市場機会',
  '収益化の可能性',
  '競争優位性',
  '実行可能性',
] as const;

export const RISK_CATEGORIES = [
  '市場リスク',
  '顧客ニーズのリスク',
  '技術リスク',
  '収益性リスク',
  '競合リスク',
  '実行体制のリスク',
] as const;

export const BUSINESS_MODEL_BLOCK_KEYS = [
  'problem',
  'customerSegment',
  'valueProposition',
  'solution',
  'revenueModel',
  'costStructure',
  'distributionChannel',
  'competitiveAdvantage',
  'keyPartners',
  'keyResources',
] as const;

export const purposeSchema = z.enum(PURPOSES);
export const epistemicTagSchema = z.enum(EPISTEMIC_TAGS);
export const verdictSchema = z.enum(VERDICTS);
export const prioritySchema = z.enum(PRIORITIES);
export const ratingSchema = z.enum(RATINGS);
export const confidenceSchema = z.enum(CONFIDENCE_LEVELS);
export const validationMethodSchema = z.enum(VALIDATION_METHODS);

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

export const clarifyingQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  question: z.string(),
  placeholder: z.string(),
});

export const clarifyingAnswerSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const ideaConstraintsSchema = z.object({
  budget: z.string().optional(),
  timeline: z.string().optional(),
  team: z.string().optional(),
  other: z.string().optional(),
});

export const IDEA_MIN_LENGTH = 5;

export const ideaInputSchema = z.object({
  idea: z
    .string({ error: '事業アイデアを入力してください。' })
    .trim()
    .min(1, '事業アイデアを入力してください。')
    .min(IDEA_MIN_LENGTH, `アイデアの概要を${IDEA_MIN_LENGTH}文字以上で入力してください。`),
  purpose: z.enum(PURPOSES, {
    error: '利用目的（Corporate または Startup）を選択してください。',
  }),
  targetCustomer: z.string().optional(),
  problem: z.string().optional(),
  valueProposition: z.string().optional(),
  constraints: ideaConstraintsSchema.optional(),
  additionalContext: z.string().optional(),
  clarifyingAnswers: z.array(clarifyingAnswerSchema).optional(),
});

/* -------------------------------------------------------------------------- */
/* Generated report sections                                                  */
/* -------------------------------------------------------------------------- */

export const taggedItemSchema = z.object({
  content: z.string(),
  epistemic: epistemicTagSchema,
  sourceNote: z.string().optional(),
});

export const executiveSummarySchema = z.object({
  ideaOverview: taggedItemSchema,
  customerProblem: taggedItemSchema,
  targetCustomer: taggedItemSchema,
  valueProposition: taggedItemSchema,
  monetizationDirection: taggedItemSchema,
  competitiveAdvantageHypothesis: taggedItemSchema,
  keyIssuesToResolve: z.array(taggedItemSchema),
});

export const businessModelBlockSchema = z.object({
  key: z.enum(BUSINESS_MODEL_BLOCK_KEYS),
  label: z.string(),
  items: z.array(taggedItemSchema),
});

export const revenueModelComparisonSchema = z.object({
  modelName: z.string(),
  pricingMechanism: z.string(),
  pros: z.string(),
  cons: z.string(),
  suitability: z.string(),
  epistemic: epistemicTagSchema,
});

export const businessModelSchema = z.object({
  blocks: z.array(businessModelBlockSchema),
  revenueModelComparisons: z.array(revenueModelComparisonSchema),
});

export const opportunityDimensionSchema = z.object({
  dimension: z.enum(OPPORTUNITY_DIMENSIONS),
  rating: ratingSchema,
  rationale: z.string(),
  evidence: z.string(),
  missingInfo: z.string(),
  confidence: confidenceSchema,
  epistemic: epistemicTagSchema,
});

export const keyRiskSchema = z.object({
  category: z.enum(RISK_CATEGORIES),
  risk: z.string(),
  severity: confidenceSchema,
  mitigation: z.string(),
  epistemic: epistemicTagSchema,
});

export const criticalAssumptionSchema = z.object({
  assumption: z.string(),
  whyImportant: z.string(),
  currentEvidence: z.string(),
  validationMethod: z.string(),
  priority: prioritySchema,
  epistemic: epistemicTagSchema,
});

export const nextActionSchema = z.object({
  action: z.string(),
  purpose: z.string(),
  executionSteps: z.string(),
  requiredDeliverable: z.string(),
  successCriteria: z.string(),
});

export const decisionBriefSchema = z.object({
  executiveDecision: z.object({
    verdict: verdictSchema,
    rationale: z.string(),
    keyUncertainties: z.array(z.string()),
    conditionsToProceed: z.array(z.string()),
    epistemic: epistemicTagSchema,
  }),
  opportunityAssessment: z.array(opportunityDimensionSchema),
  keyRisks: z.array(keyRiskSchema),
  criticalAssumptions: z.array(criticalAssumptionSchema),
  nextActions: z.array(nextActionSchema),
});

export const proposalSectionSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  content: z.string(),
  epistemic: epistemicTagSchema,
  unknownsOrAssumptions: z.array(z.string()),
});

export const businessProposalSchema = z.object({
  purpose: purposeSchema,
  sections: z.array(proposalSectionSchema),
});

export const userStorySchema = z.object({
  role: z.string(),
  goal: z.string(),
  benefit: z.string(),
  priority: prioritySchema,
});

export const useCaseSchema = z.object({
  title: z.string(),
  flow: z.string(),
  priority: prioritySchema,
});

export const mvpFeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  priority: prioritySchema,
  threeDayFeasible: z.boolean(),
});

export const mvpScreenSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  primaryElements: z.string(),
});

export const dataEntitySchema = z.object({
  entity: z.string(),
  fields: z.string(),
  notes: z.string(),
});

export const mvpSpecificationSchema = z.object({
  productConcept: taggedItemSchema,
  targetUsers: taggedItemSchema,
  problemSolved: taggedItemSchema,
  userStories: z.array(userStorySchema),
  keyUseCases: z.array(useCaseSchema),
  essentialFeatures: z.array(mvpFeatureSchema),
  screens: z.array(mvpScreenSchema),
  screenTransitions: z.array(z.string()),
  dataStructureOverview: z.array(dataEntitySchema),
  mvpScope: z.array(z.string()),
  outOfScope: z.array(z.string()),
  futureExtensions: z.array(z.string()),
  /** Prompt that can be pasted into an AI app builder to scaffold the MVP. */
  buildPrompt: z.string(),
});

export const validationKpiSchema = z.object({
  metric: z.string(),
  target: z.string(),
  measurementNote: z.string(),
});

export const interviewQuestionSchema = z.object({
  topic: z.string(),
  question: z.string(),
  intent: z.string(),
});

export const validationPlanSchema = z.object({
  hypothesesToValidate: z.array(z.string()),
  targetValidationUsers: z.string(),
  recommendedMethod: validationMethodSchema,
  methodRationale: z.string(),
  validationScenario: z.string(),
  kpis: z.array(validationKpiSchema),
  successCriteria: z.string(),
  failureCriteria: z.string(),
  requiredImplementationScope: z.string(),
  postValidationDecision: z.string(),
  interviewGuide: z.object({
    objective: z.string(),
    screeningCriteria: z.string(),
    questions: z.array(interviewQuestionSchema),
    cautionNotes: z.string(),
  }),
});

export const decisionReportSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isSample: z.boolean().optional(),
  input: ideaInputSchema,
  ideaName: z.string(),
  overallSummary: z.string(),
  executiveSummary: executiveSummarySchema,
  businessModel: businessModelSchema,
  decisionBrief: decisionBriefSchema,
  businessProposal: businessProposalSchema,
  mvpSpecification: mvpSpecificationSchema,
  validationPlan: validationPlanSchema,
});

/* -------------------------------------------------------------------------- */
/* Inferred types                                                             */
/* -------------------------------------------------------------------------- */

export type PurposeType = z.infer<typeof purposeSchema>;
export type EpistemicTag = z.infer<typeof epistemicTagSchema>;
export type DecisionVerdict = z.infer<typeof verdictSchema>;
export type PriorityLevel = z.infer<typeof prioritySchema>;
export type RatingLevel = z.infer<typeof ratingSchema>;
export type ConfidenceLevel = z.infer<typeof confidenceSchema>;
export type ValidationMethod = z.infer<typeof validationMethodSchema>;

export type ClarifyingQuestion = z.infer<typeof clarifyingQuestionSchema>;
export type ClarifyingAnswer = z.infer<typeof clarifyingAnswerSchema>;
export type IdeaConstraints = z.infer<typeof ideaConstraintsSchema>;
export type IdeaInput = z.infer<typeof ideaInputSchema>;

export type TaggedItem = z.infer<typeof taggedItemSchema>;
export type ExecutiveSummary = z.infer<typeof executiveSummarySchema>;
export type BusinessModelBlock = z.infer<typeof businessModelBlockSchema>;
export type RevenueModelComparison = z.infer<typeof revenueModelComparisonSchema>;
export type BusinessModel = z.infer<typeof businessModelSchema>;
export type OpportunityDimension = z.infer<typeof opportunityDimensionSchema>;
export type KeyRiskItem = z.infer<typeof keyRiskSchema>;
export type CriticalAssumption = z.infer<typeof criticalAssumptionSchema>;
export type NextActionItem = z.infer<typeof nextActionSchema>;
export type DecisionBrief = z.infer<typeof decisionBriefSchema>;
export type ProposalSection = z.infer<typeof proposalSectionSchema>;
export type BusinessProposal = z.infer<typeof businessProposalSchema>;
export type UserStoryItem = z.infer<typeof userStorySchema>;
export type UseCaseItem = z.infer<typeof useCaseSchema>;
export type MvpFeatureItem = z.infer<typeof mvpFeatureSchema>;
export type MvpScreenItem = z.infer<typeof mvpScreenSchema>;
export type DataEntityItem = z.infer<typeof dataEntitySchema>;
export type MvpSpecification = z.infer<typeof mvpSpecificationSchema>;
export type ValidationKpi = z.infer<typeof validationKpiSchema>;
export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;
export type ValidationPlan = z.infer<typeof validationPlanSchema>;
export type DecisionReport = z.infer<typeof decisionReportSchema>;
