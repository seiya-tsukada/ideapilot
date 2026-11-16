import type { DecisionReport, TaggedItem } from '../types/decision.ts';

function formatTaggedLine(item: TaggedItem): string {
  const note = item.sourceNote ? ` (${item.sourceNote})` : '';
  return `[${item.epistemic}] ${item.content}${note}`;
}

export function executiveSummaryToMarkdown(report: DecisionReport): string {
  const es = report.executiveSummary;
  const issues = es.keyIssuesToResolve
    .map((item, i) => `${i + 1}. ${formatTaggedLine(item)}`)
    .join('\n');

  return `# Executive Summary: ${report.ideaName}

- 生成日時: ${new Date(report.createdAt).toLocaleString('ja-JP')}
- 利用目的: ${report.input.purpose}
- 全体要約: ${report.overallSummary}

## 事業アイデアの概要
${formatTaggedLine(es.ideaOverview)}

## 解決する顧客課題
${formatTaggedLine(es.customerProblem)}

## ターゲット顧客
${formatTaggedLine(es.targetCustomer)}

## 提供価値
${formatTaggedLine(es.valueProposition)}

## 収益化の方向性
${formatTaggedLine(es.monetizationDirection)}

## 競争優位性の仮説
${formatTaggedLine(es.competitiveAdvantageHypothesis)}

## 事業化に向けた重要な論点
${issues}
`;
}

export function businessModelToMarkdown(report: DecisionReport): string {
  const bm = report.businessModel;
  const blocksMd = bm.blocks
    .map((block) => {
      const items = block.items.map((item) => `- ${formatTaggedLine(item)}`).join('\n');
      return `### ${block.label}\n${items}`;
    })
    .join('\n\n');

  const comparisonsMd = bm.revenueModelComparisons
    .map(
      (c) =>
        `### ${c.modelName} [${c.epistemic}]\n- 課金メカニズム: ${c.pricingMechanism}\n- メリット: ${c.pros}\n- デメリット・リスク: ${c.cons}\n- 適合条件: ${c.suitability}`,
    )
    .join('\n\n');

  return `# Business Model: ${report.ideaName}

## ビジネスモデル構造（10要素）

${blocksMd}

## 収益化モデル比較

${comparisonsMd}
`;
}

export function decisionBriefToMarkdown(report: DecisionReport): string {
  const db = report.decisionBrief;
  const ed = db.executiveDecision;

  const uncertainties = ed.keyUncertainties.map((u) => `- ${u}`).join('\n');
  const conditions = ed.conditionsToProceed.map((c) => `- ${c}`).join('\n');

  const opportunityMd = db.opportunityAssessment
    .map(
      (o) =>
        `### ${o.dimension} — 評価: ${o.rating} / 確信度: ${o.confidence} [${o.epistemic}]\n- 評価理由: ${o.rationale}\n- 根拠となる情報: ${o.evidence}\n- 不足している情報: ${o.missingInfo}`,
    )
    .join('\n\n');

  const risksMd = db.keyRisks
    .map(
      (r) =>
        `- **${r.category}** (深刻度: ${r.severity}) [${r.epistemic}]: ${r.risk}\n  - 緩和策: ${r.mitigation}`,
    )
    .join('\n');

  const assumptionsMd = db.criticalAssumptions
    .map(
      (a, idx) =>
        `${idx + 1}. **[${a.priority}] ${a.assumption}** [${a.epistemic}]\n   - 重要性: ${a.whyImportant}\n   - 現時点の根拠: ${a.currentEvidence}\n   - 検証方法: ${a.validationMethod}`,
    )
    .join('\n');

  const actionsMd = db.nextActions
    .map(
      (act, idx) =>
        `### Action ${idx + 1}: ${act.action}\n- 目的: ${act.purpose}\n- 具体的な進め方: ${act.executionSteps}\n- 必要な成果物: ${act.requiredDeliverable}\n- 成功条件: ${act.successCriteria}`,
    )
    .join('\n\n');

  return `# Decision Brief: ${report.ideaName}

## A. Executive Decision
- **暫定判断**: **${ed.verdict}** [${ed.epistemic}]
- **判断理由**: ${ed.rationale}

### 主な不確実性
${uncertainties}

### 次のステージへ進むための条件
${conditions}

## B. Opportunity Assessment
${opportunityMd}

## C. Key Risks
${risksMd}

## D. Critical Assumptions
${assumptionsMd}

## E. Next Actions (3つの優先アクション)
${actionsMd}
`;
}

export function proposalToMarkdown(report: DecisionReport): string {
  const bp = report.businessProposal;
  const sectionsMd = bp.sections
    .map((s) => {
      const unknowns =
        s.unknownsOrAssumptions.length > 0
          ? `\n\n**仮定・要調査事項:**\n${s.unknownsOrAssumptions.map((u) => `- ${u}`).join('\n')}`
          : '';
      return `## ${s.number}. ${s.title} [${s.epistemic}]\n\n${s.content}${unknowns}`;
    })
    .join('\n\n---\n\n');

  return `# 事業提案書 (${bp.purpose}): ${report.ideaName}

生成日時: ${new Date(report.createdAt).toLocaleString('ja-JP')}

${sectionsMd}
`;
}

export function mvpToMarkdown(report: DecisionReport): string {
  const mvp = report.mvpSpecification;
  const stories = mvp.userStories
    .map((s) => `- [${s.priority}] ${s.role}として、${s.benefit}のために、${s.goal}`)
    .join('\n');
  const useCases = mvp.keyUseCases
    .map((u) => `- [${u.priority}] **${u.title}**: ${u.flow}`)
    .join('\n');
  const features = mvp.essentialFeatures
    .map(
      (f) =>
        `- [${f.priority}] **${f.name}** (${f.threeDayFeasible ? '3日実装可' : '要調整'}): ${f.description}`,
    )
    .join('\n');
  const screens = mvp.screens
    .map((sc) => `- **${sc.name}**: ${sc.purpose}（主要要素: ${sc.primaryElements}）`)
    .join('\n');
  const transitions = mvp.screenTransitions.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const entities = mvp.dataStructureOverview
    .map((d) => `- **${d.entity}**: ${d.fields}（${d.notes}）`)
    .join('\n');

  return `# MVP Specification: ${report.ideaName}

## プロダクトコンセプト
${formatTaggedLine(mvp.productConcept)}

## 想定ユーザー
${formatTaggedLine(mvp.targetUsers)}

## 解決する課題
${formatTaggedLine(mvp.problemSolved)}

## ユーザーストーリー
${stories}

## 主要ユースケース
${useCases}

## 必須機能（P0/P1/P2優先順位）
${features}

## 画面一覧
${screens}

## 画面遷移
${transitions}

## データ構造の概要
${entities}

## MVPの開発範囲（最短3日プロトタイプ前提）
${mvp.mvpScope.map((item) => `- ${item}`).join('\n')}

## MVPでは実装しない機能
${mvp.outOfScope.map((item) => `- ${item}`).join('\n')}

## 将来的な拡張案
${mvp.futureExtensions.map((item) => `- ${item}`).join('\n')}

---

## Google AI Studio Build用プロンプト

\`\`\`text
${mvp.aiStudioBuildPrompt}
\`\`\`
`;
}

export function validationPlanToMarkdown(report: DecisionReport): string {
  const vp = report.validationPlan;
  const kpis = vp.kpis
    .map((k) => `- **${k.metric}**: 目標値 ${k.target}（計測方法: ${k.measurementNote}）`)
    .join('\n');
  const questions = vp.interviewGuide.questions
    .map((q, i) => `${i + 1}. **${q.topic}**: ${q.question}\n   - 確認したい意図: ${q.intent}`)
    .join('\n');

  return `# Validation Plan: ${report.ideaName}

## 検証したい仮説
${vp.hypothesesToValidate.map((h) => `- ${h}`).join('\n')}

## 検証対象ユーザー
${vp.targetValidationUsers}

## 推奨検証方法
- **手法**: ${vp.recommendedMethod}
- **選定理由**: ${vp.methodRationale}

## 検証シナリオ
${vp.validationScenario}

## KPI
${kpis}

## 成功基準・失敗基準
- **成功基準**: ${vp.successCriteria}
- **失敗基準**: ${vp.failureCriteria}

## 必要な実装範囲
${vp.requiredImplementationScope}

## 検証後の意思決定
${vp.postValidationDecision}

---

## Interview Guide（顧客検証インタビューガイド）
- **目的**: ${vp.interviewGuide.objective}
- **対象者スクリーニング条件**: ${vp.interviewGuide.screeningCriteria}
- **注意点**: ${vp.interviewGuide.cautionNotes}

### 質問リスト
${questions}
`;
}

export function reportToFullMarkdown(report: DecisionReport): string {
  return [
    executiveSummaryToMarkdown(report),
    businessModelToMarkdown(report),
    decisionBriefToMarkdown(report),
    proposalToMarkdown(report),
    mvpToMarkdown(report),
    validationPlanToMarkdown(report),
  ].join('\n\n================================================================================\n\n');
}

export type MarkdownBlock =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; lang: string; content: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string };

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4).trim() });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2).trim() });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> ') &&
      lines[i].trim() !== '---' &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
  }

  return blocks;
}
