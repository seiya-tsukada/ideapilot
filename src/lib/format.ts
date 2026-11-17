const dateFormatter = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso));

/** Zero-pads a 1-based index, e.g. `1 → "01"`. */
export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Builds a filesystem-friendly slug that keeps CJK characters. */
export const toFileSlug = (name: string, fallback = 'ideapilot_report') =>
  name
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || fallback;
