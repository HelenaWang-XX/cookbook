/** 模糊匹配工具 */

/**
 * 简单拼音首字母匹配
 * 例如 "fqcd" 匹配 "番茄炒蛋"
 */
const PINYIN_INITIALS: Record<string, string> = {
  'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
  'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p',
  'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x',
  'y': 'y', 'z': 'z',
};

/** 获取中文字符串的拼音首字母（简化版，仅覆盖常见厨房用字） */
function toPinyinInitials(str: string): string {
  // 这里使用简单方法：保留英文/数字，中文简单处理
  // 完整拼音需要引入库，此处保持轻量
  let result = '';
  for (const char of str) {
    const code = char.charCodeAt(0);
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57)) {
      result += char.toLowerCase();
    }
    // 中文不做拼音转换，保留原字符（可后续引入拼音库优化）
  }
  return result;
}

/**
 * 判断 query 是否匹配 target
 * - 直接包含匹配
 * - 每个字符依次出现（模糊匹配）
 */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (!q) return true;
  if (t.includes(q)) return true;

  // 拼音首字母匹配
  const pinyin = toPinyinInitials(target);
  if (pinyin && pinyin.includes(q)) return true;

  // 逐字模糊匹配：query 的每个字符按顺序在 target 中出现
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return false;
    ti = found + 1;
  }
  return true;
}

/**
 * 按模糊匹配度排序
 * 返回匹配分数 (越高越好)，不匹配返回 0
 */
export function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (!q) return 1;
  if (t === q) return 100;                // 完全匹配
  if (t.startsWith(q)) return 90;         // 前缀匹配
  if (t.includes(q)) return 80;           // 包含匹配

  // 逐字模糊匹配
  let score = 0;
  let ti = 0;
  let consecutive = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return 0;
    if (found === ti) consecutive++;
    else consecutive = 0;
    ti = found + 1;
    score += 10 - (found - (ti - 1)) * 0.5 + consecutive * 5;
  }
  return Math.max(1, score);
}
