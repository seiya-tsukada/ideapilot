import type { DecisionReport, IdeaInput } from './schema.ts';

export interface SampleIdea {
  label: string;
  input: IdeaInput;
}

export const SAMPLE_IDEAS: SampleIdea[] = [
  {
    label: 'Corporate例：設備保全ナレッジAI',
    input: {
      idea: '中堅製造業向けに、ベテラン保全担当者の修理対応履歴・音声メモ・図面を構造化し、若手作業員が現場でタブレットから原因切り分けと復旧手順を確認できる「設備保全ナレッジAIプラットフォーム」を新規事業として立ち上げたい。',
      purpose: 'Corporate',
      targetCustomer: '従業員100〜500名規模の自動車部品・精密加工メーカーの工場長および設備保全部門',
      problem: '熟練保全担当者の定年退職により、突発故障時の原因特定ノウハウが属人化しており、ライン停止時間が長引いている。',
      valueProposition: '過去の故障ログと音声メモを現場で即検索できる構造化ナレッジへ変換し、復旧時間と引き継ぎ工数を削減する。',
      constraints: {
        budget: 'PoCフェーズ予算 400万円以内',
        timeline: '3ヶ月以内に社内工場または協力工場1社でPoC開始',
        team: '事業開発1名、PM1名、エンジニア1名（業務委託可）',
        other: '既存顧客である製造業取引先へのクロスセルを想定',
      },
      additionalContext: '自社はFA機器商社であり、国内300社以上の工場と既存取引がある。',
    },
  },
  {
    label: 'Startup例：中小建設業向け請求SaaS',
    input: {
      idea: '中小建設会社・専門工事会社向けに、LINEやPDFで届くバラバラな注文書・作業日報から出来高を自動集計し、月次の請求書発行と支払査定を効率化するバーティカルSaaSを起業したい。',
      purpose: 'Startup',
      targetCustomer: '年商3億〜30億円規模の専門工事会社（電気・空調・内装など）の経営者および経理・現場監督',
      problem: '現場ごとの出来高集計や追加工事の確認が紙・FAX・LINEに散在し、月末の請求業務に毎月3〜5日かかっている。',
      valueProposition: '既存のLINE・PDFワークフローを変えずに出来高集計から請求書ドラフト作成までを半自動化する。',
      constraints: {
        budget: '自己資金300万円（シード調達前）',
        timeline: '1ヶ月でプロトタイプ検証、3ヶ月で有償パイロット3社獲得',
        team: '共同創業者2名（ビジネス1名、フルスタック1名）',
      },
      additionalContext: '初期はインボイス制度対応済みのPDF出力と主要会計ソフト向けCSV出力に絞りたい。',
    },
  },
];

export const SAMPLE_CORPORATE_REPORT: DecisionReport = {
  id: 'sample-corp-maintenance-ai',
  createdAt: '2026-11-15T10:00:00.000Z',
  updatedAt: '2026-11-15T10:00:00.000Z',
  isSample: true,
  input: SAMPLE_IDEAS[0].input,
  ideaName: '設備保全ナレッジAI・引継ぎ支援プラットフォーム',
  overallSummary:
    '既存FA機器商社の顧客基盤（300社以上の取引工場）を活かした設備保全ナレッジAIの新規事業構想。熟練者の暗黙知喪失という明確な現場課題を起点としているが、現場での音声入力定着率と有償導入の意思決定ラインは未検証のため、協力工場1社でのPoCを前提とした「CONDITIONAL GO」と判断。',
  executiveSummary: {
    ideaOverview: {
      content:
        '工場の突発故障対応ログ・音声メモ・保全図面をAIで構造化し、若手作業員が現場タブレットから症状別に原因切り分けと復旧手順を参照できるB2B SaaS。',
      epistemic: 'FACT',
      sourceNote: 'ユーザー入力に基づく事業構想',
    },
    customerProblem: {
      content:
        '熟練保全担当者の定年退職に伴い、過去の異常兆候や復旧手順が属人化したまま失われ、設備停止時間（ダウンタイム）の長期化リスクが高まっている。',
      epistemic: 'FACT',
      sourceNote: 'ユーザー入力より確認',
    },
    targetCustomer: {
      content:
        '従業員100〜500名規模の自動車部品・精密加工メーカーにおける工場長（決裁者）および設備保全部門のリーダー・若手作業員（利用者）。',
      epistemic: 'FACT',
      sourceNote: 'ユーザー入力に基づくセグメント',
    },
    valueProposition: {
      content:
        '現場の作業負荷を増やさず音声・写真だけで保全履歴を蓄積でき、トラブル発生時に過去事例と照合した復旧候補手順を数秒で提示する。',
      epistemic: 'HYPOTHESIS',
      sourceNote: '実際の現場入力率・検索精度はPoCでの検証が必要',
    },
    monetizationDirection: {
      content:
        '工場単位の月額SaaS基本料金＋初期導入時の過去保全日報データ構造化支援（プロフェッショナルサービス）のハイブリッド型。',
      epistemic: 'ESTIMATE',
      sourceNote: '許容価格帯は顧客ヒアリングで要確認',
    },
    competitiveAdvantageHypothesis: {
      content:
        '自社が保有する国内300社以上の製造業取引口座とFA機器知見により、汎用マニュアルSaaSでは入り込めない工場現場へ低CACでリーチできる点。',
      epistemic: 'HYPOTHESIS',
      sourceNote: '既存営業チャネルの稼働可否は社内確認が必要',
    },
    keyIssuesToResolve: [
      {
        content: '保全担当者が作業直後に音声やテキストで記録を残す運用が定着するか（現場負荷の許容度）。',
        epistemic: 'UNKNOWN',
      },
      {
        content: '既存取引先工場における予算規模（年間100万円超の決裁可否）および他社保全システム（CMMS）の導入状況。',
        epistemic: 'UNKNOWN',
      },
      {
        content: '工場内のネットワーク環境（オフライン・セキュリティ制限）に対するSaaS展開の制約。',
        epistemic: 'UNKNOWN',
      },
    ],
  },
  businessModel: {
    blocks: [
      {
        key: 'problem',
        label: 'Problem（顧客課題）',
        items: [
          { content: '熟練保全担当者の退職に伴う暗黙知・修理ノウハウの喪失', epistemic: 'FACT' },
          { content: '紙やExcelに分散した過去故障履歴の検索困難による復旧遅延', epistemic: 'HYPOTHESIS' },
        ],
      },
      {
        key: 'customerSegment',
        label: 'Customer Segment（顧客セグメント）',
        items: [
          { content: '従業員100〜500名の自動車部品・精密加工メーカーの工場・保全部門', epistemic: 'FACT' },
          { content: '既存のFA機器取引先300社から優先的にアプローチ', epistemic: 'FACT' },
        ],
      },
      {
        key: 'valueProposition',
        label: 'Value Proposition（提供価値）',
        items: [
          { content: '症状・設備型番からの過去トラブル原因と復旧手順の即時提示', epistemic: 'HYPOTHESIS' },
          { content: '作業後の音声メモから自動で保全記録フォーマットへ構造化', epistemic: 'HYPOTHESIS' },
        ],
      },
      {
        key: 'solution',
        label: 'Solution（ソリューション）',
        items: [
          { content: '音声・写真入力対応の現場タブレットWebアプリ＋過去保全ログ検索AI', epistemic: 'ESTIMATE' },
        ],
      },
      {
        key: 'revenueModel',
        label: 'Revenue Model（収益モデル）',
        items: [
          { content: '1工場あたり月額SaaS利用料（価格帯はPoCを通じて検証）', epistemic: 'ESTIMATE' },
          { content: '初期データ移行・設備台帳構造化スポット費用', epistemic: 'HYPOTHESIS' },
        ],
      },
      {
        key: 'costStructure',
        label: 'Cost Structure（コスト構造）',
        items: [
          { content: 'LLM API・音声認識・クラウド基盤利用料', epistemic: 'ESTIMATE' },
          { content: 'PoC開発費（400万円以内想定）および初期オンボーディング人件費', epistemic: 'FACT' },
        ],
      },
      {
        key: 'distributionChannel',
        label: 'Distribution Channel（チャネル）',
        items: [
          { content: '既存FA機器営業担当による既存顧客工場へのクロスセル提案', epistemic: 'HYPOTHESIS' },
        ],
      },
      {
        key: 'competitiveAdvantage',
        label: 'Competitive Advantage（競争優位性）',
        items: [
          { content: '国内300社以上の既存取引基盤と設備メーカー型番のドメイン知識', epistemic: 'FACT' },
          { content: '蓄積された故障パターンデータによる検索精度向上（検証前提）', epistemic: 'HYPOTHESIS' },
        ],
      },
      {
        key: 'keyPartners',
        label: 'Key Partners（主要パートナー）',
        items: [
          { content: 'PoC受け入れ協力工場（初期導入先1〜2社）', epistemic: 'UNKNOWN' },
          { content: '業務委託エンジニア・AI開発パートナー', epistemic: 'FACT' },
        ],
      },
      {
        key: 'keyResources',
        label: 'Key Resources（主要リソース）',
        items: [
          { content: '既存営業ネットワーク・顧客口座', epistemic: 'FACT' },
          { content: 'PoC専任チーム（事業開発1・PM1・エンジニア1）', epistemic: 'FACT' },
        ],
      },
    ],
    revenueModelComparisons: [
      {
        modelName: '工場単位・定額SaaS＋初期導入費',
        pricingMechanism: '1工場ごとの月額固定課金（例：アカウント無制限）＋過去データ取込の初期費',
        pros: '現場作業員全員にアカウントを配布しやすく、データ蓄積が進みやすい',
        cons: '大工場と小工場で価値提供量に差が出ても単価が伸びにくい',
        suitability: '中堅工場（100〜500名）の初期導入・予算稟議の通りやすさを重視する場合に適合',
        epistemic: 'ESTIMATE',
      },
      {
        modelName: '管理設備台数ベース課金（従量）',
        pricingMechanism: '登録する主要生産設備・ライン数に応じた月額段階課金',
        pros: '顧客の工場規模・停止リスク削減額に比例してARPAを拡大できる',
        cons: '顧客が対象設備を絞り込みすぎると横断検索の価値が落ちる懸念',
        suitability: '複数ラインを持つ大手工場へのアップセルフェーズに適合',
        epistemic: 'HYPOTHESIS',
      },
      {
        modelName: '保守サービス付帯型（FA機器保守パック）',
        pricingMechanism: '既存のFA機器メンテナンス契約・交換部品供給にソフトウェア利用権をバンドル',
        pros: 'IT予算ではなく修繕費・保守費枠から支出でき、稟議ハードルが下がる',
        cons: 'ソフトウェア単体の収益性とSaaSマルチプルが評価されにくい',
        suitability: 'IT投資に慎重な伝統的製造業への初期浸透に適合',
        epistemic: 'HYPOTHESIS',
      },
    ],
  },
  decisionBrief: {
    executiveDecision: {
      verdict: 'CONDITIONAL GO',
      rationale:
        '既存取引先300社という明確なディストリビューション資産があり、3ヶ月・400万円以内のPoC枠組みも現実的。一方で、現場作業員が作業後に記録を残す行動変容が起きるか、また既存の保全管理システム（CMMS）とどう棲み分けるかの一次情報が未確認であるため、全面開発ではなく1社PoCを条件とするCONDITIONAL GOを推奨。',
      keyUncertainties: [
        '現場の保全作業員が騒音環境下や作業直後に音声メモ入力を行うか（運用定着性）',
        '既存取引先のうち、実際に熟練者退職による突発停止コストに危機感を持つ割合',
        '工場内のセキュリティポリシー上、クラウド型生成AIに保全ログ・図面をアップロードできるか',
      ],
      conditionsToProceed: [
        '既存営業経由で保全部門ヒアリングを10社実施し、うち3社以上で「過去履歴検索の痛み」を確認する',
        '協力工場1社を特定し、過去1年分の保全日報データ（紙/Excel）のサンプル提供合意を得る',
        'クラウド利用可否（オンプレ・閉域網要件の有無）をヒアリング時に必ず確認する',
      ],
      epistemic: 'HYPOTHESIS',
    },
    opportunityAssessment: [
      {
        dimension: '顧客課題の強さ',
        rating: '高',
        rationale: '製造業における熟練技能者の高齢化・退職は構造的課題であり、突発故障時のライン停止は直接的な売上損失につながる。',
        evidence: 'ユーザー入力にて主要課題として明記（ただし具体的な停止損失額は未聴取）。',
        missingInfo: 'ターゲット工場における年間突発停止回数と1時間あたり機会損失額の実測値。',
        confidence: '中',
        epistemic: 'HYPOTHESIS',
      },
      {
        dimension: '市場機会',
        rating: '要調査',
        rationale: '国内中堅製造業の保全DXニーズは存在すると推測されるが、具体的なTAM/SAMや競合導入率は未取得のため数値化しない。',
        evidence: '自社取引先300社以上の工場基盤が存在する点（FACT）。',
        missingInfo: '国内同規模工場数、既存CMMS/マニュアルツールの導入率とリプレイス余地。',
        confidence: '低',
        epistemic: 'UNKNOWN',
      },
      {
        dimension: '収益化の可能性',
        rating: '中',
        rationale: '既存商社の取引口座を通じたB2B契約が可能であり、工場単位の月額課金＋導入支援で初期売上を立てやすい構造。',
        evidence: '既存取引300社へのクロスセル可能性（入力情報）。',
        missingInfo: '顧客が年額いくらまでなら保全DX予算（または修繕費）から支出できるかのWTP（支払意思額）。',
        confidence: '低',
        epistemic: 'ESTIMATE',
      },
      {
        dimension: '競争優位性',
        rating: '中',
        rationale: '汎用AIチャットやマニュアル作成ツールに対し、FA機器知識と既存営業網を持つ点は明確な差別化仮説。',
        evidence: 'FA機器商社としての事業基盤（FACT）。',
        missingInfo: '競合となる特化型CMMSベンダー・設備メーカー純正保守ツールの最新機能比較（要調査）。',
        confidence: '中',
        epistemic: 'HYPOTHESIS',
      },
      {
        dimension: '実行可能性',
        rating: '高',
        rationale: 'PoC予算400万円・期間3ヶ月・3名体制は、構造化ログ検索のプロトタイプ構築と1社検証に十分なリソース水準。',
        evidence: 'ユーザー入力の制約条件（予算400万円・3ヶ月・3名）。',
        missingInfo: '業務委託エンジニアの確保状況および自社既存営業の同行協力度合い。',
        confidence: '高',
        epistemic: 'FACT',
      },
    ],
    keyRisks: [
      {
        category: '顧客ニーズのリスク',
        risk: '現場作業員が多忙・手袋着用・騒音環境のため入力を全く行わず、データベースが陳腐化するリスク。',
        severity: '高',
        mitigation: '入力負荷ゼロに近づけるため、まずは既存の紙/Excel保全日報の一括取り込みから価値を出し、入力は選択式＋短時間音声に限定して検証する。',
        epistemic: 'HYPOTHESIS',
      },
      {
        category: '技術リスク',
        risk: '設備の固有名詞や型番・社内俗称をAIが誤認識し、誤った復旧手順を提示して安全事故や二次故障を招くリスク。',
        severity: '高',
        mitigation: 'AIが回答を生成する際も必ず「元になった過去保全日報の原文・該当箇所」へのリンクと参照元を明示し、断定表現を避けるUIにする。',
        epistemic: 'ESTIMATE',
      },
      {
        category: '市場リスク',
        risk: '工場のセキュリティポリシーにより外部クラウドへの図面・故障データ送信が禁止され、商談が長期化するリスク。',
        severity: '中',
        mitigation: '初期ヒアリングでIT部門・情報セキュリティ要件を確認し、学習非利用契約や閉域接続の要否を早期に切り分ける。',
        epistemic: 'UNKNOWN',
      },
      {
        category: '収益性リスク',
        risk: '顧客ごとの過去日報フォーマットがバラバラで、初期データクレンジングに想定以上の人件費がかかり粗利を圧迫するリスク。',
        severity: '中',
        mitigation: '初期導入支援費を別建てで請求する価格設計にするか、対象設備を主要ライン10台程度に絞って導入する。',
        epistemic: 'ESTIMATE',
      },
      {
        category: '競合リスク',
        risk: '既存の設備保全システム（CMMS）や汎用ナレッジツールがAI検索機能を追加し、機能差が縮小するリスク。',
        severity: '中',
        mitigation: 'ツール単体ではなく、FA機器商社としての交換部品手配やメーカー問い合わせ連携と一体化した業務導線で差別化する。',
        epistemic: 'UNKNOWN',
      },
      {
        category: '実行体制のリスク',
        risk: '既存FA営業担当が本業の機器販売を優先し、新規事業の顧客紹介・ヒアリング同行に十分な工数を割けないリスク。',
        severity: '高',
        mitigation: '営業担当へのインセンティブ設計（または社内評価目標への組み込み）を事業責任者と事前に合意する。',
        epistemic: 'HYPOTHESIS',
      },
    ],
    criticalAssumptions: [
      {
        assumption: 'ターゲット工場の保全部門は、過去の故障対応ログを検索できれば若手作業員の復旧時間を短縮できる',
        whyImportant: '検索できること自体に現場価値がなければ、システム導入のROIが成立しないため。',
        currentEvidence: '一般的な仮説段階（現場での過去ログ参照頻度・解決寄与率は未確認）。',
        validationMethod: '既存取引先5〜10社の保全責任者インタビューおよび過去保全日報20件を用いた疑似検索テスト。',
        priority: 'P0',
        epistemic: 'HYPOTHESIS',
      },
      {
        assumption: '既存取引先の工場長・保全部門は、クラウド型AIツールへ自社の保全記録・図面を預けることを許容する',
        whyImportant: 'クラウドNGの場合、オンプレミス開発となり400万円・3ヶ月の制約内でMVPが提供できなくなるため。',
        currentEvidence: '未確認（UNKNOWN）。',
        validationMethod: 'インタビュー時のセキュリティ要件・情シス承認プロセス確認。',
        priority: 'P0',
        epistemic: 'UNKNOWN',
      },
      {
        assumption: '現場作業員が作業完了後に1分以内の音声メモまたは簡易入力を継続できる',
        whyImportant: '継続的なデータ蓄積がなければ「生きたナレッジ基盤」にならず解約につながるため。',
        currentEvidence: '未確認。',
        validationMethod: '協力工場1社での2週間〜4週間のプロトタイプ実地テスト（入力完了率の計測）。',
        priority: 'P1',
        epistemic: 'HYPOTHESIS',
      },
    ],
    nextActions: [
      {
        action: '既存取引先10社への顧客課題・セキュリティ要件ヒアリング',
        purpose: '「熟練者退職による復旧遅延」の実態把握と、クラウド利用可否・支払意思額の確認。',
        executionSteps:
          '1) 既存営業担当から中堅製造業10社をリストアップ 2) 30分の現場ヒアリングを実施（直近3回の突発故障の復旧プロセスを深掘り） 3) うち1〜2社にPoC協力の打診を行う。',
        requiredDeliverable: '10社分の課題構造化サマリー＆PoC候補先リスト',
        successCriteria: '10社中4社以上が「過去履歴検索の仕組みが急務」と回答し、クラウド利用可の協力工場1社以上からデータ提供内諾を得ること。',
      },
      {
        action: '実データを用いた簡易検索プロトタイプ（PoC前検証）の構築',
        purpose: '開発投資を最小限に抑えつつ、実際の保全日報（汚い手書き・専門用語含む）でAI検索が実用に耐えるか検証する。',
        executionSteps:
          '1) 協力工場から匿名化された過去保全履歴20〜50件を収集 2) Gemini API等で症状・原因・処置の構造化JSON変換と類似検索を3日間でプロトタイプ化 3) 現場の若手・ベテラン双方に検索結果を評価してもらう。',
        requiredDeliverable: '実データ検索精度検証レポート（正答率・参照元提示の納得度）',
        successCriteria: '現場担当者による検索テストで「探している過去事例に1分以内に辿り着ける」評価が70%以上。',
      },
      {
        action: '社内事業化ゲート（PoC予算400万円の承認条件）の合意形成',
        purpose: 'PoC終了後に「本開発へ進むか撤退するか」の判断基準を事前に経営陣・営業部門と握る。',
        executionSteps:
          '1) Decision BriefとPoC計画書を事業責任者へ共有 2) 既存営業の協力工数枠と成果基準を明文化 3) 3ヶ月後のGo/No-Go判定日を設定。',
        requiredDeliverable: 'PoC承認シート（撤退ライン・成功基準明記版）',
        successCriteria: '営業部門の同行協力とPoC予算枠の正式承認を獲得すること。',
      },
    ],
  },
  businessProposal: {
    purpose: 'Corporate',
    sections: [
      {
        number: 1,
        title: '背景',
        content:
          '国内中堅製造業において熟練技能者の高齢化・定年退職が進む一方、若手人材の採用難から技術伝承が追いついていない。当社の既存顧客である300社以上の工場でも、設備保全の現場知識が特定のベテラン社員に依存する構造が顕在化していると想定される。',
        epistemic: 'ESTIMATE',
        unknownsOrAssumptions: ['当社既存顧客300社のうち何割が保全人員の高齢化を緊急課題視しているかはヒアリングで要調査'],
      },
      {
        number: 2,
        title: '解決すべき課題',
        content:
          '設備の突発故障が発生した際、過去の修理履歴や特有の癖・応急処置ノウハウが紙の日報や個人の記憶に散在しており、若手作業員が原因特定に長時間を要している。結果として製造ラインのダウンタイムが増加し、生産性低下を招いている。',
        epistemic: 'FACT',
        unknownsOrAssumptions: ['1回あたりの平均停止時間および機会損失金額は顧客先ごとの実測が必要'],
      },
      {
        number: 3,
        title: '事業機会',
        content:
          '汎用的なマニュアル作成ツールは多数存在するが、設備保全の現場特化（型番・症状・原因・交換部品の紐づけ）かつ既存商社の現場サポートと連動できるサービスは限られている。既存FA機器取引口座を起点としたクロスセルにより、低い顧客獲得コスト（CAC）でストック型収益基盤を構築できる可能性がある。',
        epistemic: 'HYPOTHESIS',
        unknownsOrAssumptions: ['市場規模（TAM/SAM）および競合CMMSのシェア分布は未調査（UNKNOWN）'],
      },
      {
        number: 4,
        title: '提案するソリューション',
        content:
          '過去の保全日報・図面・作業後の音声メモを生成AIで自動構造化し、「設備名・症状」から類似トラブルの原因候補と復旧手順、必要な交換部品を即座に提示する「設備保全ナレッジAIプラットフォーム」を提供する。誤案内を防ぐため、必ず元の記録・参照箇所を併記する設計とする。',
        epistemic: 'ESTIMATE',
        unknownsOrAssumptions: ['現場の騒音下における音声認識精度は実地検証が必要'],
      },
      {
        number: 5,
        title: 'ターゲット顧客',
        content:
          '初期ターゲットは従業員100〜500名規模の自動車部品・精密加工メーカーの工場長および設備保全部門。特に専用CMMSを未導入またはExcel管理に留まっている当社既存取引工場を第1優先セグメントとする。',
        epistemic: 'FACT',
        unknownsOrAssumptions: ['既存取引300社におけるCMMS導入率は要調査'],
      },
      {
        number: 6,
        title: 'ビジネスモデル',
        content:
          '1工場あたり月額利用料によるSaaSサブスクリプションを軸とし、導入初期の過去日報デジタル化・構造化支援を初期設定費として受領するハイブリッドモデルを想定する。',
        epistemic: 'ESTIMATE',
        unknownsOrAssumptions: ['具体的な月額単価（例：月額5万〜15万円帯の妥当性）は顧客の支払意思額調査で決定する'],
      },
      {
        number: 7,
        title: '既存事業とのシナジー',
        content:
          '1) FA機器営業の顧客接点を活かした高速な商談創出 2) 故障履歴データから交換部品・予備品の適切な発注提案や更新提案につなげるクロスセル効果 3) 機器販売後の継続的なリレーション維持による競合スイッチング防止。',
        epistemic: 'HYPOTHESIS',
        unknownsOrAssumptions: ['交換部品発注連動の業務フローへの影響は営業部門と要協議'],
      },
      {
        number: 8,
        title: '競争優位性',
        content:
          '300社以上の工場との既存取引関係、FA機器の型番・構造に関するドメイン知識、そして現場へ足を運ぶ営業・技術サポート体制の掛け合わせにより、ITベンダー単独では実現しにくい現場密着の導入推進が可能。',
        epistemic: 'HYPOTHESIS',
        unknownsOrAssumptions: ['競合製品の最新AI機能との優位性比較は追加調査が必要'],
      },
      {
        number: 9,
        title: '必要な投資・リソース',
        content:
          'PoCフェーズ（3ヶ月）の想定投資枠は400万円以内。推進体制は事業開発1名、PM1名、開発エンジニア1名（業務委託活用含む）の計3名に加え、既存営業担当からの顧客紹介・同行協力を確保する。',
        epistemic: 'FACT',
        unknownsOrAssumptions: ['本開発（商用版）移行時の追加開発費はPoC結果をもとに再見積りする'],
      },
      {
        number: 10,
        title: 'リスク',
        content:
          '主要リスクは①現場作業員の入力負荷による定着不全、②工場内セキュリティ要件によるクラウド利用制限、③専門用語・社内略語のAI誤解釈による誤誘導、④初期データ整備工数の肥大化の4点。段階的PoCと参照元明示UIで緩和を図る。',
        epistemic: 'HYPOTHESIS',
        unknownsOrAssumptions: ['各工場の情報セキュリティ基準のばらつきは要調査'],
      },
      {
        number: 11,
        title: 'PoC計画',
        content:
          '1ヶ月目に既存顧客10社ヒアリングと協力工場1社選定・過去日報データ受領、2ヶ月目に検索・記録プロトタイプ構築と試験運用、3ヶ月目に復旧検索時間短縮と入力定着率を計測し、事業化Go/No-Goを判定する。',
        epistemic: 'ESTIMATE',
        unknownsOrAssumptions: ['協力工場での実機テスト期間は工場側の稼働スケジュールに依存する'],
      },
      {
        number: 12,
        title: '意思決定してほしい事項',
        content:
          '本日意思決定いただきたい事項は以下の2点：1) 既存取引先10社へのヒアリング実施および既存営業部門の同行協力の承認、2) 協力工場1社確保を条件としたPoC予算枠（上限400万円・期間3ヶ月）の事前確保。',
        epistemic: 'FACT',
        unknownsOrAssumptions: ['正式な予算執行は10社ヒアリングでの課題確認後を条件とする'],
      },
    ],
  },
  mvpSpecification: {
    productConcept: {
      content:
        '「現場で30秒で記録し、1分で過去の復旧知恵を探し出す」設備保全ナレッジ検索・記録プロトタイプ。',
      epistemic: 'HYPOTHESIS',
    },
    targetUsers: {
      content: '設備保全の若手〜中堅作業員（検索・記録の主利用）および保全リーダー（レビュー・承認）。',
      epistemic: 'FACT',
    },
    problemSolved: {
      content: '紙・Excelに埋もれた過去の故障対応履歴を探し出せず、ベテランに電話確認したり復旧が長期化する問題。',
      epistemic: 'FACT',
    },
    userStories: [
      {
        role: '若手保全作業員',
        goal: '設備名と発生している症状（異音・エラーコード等）を入力して過去の類似故障と復旧手順を確認したい',
        benefit: 'ベテラン不在時でも一次切り分けと迅速な復旧に着手できる',
        priority: 'P0',
      },
      {
        role: '保全作業員（全般）',
        goal: '修理完了後に音声入力または短いメモから「原因・処置・使用部品」を自動構造化して保存したい',
        benefit: '事務所に戻ってからの日報作成時間を削減できる',
        priority: 'P0',
      },
      {
        role: '保全リーダー',
        goal: 'AIが構造化した記録の正確性を確認し、公式ナレッジとして承認・修正したい',
        benefit: '誤った対応手順が現場に定着するのを防げる',
        priority: 'P1',
      },
      {
        role: '工場長・管理者',
        goal: '設備別の故障頻度やよく検索されるトラブルを確認したい',
        benefit: '予防保全や部品在庫の見直しに活かせる',
        priority: 'P2',
      },
    ],
    keyUseCases: [
      {
        title: '突発故障発生時の類似事例検索',
        flow: '設備選択 → 症状・エラーコード入力 → 類似過去ログ上位3件と引用元原文・推奨確認ポイントを表示',
        priority: 'P0',
      },
      {
        title: '復旧後のワンステップ作業記録登録',
        flow: '設備選択 → 音声テキスト/メモ入力 → AIが「現象・推定原因・実施処置・交換部品」に自動整形 → 確認して保存',
        priority: 'P0',
      },
      {
        title: '過去保全日報（CSV/テキスト）の一括初期取り込み',
        flow: '管理者画面から既存日報データをインポート → AIが構造化レコードへ変換し初期データベースを構築',
        priority: 'P1',
      },
    ],
    essentialFeatures: [
      {
        name: '症状・設備型番による過去ログAI検索（参照元明示付き）',
        description: 'キーワードおよび自然文の症状説明から過去の保全履歴を検索し、必ず元記録の原文と確信度を併記する。',
        priority: 'P0',
        threeDayFeasible: true,
      },
      {
        name: '作業メモの自動構造化フォーム',
        description: '現場の短い自由記述メモから「設備・症状・原因・処置・部品」を構造化JSONに整理し、ワンタップで修正・保存できる。',
        priority: 'P0',
        threeDayFeasible: true,
      },
      {
        name: '過去日報サンプルデータ管理・編集機能',
        description: 'PoC用の過去故障ログを一覧表示・検索・編集・新規追加できる簡易データベース管理画面。',
        priority: 'P0',
        threeDayFeasible: true,
      },
      {
        name: '保全リーダー向けレビュー・承認ステータス切替',
        description: '「未確認」「承認済み」のステータスを切り替え、承認済みナレッジを優先表示する機能。',
        priority: 'P1',
        threeDayFeasible: true,
      },
      {
        name: '設備マスタ別・故障傾向サマリー',
        description: '設備ごとの故障件数と頻出症状を集計表示する簡易レポート画面。',
        priority: 'P2',
        threeDayFeasible: false,
      },
    ],
    screens: [
      {
        name: '1. トラブル検索・原因切り分け画面（メイン）',
        purpose: '現場作業員が設備と症状を入力し、過去の類似修理履歴とチェック項目を即座に確認する。',
        primaryElements: '設備セレクタ、症状入力欄、検索結果カード（参照元原文・処置手順・使用部品）、解決フィードバックボタン',
      },
      {
        name: '2. かんたん保全記録登録画面',
        purpose: '修理後のメモや音声入力テキストをAIで構造化フォーマットに変換して登録する。',
        primaryElements: '設備選択、自由記述/音声テキスト入力欄、AI構造化プレビューフォーム、保存ボタン',
      },
      {
        name: '3. ナレッジ一覧・管理画面',
        purpose: '登録済みの保全履歴を検索・フィルタ・編集・ステータス確認する。',
        primaryElements: '設備フィルタ、キーワード検索、構造化データテーブル、詳細・編集ドロワー',
      },
    ],
    screenTransitions: [
      'トップナビゲーションから「トラブル検索」「記録登録」「ナレッジ一覧」をワンクリックで切り替え',
      'トラブル検索画面の「該当なし・新しく記録する」から記録登録画面へ設備情報を引き継いで遷移',
      '記録登録完了後、自動的にナレッジ一覧（または検索対象データ）へ反映され即検索可能になる',
    ],
    dataStructureOverview: [
      {
        entity: 'Equipment（設備マスタ）',
        fields: 'id, name, modelNumber, lineName, manufacturer',
        notes: '対象工場の主要設備リスト',
      },
      {
        entity: 'MaintenanceRecord（保全記録）',
        fields: 'id, equipmentId, reportedAt, symptom, rootCause, actionTaken, partsUsed, rawMemo, approvalStatus, authorRole',
        notes: 'AI構造化後のデータと生メモ(rawMemo)を両方保持しトレーサビリティを担保',
      },
    ],
    mvpScope: [
      '設備10〜20台分のサンプル／実データを用いた自然文トラブル検索（参照元原文表示必須）',
      '作業メモからのAI構造化記録作成と編集・ローカル/DB保存',
      '登録済み保全履歴の一覧・詳細確認・編集',
    ],
    outOfScope: [
      'IoTセンサー・PLCからのリアルタイム異常値自動連携',
      'SSO・複雑な権限管理やマルチテナント企業管理機能',
      'ERP/購買システムとの交換部品自動発注連携',
      'オフラインネイティブモバイルアプリ化（まずはレスポンシブWebで検証）',
    ],
    futureExtensions: [
      '現場タブレットのマイク直接録音による高精度音声文字起こし連携',
      '設備図面PDF・配線図の特定ページへのダイレクトジャンプ機能',
      'FA機器商社の部品在庫・見積依頼へのワンクリック連携',
    ],
    buildPrompt: `# アプリケーション開発プロンプト: 設備保全ナレッジAI・引継ぎ支援MVP

## 1. プロダクト概要
中堅製造業の設備保全部門向けに、熟練者の修理ノウハウや過去の故障対応履歴を構造化し、若手作業員が現場タブレット・PCから迅速に原因切り分けと作業記録を行えるWebアプリケーションを構築してください。
最優先課題は「過去履歴の検索速度」と「作業後記録の入力負荷軽減」および「AI回答の誤誘導防止（必ず元記録を参照元として表示）」です。

## 2. 技術要件
- フロントエンド: React + TypeScript + Tailwind CSS
- バックエンド: Express (server.ts) + @google/genai SDK（サーバーサイドでGemini APIを呼び出すこと）
- データ永続化: 初期MVPはブラウザのlocalStorageと初期サンプルデータで動作し、リロード後も追加・編集した保全履歴が保持されること

## 3. UI要件
- 洗練された業務向けB2B SaaSデザイン（白・淡いグレー基調、アクセントカラーにインディゴブルー）
- 現場タブレット（768px幅）およびPC（1440px幅）で押しやすいボタンサイズと高い視認性
- 日本語UI、余白を十分に取り情報の階層を明確にする

## 4. 画面構成
1. トラブル検索画面（メイン画面）
   - 設備選択ドロップダウン + 症状フリーテキスト入力 + よくある症状クイック選択
   - AIが過去の保全記録から類似度・関連性の高い事例を抽出し、「推定される確認ポイント」「過去の処置手順」「使用部品」「元となった保全記録の原文・日付」をカード形式で表示
   - 不確実な推測には「確認推奨・仮説」ラベルを明示する
2. かんたん記録登録画面
   - 設備選択 + 作業メモ入力（例：「コンベアAのモーター異音、ベアリング摩耗のため6204ZZ交換して復旧」）
   - 「AIで構造化」ボタンを押すと、Gemini APIが「症状」「原因」「実施処置」「交換部品」の4フィールドに自動分解してフォームに反映
   - ユーザーが内容を手動修正してから保存できる
3. ナレッジ一覧・編集画面
   - 設備別・承認ステータス別のフィルタリングと一覧テーブル
   - 行クリックで詳細確認・編集・削除が可能

## 5. ユーザーフロー
1. 若手作業員がトラブル検索画面で「プレス機2号」「油圧が上がらずエラーE04」と入力し検索
2. 過去の類似事例2件とチェック手順が表示され、参照元のベテラン記録を確認
3. 修理完了後、記録登録画面でメモを入力してAI構造化→確認して保存
4. ナレッジ一覧および次回の検索対象に即時反映される

## 6. データ構造
- Equipment: { id: string, name: string, lineName: string, modelNumber: string }
- MaintenanceRecord: { id: string, equipmentId: string, occurredAt: string, symptom: string, rootCause: string, actionTaken: string, partsUsed: string[], rawMemo: string, status: '未確認' | '承認済み' }

## 7. サンプルデータ
初期状態で製造現場らしい設備5台（CNC旋盤、油圧プレス機、自動搬送コンベア等）と、リアルな故障対応履歴8件をプリセットすること。

## 8. エラー処理
- Gemini API呼び出し失敗時はユーザーに分かりやすいエラーメッセージと再試行ボタンを表示し、手動入力フォームでの登録は継続可能にすること。

## 9. 実装優先順位
- P0: サンプルデータ表示、AI類似トラブル検索（参照元表示付き）、AI作業メモ構造化＆保存
- P1: 保全記録の編集・ステータス変更、設備フィルタ
- P2: 設備別の故障件数簡易サマリー

## 10. 完了条件
- 検索から類似事例と元データ参照が表示されること
- メモ入力からAI構造化・編集・保存ができ、リロード後もデータが残ること`,
  },
  validationPlan: {
    hypothesesToValidate: [
      '保全部門の担当者は、過去の故障履歴を症状ベースで1分以内に検索できれば、ベテランへの電話確認や復旧遅延を減らせる',
      '作業直後の短文メモ／音声入力からの自動構造化であれば、現場作業員の記録負荷が許容範囲内に収まる',
      '中堅製造業の工場長は、上記価値に対して月額SaaS契約（または保守パック付帯）の予算承認を行える',
    ],
    targetValidationUsers:
      '既存取引先のうち従業員100〜500名の製造業10社の設備保全責任者・若手保全作業員（ヒアリング）、および協力工場1社の保全部門（実地PoC）。',
    recommendedMethod: '実際の業務でのPoC',
    methodRationale:
      '画面の見た目への好意的な反応だけでは「忙しい現場で本当に入力・検索が使われるか」が証明できないため。実際の過去の紙/Excel日報を用いた検索テストと、現場での実業務並行テスト（PoC）を組み合わせることが不可欠。',
    validationScenario:
      'Phase 1（1〜2週目）：10社インタビューで課題強度とセキュリティ要件を確認し協力工場1社を決定。Phase 2（3〜4週目）：協力工場の過去保全履歴30件を取り込んだプロトタイプを作成し、模擬トラブル5問の切り分けテストを実施。Phase 3（5〜10週目）：実際の日常保全業務で4週間試験運用し、記録登録率と検索活用回数を計測する。',
    kpis: [
      {
        metric: 'ヒアリング課題合意率',
        target: '10社中4社以上が「最重要課題」と回答',
        measurementNote: 'インタビュー構造化メモにて判定',
      },
      {
        metric: '過去事例検索の有効回答率',
        target: '模擬/実トラブル対応の70%以上で有用な過去記録に到達',
        measurementNote: '検索後の「役に立った」フィードバック記録',
      },
      {
        metric: '現場作業後の記録登録率',
        target: '発生した故障対応の60%以上が48時間以内に登録',
        measurementNote: 'PoC期間の作業件数とシステム登録件数の比較',
      },
    ],
    successCriteria:
      'PoC参加工場の保全責任者が「継続利用のために有償契約（想定価格帯）の稟議を上げる意思がある」と明言し、かつ記録登録率60%以上を達成すること。',
    failureCriteria:
      '現場作業員の記録登録率が30%未満に留まる、または「過去の記録がそもそも再利用できる内容ではない」と判明し検索有効率が40%未満に留まった場合。',
    requiredImplementationScope:
      '上記MVP SpecificationのP0機能のみ（過去日報インポート、症状検索＋原文表示、メモ自動構造化登録）。IoT連携や高度権限管理は実装しない。',
    postValidationDecision:
      '成功基準を満たした場合は商用版P1開発と既存顧客20社への横展開を決定（GO）。記録定着のみが課題の場合は入力方式を「保全部門事務代行（Wizard of Oz）」へピボット検討。課題自体が弱い場合は本事業案をクローズ（NO-GO）する。',
    interviewGuide: {
      objective: '「本当に現場が困っている故障の種類・頻度」と「既存のデータ管理方法・セキュリティ制約」を事実ベースで把握する。',
      screeningCriteria: '従業員100〜500名の製造工場で、設備保全の現場実務または管理を1年以上担当している方。',
      questions: [
        {
          topic: '直近の具体的なトラブル事例（過去の事実確認）',
          question: '直近1ヶ月で一番復旧に時間がかかった設備トラブルは何でしたか？発生から復旧まで誰がどう動いたか時系列で教えてください。',
          intent: '「一般論」ではなく直近の具体的行動から、本当の情報探索ボトルネックを特定する。',
        },
        {
          topic: '現在の記録・検索方法',
          question: '過去の修理履歴を調べたいとき、今は何を見て、どれくらいの時間がかかっていますか？',
          intent: '現在の代替手段（紙ファイル、Excel、ベテランへの電話）のコストを把握する。',
        },
        {
          topic: '技術的・セキュリティ制約',
          question: '業務で外部のクラウドサービスやタブレットを現場に持ち込む際、社内規定やネットワーク面で制限はありますか？',
          intent: 'クラウドSaaSとして導入可能か、導入障壁の有無を早期に確認する。',
        },
        {
          topic: '投資対効果と決裁ライン',
          question: 'もし同様の仕組みを導入するとしたら、どの部門の予算から、誰の承認が必要になりますか？',
          intent: 'IT予算か修繕費か、決裁権者が工場長か本社情報システム部かを把握する。',
        },
      ],
      cautionNotes:
        '「こういうAIツールがあったら使いますか？」という将来の仮定質問は避け、必ず「過去1ヶ月の実際の行動」を質問すること。リップサービスによる誤判定を防ぐ。',
    },
  },
};

/** Returns a fresh copy of the sample report with a unique id and current timestamps. */
export function createSampleReport(): DecisionReport {
  const now = new Date().toISOString();
  return { ...structuredClone(SAMPLE_CORPORATE_REPORT), id: `sample-${crypto.randomUUID()}`, createdAt: now, updatedAt: now };
}
