/**
 * 加權隨機抽樣
 *
 * @param {T[]} items - 候選項目
 * @param {number[]} weights - 與 items 對應的權重
 * @returns {T} 抽中的項目
 */
export function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}


/**
 * 等機率隨機抽一個項目
 * @returns T | null 當 items 為空時回傳 null
 */
export function randomPick<T>(items: readonly T[]): T | null {
  const n = items.length;
  if (n === 0) return null;
  const i = Math.floor(Math.random() * n);
  return items[i] ?? null;
}
