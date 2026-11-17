import {
  OPPORTUNITY_DIMENSIONS,
  RISK_CATEGORIES,
  VALIDATION_METHODS,
  type IdeaInput,
  type PurposeType,
} from '#shared/schema.ts';

export const SYSTEM_INSTRUCTION = `あなたはシニアプロダクトマネージャー兼新規事業開発責任者（Decision Firstの原則に基づく事業評価者）です。
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

const orFallback = (value: string | undefined, fallback: string) => value?.trim() || fallback;

export function formatIdeaContext(input: IdeaInput): string {
  const { constraints } = input;
  const lines = [
    `【利用目的】${input.purpose}`,
    `【事業アイデア（必須入力）】${input.idea}`,
    `【想定顧客（任意入力）】${orFallback(input.targetCustomer, '（未入力 — UNKNOWN / 要具体化）')}`,
    `【解決したい課題（任意入力）】${orFallback(input.problem, '（未入力 — 要仮説設定）')}`,
    `【提供したい価値（任意入力）】${orFallback(input.valueProposition, '（未入力 — 要仮説設定）')}`,
    '【事業上の制約（任意入力）】',
    `  - 予算: ${orFallback(constraints?.budget, '未入力')}`,
    `  - 期間: ${orFallback(constraints?.timeline, '未入力')}`,
    `  - チーム: ${orFallback(constraints?.team, '未入力')}`,
    `  - その他: ${orFallback(constraints?.other, '未入力')}`,
    `【補足情報（任意入力）】${orFallback(input.additionalContext, '未入力')}`,
  ];

  const answered = input.clarifyingAnswers?.filter((qa) => qa.answer.trim()) ?? [];
  if (answered.length > 0) {
    lines.push('【追加質問へのユーザー回答】');
    for (const qa of answered) lines.push(`  - Q: ${qa.question}\n    A: ${qa.answer}`);
  }

  return lines.join('\n');
}

export interface Understanding {
  ideaName: string;
  confirmedFacts: string[];
  missingInformation: string[];
}

export function withUnderstanding(ideaContext: string, understanding: Understanding): string {
  return `${ideaContext}

【Step 1 抽出結果】
事業名案: ${understanding.ideaName}
確認済み事実(FACT): ${understanding.confirmedFacts.join(' / ')}
未確認情報(UNKNOWN): ${understanding.missingInformation.join(' / ')}`;
}

const quoteList = (items: readonly string[]) => items.map((item) => `「${item}」`).join('');

export const PROPOSAL_SECTIONS: Record<PurposeType, readonly string[]> = {
  Corporate: [
    '背景',
    '解決すべき課題',
    '事業機会',
    '提案するソリューション',
    'ターゲット顧客',
    'ビジネスモデル',
    '既存事業とのシナジー',
    '競争優位性',
    '必要な投資・リソース',
    'リスク',
    'PoC計画',
    '意思決定してほしい事項',
  ],
  Startup: [
    'Problem',
    'Solution',
    'Target Market',
    'Product',
    'Business Model',
    'Market Opportunity',
    'Competitive Landscape',
    'Go-to-Market Strategy',
    'Revenue Model',
    'Roadmap',
    'Key Risks',
    'Investment Thesis',
  ],
};

export const prompts = {
  clarify: (ctx: string) => `以下の新規事業アイデア入力を確認し、事業構想と意思決定資料の精度を高めるために「最も重要な不足情報」を補う追加質問を最大3つまで提案してください。
既に入力に十分な情報（想定顧客・課題・制約等）が揃っている場合は、questions を空配列にして needsClarification: false を返してください。
質問はユーザーがそのままスキップしても構わない軽量な確認にしてください。

${ctx}`,

  understanding: (ctx: string) => `以下の入力を読み解き、事業アイデア名、全体要約（意思決定の結論と主要論点を含む2〜3文）、確認済み事実(FACT)、不足している重要情報を整理してください。

${ctx}`,

  executiveSummary: (ctx: string) => `以下のコンテキストに基づき、経営者が短時間で理解できる「Executive Summary」を生成してください。
各項目について、入力に書かれている事実のみをFACTとし、推論はHYPOTHESIS/ESTIMATE、不足情報はUNKNOWNとタグ付けしてください。
keyIssuesToResolve には事業化に向けた重要な論点を3〜5点挙げてください。

${ctx}`,

  businessModel: (ctx: string) => `以下のコンテキストに基づき、「Business Model（10要素）」と「収益化モデル比較（2〜3案）」を生成してください。
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

${ctx}`,

  decisionBrief: (ctx: string) => `このアプリケーションで最も重要な成果物「Decision Brief」を生成してください。
- executiveDecision: GO / CONDITIONAL GO / NO-GO（情報不足時は CONDITIONAL GO を優先）、判断理由、主な不確実性、進行条件を明記。
- opportunityAssessment: 必ず次の5項目すべてを評価すること：${quoteList(OPPORTUNITY_DIMENSIONS)}。根拠のない点数や架空の市場規模は絶対に出さないこと。
- keyRisks: 必ず次の6カテゴリすべてを抽出すること：${quoteList(RISK_CATEGORIES)}。
- criticalAssumptions: 事業成立に必要な重要仮説を3〜5個抽出し、優先度(P0/P1/P2)と検証方法を明記。
- nextActions: 次に実施すべき具体的なアクションをちょうど3つ提案すること。

${ctx}`,

  businessProposal: (ctx: string, purpose: PurposeType) => `利用目的「${purpose}」に合わせて、経営陣・投資家・社内関係者にそのまま説明できる事業提案書（全12セクション）を生成してください。
必ず以下の12セクション構成（number: 1〜12, title は番号を除いたタイトル）を正確に出力してください：
${PROPOSAL_SECTIONS[purpose].map((title, i) => `${i + 1}. ${title}`).join('\n')}
数字や市場規模が不足する場合は、勝手に推計値を確定せず、unknownsOrAssumptions に「仮定・要調査事項」として明示してください。

${ctx}`,

  mvpSpecification: (ctx: string) => `「最短3日で操作可能なプロトタイプを作る」前提で、MVP Specification と AIアプリビルダーに直接投入できる詳細なアプリ開発用プロンプト（buildPrompt）を生成してください。
- essentialFeatures / userStories / keyUseCases には P0 / P1 / P2 の優先順位を付けること。
- buildPrompt には必ず以下の全項目を日本語で詳細に含めること：
  1. プロダクト概要 2. 技術要件 3. UI要件 4. 画面構成 5. 各機能の仕様 6. ユーザーフロー 7. データ構造 8. サンプルデータ 9. エラー処理 10. 実装優先順位 11. 完了条件

${ctx}`,

  validationPlan: (ctx: string) => `以下の事業構想を検証するための「Validation Plan」および「Interview Guide」を生成してください。
- recommendedMethod は必ず次の6つから最も適切な1つを選択すること：
  ${quoteList(VALIDATION_METHODS)}
- プロトタイプへの好意的なコメントだけで事業性を証明したと誤認しないよう、厳格な失敗基準と検証後の意思決定分岐を設計すること。

${ctx}`,
};
