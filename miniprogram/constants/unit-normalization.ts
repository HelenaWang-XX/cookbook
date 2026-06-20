/** 单位标准化映射表 */

export const UNIT_NORMALIZE_MAP: Record<string, string> = {
  // 体积
  '毫升': 'ml',
  'ml': 'ml',
  'ML': 'ml',
  'mL': 'ml',
  '升': 'L',
  'l': 'L',
  'L': 'L',

  // 重量
  '克': 'g',
  'g': 'g',
  'G': 'g',
  'gram': 'g',
  '千克': 'kg',
  '公斤': 'kg',
  'kg': 'kg',
  'KG': 'kg',
  '斤': '斤',       // 中国特有，保留
  '两': '两',       // 同上

  // 数量
  '个': '个',
  '颗': '个',       // 颗粒类合并到个
  '只': '只',       // 虾、鸡等
  '条': '条',       // 鱼等
  '块': '块',
  '片': '片',
  '根': '根',
  '瓣': '瓣',       // 蒜瓣
  '把': '把',       // 一把葱

  // 容积
  '勺': '勺',
  '汤匙': '勺',
  '大匙': '勺',
  '大勺': '大勺',
  '小勺': '小勺',
  '茶匙': '小勺',
  '小匙': '小勺',
  '汤勺': '汤勺',
  '调羹': '勺',
  '杯': '杯',

  // 其他
  '适量': '适量',
  '少许': '少许',
  '若干': '适量',
};

/** 标准化单位 */
export function normalizeUnit(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return UNIT_NORMALIZE_MAP[trimmed] || trimmed;
}
