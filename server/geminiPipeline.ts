import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type {
  BusinessModel,
  BusinessProposal,
  ClarifyingQuestion,
  DecisionBrief,
  DecisionReport,
  ExecutiveSummary,
  IdeaInput,
  MvpSpecification,
  ValidationPlan,
} from '../src/types/decision.ts';

const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY が設定されていません。Settings > Secrets パネルで API キーを設定するか、サンプルデータ機能をお試しください。',
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const EPISTEMIC_SYSTEM_RULES = `あなたはシニアプロダクトマネージャー兼新規事業開発責任者（Decision Firstの原則に基づく事業評価者）です。
出力はすべて自然な日本語で記述してください（英語のセクション名やタグ名は指定に従う）。

【絶対厳守ルール（情報の信頼性・ハルシネーション防止）】
1. ユーザーの入力を起点とし、入力されていない情報を事実として扱わない。
2. すべての主張・項目には正確に次の4区分（epistemic）のいずれかを付与する：
   - "FACT": ユーザーが明示的に入力・提供した事実のみ。
   - "HYPOTHESIS": 顧客ニーズ・価値・競争優位性など、今後検証が必要な仮説。
   - "ESTIMATE": 事業構造やコスト・課金方式などの合理的な推定。
   - "UNKNOWN": 市場規模(TAM/SAM)、競合シェア、顧客予算、規制など外部一次情報が不足し「要調査」である事項。
3. 不明な市場規模（例：「市場規模は500億円」など）や架空の競合調査結果を絶対に捏造しないこと。情報が不足する場合は「要調査」「未確認」と明記すること。
4. 情報が不足している場合、Decision Brief の暫定判断は原則 "CONDITIONAL GO"（条件付き進行）を優先し、進むために必要な検証条件を明確にすること。
5. すべての成果物は経営陣・投資家・現場チームが「次に何をすべきか」を判断できる実務レベルの具体性を持たせること。`;

function formatUserInputContext(input: IdeaInput): string {
  const lines = [
    `【利用目的】${input.purpose}`,
    `【事業アイデア（必須入力）】${input.idea}`,
    `【想定顧客（任意入力）】${input.targetCustomer?.trim() || '（未入力 — UNKNOWN / 要具体化）'}`,
    `【解決したい課題（任意入力）】${input.problem?.trim() || '（未入力 — 要仮説設定）'}`,
    `【提供したい価値（任意入力）】${input.valueProposition?.trim() || '（未入力 — 要仮説設定）'}`,
    `【事業上の制約（任意入力）】`,
    `  - 予算: ${input.constraints?.budget?.trim() || '未入力'}`,
    `  - 期間: ${input.constraints?.timeline?.trim() || '未入力'}`,
    `  - チーム: ${input.constraints?.team?.trim() || '未入力'}`,
    `  - その他: ${input.constraints?.other?.trim() || '未入力'}`,
    `【補足情報（任意入力）】${input.additionalContext?.trim() || '未入力'}`,
  ];

  if (input.clarifyingAnswers && input.clarifyingAnswers.length > 0) {
    lines.push('【追加質問へのユーザー回答】');
    for (const qa of input.clarifyingAnswers) {
      if (qa.answer.trim()) {
        lines.push(`  - Q: ${qa.question}\n    A: ${qa.answer}`);
      }
    }
  }

  return lines.join('\n');
}

function formatGeminiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return '現在AIモデルへのアクセスが一時的に集中しています（503 UNAVAILABLE）。少し時間をおいて「再実行する」を押すか、サンプルデータで画面をご確認ください。';
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return 'AI APIの利用回数上限に達しました（429 RESOURCE_EXHAUSTED）。しばらく待ってから再実行してください。';
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
    return 'Gemini APIキーが無効または権限不足です。Settings > Secrets パネルでAPIキーをご確認ください。';
  }
  return raw;
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand') ||
        msg.includes('429') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ETIMEDOUT');
      if (!isTransient || attempt === maxAttempts) {
        throw new Error(formatGeminiError(err));
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw new Error(formatGeminiError(lastError));
}

function parseJsonSafe<T>(rawText: string | undefined, stageName: string): T {
  const cleaned = (rawText ?? '').trim();
  if (!cleaned) {
    throw new Error(`${stageName} の生成結果が空でした。再度お試しください。`);
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `${stageName} の構造化JSON解析に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

const taggedItemSchema = {
  type: Type.OBJECT,
  properties: {
    content: { type: Type.STRING },
    epistemic: { type: Type.STRING, enum: ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'] },
    sourceNote: { type: Type.STRING },
  },
  required: ['content', 'epistemic'],
};

export async function generateClarifyingQuestions(
  input: IdeaInput,
): Promise<{ needsClarification: boolean; questions: ClarifyingQuestion[] }> {
  const ai = getAiClient();
  const context = formatUserInputContext(input);

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL_NAME,
      contents: `以下の新規事業アイデア入力を確認し、事業構想と意思決定資料の精度を高めるために「最も重要な不足情報」を補う追加質問を最大3つまで提案してください。
既に入力に十分な情報（想定顧客・課題・制約等）が揃っている場合は、questions を空配列にして needsClarification: false を返してください。
質問はユーザーがそのままスキップしても構わない軽量な確認にしてください。

${context}`,
      config: {
        systemInstruction: EPISTEMIC_SYSTEM_RULES,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            needsClarification: { type: Type.BOOLEAN },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  question: { type: Type.STRING },
                  placeholder: { type: Type.STRING },
                },
                required: ['id', 'label', 'question', 'placeholder'],
              },
            },
          },
          required: ['needsClarification', 'questions'],
        },
      },
    }),
  );

  const parsed = parseJsonSafe<{
    needsClarification: boolean;
    questions: ClarifyingQuestion[];
  }>(response.text, '追加質問の生成');

  return {
    needsClarification: Boolean(parsed.needsClarification && parsed.questions.length > 0),
    questions: (parsed.questions ?? []).slice(0, 3),
  };
}

export async function runDecisionAnalysisPipeline(
  input: IdeaInput,
  onProgress: (step: number, status: 'in_progress' | 'completed', message: string) => void,
): Promise<DecisionReport> {
  const ai = getAiClient();
  const inputContext = formatUserInputContext(input);

  // Step 1: アイデアの理解 (FACT/UNKNOWN normalization + Idea Name + Overall Summary)
  onProgress(1, 'in_progress', '入力情報からFACTと未確認論点を抽出しています...');
  const understandingRes = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL_NAME,
      contents: `以下の入力を読み解き、事業アイデア名、全体要約（意思決定の結論と主要論点を含む2〜3文）、確認済み事実(FACT)、不足している重要情報を整理してください。

${inputContext}`,
      config: {
        systemInstruction: EPISTEMIC_SYSTEM_RULES,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideaName: { type: Type.STRING },
            overallSummary: { type: Type.STRING },
            confirmedFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['ideaName', 'overallSummary', 'confirmedFacts', 'missingInformation'],
        },
      },
    }),
  );

  const understanding = parseJsonSafe<{
    ideaName: string;
    overallSummary: string;
    confirmedFacts: string[];
    missingInformation: string[];
  }>(understandingRes.text, 'アイデアの理解');
  onProgress(1, 'completed', 'アイデアの構造化が完了しました');

  const sharedContext = `${inputContext}

【Step 1 抽出結果】
事業名案: ${understanding.ideaName}
確認済み事実(FACT): ${understanding.confirmedFacts.join(' / ')}
未確認情報(UNKNOWN): ${understanding.missingInformation.join(' / ')}`;

  // Steps 2, 3, 4: Executive Summary & Business Model in parallel
  onProgress(2, 'in_progress', '顧客課題とビジネスモデル構造を並行分析しています...');
  const [execSummaryRes, bmRes] = await Promise.all([
    withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: `以下のコンテキストに基づき、経営者が短時間で理解できる「Executive Summary」を生成してください。
各項目について、入力に書かれている事実のみをFACTとし、推論はHYPOTHESIS/ESTIMATE、不足情報はUNKNOWNとタグ付けしてください。
keyIssuesToResolve には事業化に向けた重要な論点を3〜5点挙げてください。

${sharedContext}`,
        config: {
          systemInstruction: EPISTEMIC_SYSTEM_RULES,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ideaOverview: taggedItemSchema,
              customerProblem: taggedItemSchema,
              targetCustomer: taggedItemSchema,
              valueProposition: taggedItemSchema,
              monetizationDirection: taggedItemSchema,
              competitiveAdvantageHypothesis: taggedItemSchema,
              keyIssuesToResolve: {
                type: Type.ARRAY,
                items: taggedItemSchema,
              },
            },
            required: [
              'ideaOverview',
              'customerProblem',
              'targetCustomer',
              'valueProposition',
              'monetizationDirection',
              'competitiveAdvantageHypothesis',
              'keyIssuesToResolve',
            ],
          },
        },
      }),
    ),
    withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: `以下のコンテキストに基づき、「Business Model（10要素）」と「収益化モデル比較（2〜3案）」を生成してください。
blocks配列には必ず次の10個のkeyをこの順序で含めてください：
1. problem (label: "Problem（顧客課題）")
2. customerSegment (label: "Customer Segment（顧客セグメント）")
3. valueProposition (label: "Value Proposition（提供価値）")
4. solution (label: "Solution（ソリューション）")
5. revenueModel (label: "Revenue Model（収益モデル）")
6. costStructure (label: "Cost Structure（コスト構造）")
7. distributionChannel (label: "Distribution Channel（チャネル）")
8. competitiveAdvantage (label: "Competitive Advantage（競争優位性）")
9. keyPartners (label: "Key Partners（主要パートナー）")
10. keyResources (label: "Key Resources（主要リソース）")

${sharedContext}`,
        config: {
          systemInstruction: EPISTEMIC_SYSTEM_RULES,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              blocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: {
                      type: Type.STRING,
                      enum: [
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
                      ],
                    },
                    label: { type: Type.STRING },
                    items: { type: Type.ARRAY, items: taggedItemSchema },
                  },
                  required: ['key', 'label', 'items'],
                },
              },
              revenueModelComparisons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    modelName: { type: Type.STRING },
                    pricingMechanism: { type: Type.STRING },
                    pros: { type: Type.STRING },
                    cons: { type: Type.STRING },
                    suitability: { type: Type.STRING },
                    epistemic: {
                      type: Type.STRING,
                      enum: ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'],
                    },
                  },
                  required: [
                    'modelName',
                    'pricingMechanism',
                    'pros',
                    'cons',
                    'suitability',
                    'epistemic',
                  ],
                },
              },
            },
            required: ['blocks', 'revenueModelComparisons'],
          },
        },
      }),
    ),
  ]);

  const executiveSummary = parseJsonSafe<ExecutiveSummary>(
    execSummaryRes.text,
    'Executive Summary',
  );
  onProgress(2, 'completed', '顧客課題の分析が完了しました');
  onProgress(3, 'in_progress', '事業仮説と提供価値の構造を確定しています...');
  onProgress(3, 'completed', '事業仮説の構築が完了しました');

  const businessModel = parseJsonSafe<BusinessModel>(bmRes.text, 'Business Model');
  onProgress(4, 'completed', 'ビジネスモデルの整理が完了しました');

  // Step 5: 意思決定論点の抽出 (Decision Brief)
  onProgress(5, 'in_progress', 'Decision Brief（判断区分・リスク・重要仮説・次アクション）を抽出しています...');
  const dbRes = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL_NAME,
      contents: `このアプリケーションで最も重要な成果物「Decision Brief」を生成してください。
- executiveDecision: GO / CONDITIONAL GO / NO-GO（情報不足時は CONDITIONAL GO を優先）、判断理由、主な不確実性、進行条件を明記。
- opportunityAssessment: 必ず次の5項目すべてを評価すること：「顧客課題の強さ」「市場機会」「収益化の可能性」「競争優位性」「実行可能性」。根拠のない点数や架空の市場規模は絶対に出さないこと。
- keyRisks: 必ず次の6カテゴリすべてを抽出すること：「市場リスク」「顧客ニーズのリスク」「技術リスク」「収益性リスク」「競合リスク」「実行体制のリスク」。
- criticalAssumptions: 事業成立に必要な重要仮説を3〜5個抽出し、優先度(P0/P1/P2)と検証方法を明記。
- nextActions: 次に実施すべき具体的なアクションをちょうど3つ提案すること。

${sharedContext}`,
      config: {
        systemInstruction: EPISTEMIC_SYSTEM_RULES,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveDecision: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, enum: ['GO', 'CONDITIONAL GO', 'NO-GO'] },
              rationale: { type: Type.STRING },
              keyUncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
              conditionsToProceed: { type: Type.ARRAY, items: { type: Type.STRING } },
              epistemic: {
                type: Type.STRING,
                enum: ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'],
              },
            },
            required: [
              'verdict',
              'rationale',
              'keyUncertainties',
              'conditionsToProceed',
              'epistemic',
            ],
          },
          opportunityAssessment: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dimension: {
                  type: Type.STRING,
                  enum: [
                    '顧客課題の強さ',
                    '市場機会',
                    '収益化の可能性',
                    '競争優位性',
                    '実行可能性',
                  ],
                },
                rating: { type: Type.STRING, enum: ['高', '中', '低', '要調査'] },
                rationale: { type: Type.STRING },
                evidence: { type: Type.STRING },
                missingInfo: { type: Type.STRING },
                confidence: { type: Type.STRING, enum: ['高', '中', '低'] },
                epistemic: {
                  type: Type.STRING,
                  enum: ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'],
                },
              },
              required: [
                'dimension',
                'rating',
                'rationale',
                'evidence',
                'missingInfo',
                'confidence',
                'epistemic',
              ],
            },
          },
          keyRisks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  enum: [
                    '市場リスク',
                    '顧客ニーズのリスク',
                    '技術リスク',
                    '収益性リスク',
                    '競合リスク',
                    '実行体制のリスク',
                  ],
                },
                risk: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['高', '中', '低'] },
                mitigation: { type: Type.STRING },
                epistemic: {
                  type: Type.STRING,
                  enum: ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'],
                },
              },
              required: ['category', 'risk', 'severity', 'mitigation', 'epistemic'],
            },
          },
          criticalAssumptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                assumption: { type: Type.STRING },
                whyImportant: { type: Type.STRING },
                currentEvidence: { type: Type.STRING },
                validationMethod: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['P0', 'P1', 'P2'] },
                epistemic: {
                  type: Type.STRING,
                  enum: ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'],
                },
              },
              required: [
                'assumption',
                'whyImportant',
                'currentEvidence',
                'validationMethod',
                'priority',
                'epistemic',
              ],
            },
          },
          nextActions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING },
                purpose: { type: Type.STRING },
                executionSteps: { type: Type.STRING },
                requiredDeliverable: { type: Type.STRING },
                successCriteria: { type: Type.STRING },
              },
              required: [
                'action',
                'purpose',
                'executionSteps',
                'requiredDeliverable',
                'successCriteria',
              ],
            },
          },
        },
        required: [
          'executiveDecision',
          'opportunityAssessment',
          'keyRisks',
          'criticalAssumptions',
          'nextActions',
        ],
      },
    },
  }));
  const decisionBrief = parseJsonSafe<DecisionBrief>(dbRes.text, 'Decision Brief');
  onProgress(5, 'completed', '意思決定論点の抽出が完了しました');

  // Step 6: 成果物の生成 (Business Proposal + MVP Specification + Validation Plan in parallel)
  onProgress(
    6,
    'in_progress',
    '事業提案書・MVP仕様書・AI Studio開発プロンプト・検証計画を生成しています...',
  );

  const proposalSectionTitles =
    input.purpose === 'Corporate'
      ? [
          '1. 背景',
          '2. 解決すべき課題',
          '3. 事業機会',
          '4. 提案するソリューション',
          '5. ターゲット顧客',
          '6. ビジネスモデル',
          '7. 既存事業とのシナジー',
          '8. 競争優位性',
          '9. 必要な投資・リソース',
          '10. リスク',
          '11. PoC計画',
          '12. 意思決定してほしい事項',
        ]
      : [
          '1. Problem',
          '2. Solution',
          '3. Target Market',
          '4. Product',
          '5. Business Model',
          '6. Market Opportunity',
          '7. Competitive Landscape',
          '8. Go-to-Market Strategy',
          '9. Revenue Model',
          '10. Roadmap',
          '11. Key Risks',
          '12. Investment Thesis',
        ];

  const [proposalRes, mvpRes, validationRes] = await Promise.all([
    withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: `利用目的「${input.purpose}」に合わせて、経営陣・投資家・社内関係者にそのまま説明できる事業提案書（全12セクション）を生成してください。
必ず以下の12セクション構成（number: 1〜12, title は番号を除いたタイトル）を正確に出力してください：
${proposalSectionTitles.join('\n')}
数字や市場規模が不足する場合は、勝手に推計値を確定せず、unknownsOrAssumptions に「仮定・要調査事項」として明示してください。

${sharedContext}`,
        config: {
          systemInstruction: EPISTEMIC_SYSTEM_RULES,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              purpose: { type: Type.STRING, enum: ['Corporate', 'Startup'] },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    epistemic: {
                      type: Type.STRING,
                      enum: ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'],
                    },
                    unknownsOrAssumptions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['number', 'title', 'content', 'epistemic', 'unknownsOrAssumptions'],
                },
              },
            },
            required: ['purpose', 'sections'],
          },
        },
      }),
    ),

    withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: `「最短3日で操作可能なプロトタイプを作る」前提で、MVP Specification と Google AI Studio Buildモードに直接投入できる詳細なアプリ開発用プロンプト（aiStudioBuildPrompt）を生成してください。
- essentialFeatures / userStories / keyUseCases には P0 / P1 / P2 の優先順位を付けること。
- aiStudioBuildPrompt には必ず以下の全項目を日本語で詳細に含めること：
  1. プロダクト概要 2. 技術要件 3. UI要件 4. 画面構成 5. 各機能の仕様 6. ユーザーフロー 7. データ構造 8. サンプルデータ 9. エラー処理 10. 実装優先順位 11. 完了条件

${sharedContext}`,
        config: {
          systemInstruction: EPISTEMIC_SYSTEM_RULES,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productConcept: taggedItemSchema,
            targetUsers: taggedItemSchema,
            problemSolved: taggedItemSchema,
            userStories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  goal: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['P0', 'P1', 'P2'] },
                },
                required: ['role', 'goal', 'benefit', 'priority'],
              },
            },
            keyUseCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  flow: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['P0', 'P1', 'P2'] },
                },
                required: ['title', 'flow', 'priority'],
              },
            },
            essentialFeatures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['P0', 'P1', 'P2'] },
                  threeDayFeasible: { type: Type.BOOLEAN },
                },
                required: ['name', 'description', 'priority', 'threeDayFeasible'],
              },
            },
            screens: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  primaryElements: { type: Type.STRING },
                },
                required: ['name', 'purpose', 'primaryElements'],
              },
            },
            screenTransitions: { type: Type.ARRAY, items: { type: Type.STRING } },
            dataStructureOverview: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  entity: { type: Type.STRING },
                  fields: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ['entity', 'fields', 'notes'],
              },
            },
            mvpScope: { type: Type.ARRAY, items: { type: Type.STRING } },
            outOfScope: { type: Type.ARRAY, items: { type: Type.STRING } },
            futureExtensions: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiStudioBuildPrompt: { type: Type.STRING },
          },
          required: [
            'productConcept',
            'targetUsers',
            'problemSolved',
            'userStories',
            'keyUseCases',
            'essentialFeatures',
            'screens',
            'screenTransitions',
            'dataStructureOverview',
            'mvpScope',
            'outOfScope',
            'futureExtensions',
            'aiStudioBuildPrompt',
          ],
        },
      },
    })),

    withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: `以下の事業構想を検証するための「Validation Plan」および「Interview Guide」を生成してください。
- recommendedMethod は必ず次の6つから最も適切な1つを選択すること：
  「ユーザーインタビュー」「画面プロトタイプテスト」「ランディングページテスト」「Wizard of Oz型の疑似サービス」「実際の業務でのPoC」「実サービスMVP」
- プロトタイプへの好意的なコメントだけで事業性を証明したと誤認しないよう、厳格な失敗基準と検証後の意思決定分岐を設計すること。

${sharedContext}`,
        config: {
          systemInstruction: EPISTEMIC_SYSTEM_RULES,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hypothesesToValidate: { type: Type.ARRAY, items: { type: Type.STRING } },
            targetValidationUsers: { type: Type.STRING },
            recommendedMethod: {
              type: Type.STRING,
              enum: [
                'ユーザーインタビュー',
                '画面プロトタイプテスト',
                'ランディングページテスト',
                'Wizard of Oz型の疑似サービス',
                '実際の業務でのPoC',
                '実サービスMVP',
              ],
            },
            methodRationale: { type: Type.STRING },
            validationScenario: { type: Type.STRING },
            kpis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  target: { type: Type.STRING },
                  measurementNote: { type: Type.STRING },
                },
                required: ['metric', 'target', 'measurementNote'],
              },
            },
            successCriteria: { type: Type.STRING },
            failureCriteria: { type: Type.STRING },
            requiredImplementationScope: { type: Type.STRING },
            postValidationDecision: { type: Type.STRING },
            interviewGuide: {
              type: Type.OBJECT,
              properties: {
                objective: { type: Type.STRING },
                screeningCriteria: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      question: { type: Type.STRING },
                      intent: { type: Type.STRING },
                    },
                    required: ['topic', 'question', 'intent'],
                  },
                },
                cautionNotes: { type: Type.STRING },
              },
              required: ['objective', 'screeningCriteria', 'questions', 'cautionNotes'],
            },
          },
          required: [
            'hypothesesToValidate',
            'targetValidationUsers',
            'recommendedMethod',
            'methodRationale',
            'validationScenario',
            'kpis',
            'successCriteria',
            'failureCriteria',
            'requiredImplementationScope',
            'postValidationDecision',
            'interviewGuide',
          ],
        },
      },
    })),
  ]);

  const businessProposal = parseJsonSafe<BusinessProposal>(proposalRes.text, 'Business Proposal');
  const mvpSpecification = parseJsonSafe<MvpSpecification>(mvpRes.text, 'MVP Specification');
  const validationPlan = parseJsonSafe<ValidationPlan>(validationRes.text, 'Validation Plan');

  onProgress(6, 'completed', 'すべての成果物の生成が完了しました');

  const nowIso = new Date().toISOString();
  return {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: nowIso,
    updatedAt: nowIso,
    isSample: false,
    input,
    ideaName: understanding.ideaName,
    overallSummary: understanding.overallSummary,
    executiveSummary,
    businessModel,
    decisionBrief,
    businessProposal,
    mvpSpecification,
    validationPlan,
  };
}
