/** 食材标准化相关类型 */

/** 食材别名映射 */
export interface IngredientAlias {
  /** 标准名称 */
  canonicalName: string;
  /** 别名列表 */
  aliases: string[];
  /** 默认单位 */
  unit: string;
  /** 食材分类 */
  category: import('./recipe').IngredientCategory;
}

/** 合并后的购物清单项 */
export interface MergedIngredient {
  canonicalName: string;
  unit: string | null;
  /** 合并后的数量，null 表示无法求和 */
  baseQuantity: number | null;
  /** 原始用量文本列表 */
  rawAmounts: string[];
  /** 食材分类 */
  category: string;
  /** 来源菜谱信息 */
  recipes: MergeSource[];
  /** 是否已采购 */
  checked: boolean;
}

/** 合并来源 */
export interface MergeSource {
  recipeId: string;
  recipeName: string;
  originalText: string;
}
