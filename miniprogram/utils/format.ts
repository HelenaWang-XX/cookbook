/** 格式化工具 */

/** 格式化时长（分钟）为可读文本 */
export function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return '';
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}

/** 格式化日期时间戳为可读文本 */
export function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 格式化数量展示 */
export function formatQuantity(quantity: number | null, unit: string | null, fallback: string): string {
  if (quantity !== null && unit) return `${quantity}${unit}`;
  return fallback;
}
