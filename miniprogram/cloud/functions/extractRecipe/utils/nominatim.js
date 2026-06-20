/** 食材名称标准化 */

// 内置别名表（仅云函数需要的精简版）
const ALIAS_MAP = {
  '鸡蛋': ['土鸡蛋', '柴鸡蛋', '鲜鸡蛋', '草鸡蛋', '鸡子儿'],
  '番茄': ['西红柿', '蕃茄', '洋柿子'],
  '土豆': ['马铃薯', '洋芋', '山药蛋'],
  '生抽': ['生抽酱油', '酱油'],
  '料酒': ['黄酒', '绍酒', '花雕酒'],
  '盐': ['食盐', '食用盐', '精盐', '海盐'],
  '白糖': ['白砂糖', '砂糖', '绵白糖', '糖'],
  '葱': ['大葱', '香葱', '小葱', '青葱'],
  '生姜': ['姜', '老姜', '鲜姜'],
  '大蒜': ['蒜', '蒜头', '蒜瓣'],
  '醋': ['陈醋', '香醋', '白醋', '米醋'],
  '淀粉': ['生粉', '玉米淀粉', '土豆淀粉', '太白粉'],
};

/**
 * @param {string} name
 * @returns {string}
 */
function normalizeIngredientName(name) {
  const cleaned = name.trim();
  for (const [canonical, aliases] of Object.entries(ALIAS_MAP)) {
    if (aliases.includes(cleaned) || cleaned === canonical) {
      return canonical;
    }
  }
  return cleaned;
}

module.exports = { normalizeIngredientName };
