/** 购物清单合并服务 */
import type { MergedIngredient } from '../types/ingredient';
import { getAllRecipes, getShoppingListIds } from './recipe.service';
import { storageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

/**
 * 生成合并购物清单
 */
export function generateShoppingList(recipeIds?: string[]): MergedIngredient[] {
  const ids = recipeIds || getShoppingListIds();
  if (ids.length === 0) return [];

  const recipes = getAllRecipes().filter((r) => ids.includes(r.id));
  const map = new Map<string, MergedIngredient>();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = `${ing.canonicalName}|${ing.unit || 'none'}`;

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.recipes.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          originalText: `${ing.canonicalName} ${ing.amount}`,
        });

        if (ing.quantity !== null && existing.baseQuantity !== null) {
          existing.baseQuantity += ing.quantity;
        } else {
          existing.baseQuantity = null; // 有"适量"混入，无法求和
        }
        existing.rawAmounts.push(ing.amount);
      } else {
        map.set(key, {
          canonicalName: ing.canonicalName,
          unit: ing.unit,
          baseQuantity: ing.quantity,
          rawAmounts: [ing.amount],
          category: ing.category,
          recipes: [
            {
              recipeId: recipe.id,
              recipeName: recipe.name,
              originalText: `${ing.canonicalName} ${ing.amount}`,
            },
          ],
          checked: false,
        });
      }
    }
  }

  // 恢复勾选状态
  const checkedSet = getCheckedSet();

  // 排序：按分类，再按名称
  const categoryOrder = ['seasoning', 'meat', 'vegetable', 'seafood', 'dairy', 'staple', 'dry_goods', 'other'];
  return Array.from(map.values())
    .map((item) => ({
      ...item,
      checked: checkedSet.has(item.canonicalName),
    }))
    .sort((a, b) => {
      const aIdx = categoryOrder.indexOf(a.category);
      const bIdx = categoryOrder.indexOf(b.category);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.canonicalName.localeCompare(b.canonicalName, 'zh');
    });
}

/** 格式化显示数量 */
export function formatMergedAmount(item: MergedIngredient): string {
  if (item.baseQuantity !== null && item.unit) {
    return `${item.baseQuantity}${item.unit}`;
  }
  // 无法统一，显示所有原始文本
  const uniqueAmounts = [...new Set(item.rawAmounts)];
  return uniqueAmounts.join(' / ');
}

/** 更新勾选状态 */
export function toggleChecked(canonicalName: string, checked: boolean): void {
  const set = getCheckedSet();
  if (checked) {
    set.add(canonicalName);
  } else {
    set.delete(canonicalName);
  }
  storageService.set(STORAGE_KEYS.SHOPPING_LIST_CHECKED, Array.from(set));
}

/** 清除所有勾选状态 */
export function clearChecked(): void {
  storageService.remove(STORAGE_KEYS.SHOPPING_LIST_CHECKED);
}

/** 获取已勾选集合 */
function getCheckedSet(): Set<string> {
  const arr = storageService.get<string[]>(STORAGE_KEYS.SHOPPING_LIST_CHECKED) || [];
  return new Set(arr);
}
