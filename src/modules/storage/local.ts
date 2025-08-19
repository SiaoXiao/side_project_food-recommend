const KEY = 'ccbf:user-prefs:v1';

/**
 * 讀寫使用者偏好（localStorage）
 *
 * @returns {UserPrefs} or null
 */
export function readPrefs<T>(): T | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * 儲存使用者偏好
 *
 * @param {T} data - 要保存的偏好資料
 * @returns {void} 無返回值
 */
export function writePrefs<T>(data: T): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}
