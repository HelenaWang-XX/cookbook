/** 本地存储键名常量 */

export const STORAGE_KEYS = {
  /** 菜谱列表 JSON */
  RECIPES: 'recipes',

  /** 图片清单映射: { [recipeId]: { cover: string, steps: string[] } } */
  IMAGE_MANIFEST: 'image_manifest',

  /** 购物清单选中的菜谱 ID 列表 */
  SHOPPING_LIST_IDS: 'shopping_list_ids',

  /** 购物清单勾选状态 */
  SHOPPING_LIST_CHECKED: 'shopping_list_checked',

  /** 自定义食材别名 */
  CUSTOM_ALIASES: 'custom_aliases',

  /** 用户设置 */
  SETTINGS: 'settings',
} as const;
