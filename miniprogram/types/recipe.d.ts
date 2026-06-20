/** 菜谱核心类型定义 */

/** 分类枚举 */
export type Category = 'meat' | 'vegetarian' | 'seafood' | 'soup' | 'staple' | 'dessert';

/** 难度等级 */
export type Difficulty = 1 | 2 | 3;

/** 食材 */
export interface Ingredient {
  id: string;
  /** 标准化名称，如 "鸡蛋" */
  canonicalName: string;
  /** 原始展示文本，如 "2个" */
  amount: string;
  /** 解析后的数值，null 表示 "适量" */
  quantity: number | null;
  /** 标准化单位 */
  unit: string | null;
  /** 食材分类 */
  category: IngredientCategory;
  /** 备注 */
  notes: string;
}

/** 食材分类 */
export type IngredientCategory =
  | 'seasoning'   // 调味料
  | 'meat'        // 肉类
  | 'vegetable'   // 蔬菜
  | 'seafood'     // 水产
  | 'dairy'       // 乳制品
  | 'staple'      // 主食
  | 'dry_goods'   // 干货
  | 'other';      // 其他

/** 菜谱步骤 */
export interface RecipeStep {
  order: number;
  description: string;
  imagePath: string | null;
  duration: number | null;
}

/** 菜谱 */
export interface Recipe {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  coverImagePath: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  prepTime: number | null;
  servings: number;
  difficulty: Difficulty;
  sourceUrl: string | null;
  sourceName: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  notes: string;
}

/** 创建菜谱的输入（不含自动生成字段） */
export type RecipeInput = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;

/** 解析后的菜谱（来自网页抓取） */
export interface ParsedRecipe {
  name: string;
  ingredients: { name: string; amount: string }[];
  steps: { order: number; description: string; imageUrl: string | null }[];
  coverImageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
  prepTime: string | null;
  servings: number | null;
}
