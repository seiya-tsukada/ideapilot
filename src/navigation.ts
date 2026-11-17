export type Screen = 'input' | 'analyzing' | 'report' | 'export';

export const NAV_ITEMS = [
  { screen: 'input', label: 'アイデア入力', shortLabel: '入力', requiresReport: false },
  { screen: 'report', label: '分析レポート', shortLabel: 'レポート', requiresReport: true },
  { screen: 'export', label: 'エクスポート', shortLabel: '出力', requiresReport: true },
] as const satisfies readonly {
  screen: Screen;
  label: string;
  shortLabel: string;
  requiresReport: boolean;
}[];
