/** Returns a copy of `items` with the element at `index` shallow-merged with `patch`. */
export const updateAt = <T extends object>(items: readonly T[], index: number, patch: Partial<T>): T[] =>
  items.map((item, i) => (i === index ? { ...item, ...patch } : item));

/** Returns a copy of `items` with the element at `index` replaced. */
export const replaceAt = <T>(items: readonly T[], index: number, value: T): T[] =>
  items.map((item, i) => (i === index ? value : item));

/** Returns a copy of `items` without the element at `index`. */
export const removeAt = <T>(items: readonly T[], index: number): T[] =>
  items.filter((_, i) => i !== index);
