/** 菜谱 CRUD 服务 */
import type { Recipe, RecipeInput, Category } from '../types/recipe';
import { storageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { uid } from '../utils/uid';
import { fuzzyMatch, fuzzyScore } from '../utils/fuzzy-match';
import { removeImage } from './image-compressor';

/**
 * 获取所有菜谱
 */
export function getAllRecipes(): Recipe[] {
  return storageService.get<Recipe[]>(STORAGE_KEYS.RECIPES) || [];
}

/**
 * 根据 ID 获取菜谱
 */
export function getRecipeById(id: string): Recipe | null {
  const recipes = getAllRecipes();
  return recipes.find((r) => r.id === id) || null;
}

/**
 * 新增菜谱
 */
export function createRecipe(input: RecipeInput): Recipe {
  const now = Date.now();
  const recipe: Recipe = {
    ...input,
    id: uid(),
    createdAt: now,
    updatedAt: now,
  };
  const recipes = getAllRecipes();
  recipes.unshift(recipe);
  saveRecipes(recipes);
  bumpVersion();
  return recipe;
}

/**
 * 更新菜谱
 */
export function updateRecipe(id: string, input: Partial<RecipeInput>): Recipe | null {
  const recipes = getAllRecipes();
  const idx = recipes.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  recipes[idx] = { ...recipes[idx], ...input, updatedAt: Date.now() };
  saveRecipes(recipes);
  bumpVersion();
  return recipes[idx];
}

/**
 * 删除菜谱（含关联图片）
 */
export function deleteRecipe(id: string): boolean {
  const recipes = getAllRecipes();
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return false;

  // 删除关联图片
  if (recipe.coverImagePath) removeImage(recipe.coverImagePath);
  recipe.steps.forEach((s) => {
    if (s.imagePath) removeImage(s.imagePath);
  });

  const filtered = recipes.filter((r) => r.id !== id);
  saveRecipes(filtered);
  bumpVersion();

  // 从购物清单中移除
  removeFromShoppingList(id);
  return true;
}

/**
 * 按分类筛选菜谱
 */
export function getRecipesByCategory(category: Category): Recipe[] {
  return getAllRecipes().filter((r) => r.category === category);
}

/**
 * 按菜名搜索
 */
export function searchByName(query: string): Recipe[] {
  const recipes = getAllRecipes();
  return recipes
    .filter((r) => fuzzyMatch(query, r.name) || r.tags.some((t) => fuzzyMatch(query, t)))
    .sort((a, b) => fuzzyScore(query, b.name) - fuzzyScore(query, a.name));
}

/**
 * 按食材搜索（我有这些食材能做什么菜）
 */
export function searchByIngredients(ingredientNames: string[]): Recipe[] {
  const recipes = getAllRecipes();
  const names = ingredientNames.map((n) => n.trim().toLowerCase());

  interface ScoredRecipe { recipe: Recipe; score: number }

  const results: ScoredRecipe[] = [];

  for (const recipe of recipes) {
    let matchCount = 0;
    let totalIngredients = recipe.ingredients.length;
    for (const ing of recipe.ingredients) {
      const ingName = ing.canonicalName.toLowerCase();
      if (names.some((n) => ingName.includes(n) || n.includes(ingName))) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      results.push({ recipe, score: matchCount / totalIngredients });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map((r) => r.recipe);
}

/**
 * 获取最近添加的菜谱
 */
export function getRecentRecipes(limit: number = 10): Recipe[] {
  return getAllRecipes()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

/**
 * 获取菜谱总数
 */
export function getRecipeCount(): number {
  return getAllRecipes().length;
}

/**
 * 获取各分类菜谱数量统计
 */
export function getCategoryStats(): Record<Category, number> {
  const recipes = getAllRecipes();
  const stats: Record<string, number> = { meat: 0, vegetarian: 0, seafood: 0, soup: 0, staple: 0, dessert: 0 };
  recipes.forEach((r) => stats[r.category]++);
  return stats as Record<Category, number>;
}

// ===== 购物清单 ID 管理 =====

export function getShoppingListIds(): string[] {
  return storageService.get<string[]>(STORAGE_KEYS.SHOPPING_LIST_IDS) || [];
}

export function addToShoppingList(recipeId: string): void {
  const ids = getShoppingListIds();
  if (!ids.includes(recipeId)) {
    ids.push(recipeId);
    storageService.set(STORAGE_KEYS.SHOPPING_LIST_IDS, ids);
    syncShoppingListToApp(ids);
  }
}

export function removeFromShoppingList(recipeId: string): void {
  const ids = getShoppingListIds().filter((id) => id !== recipeId);
  storageService.set(STORAGE_KEYS.SHOPPING_LIST_IDS, ids);
  syncShoppingListToApp(ids);
}

export function clearShoppingList(): void {
  storageService.set(STORAGE_KEYS.SHOPPING_LIST_IDS, []);
  syncShoppingListToApp([]);
}

// ===== 内部工具 =====

function saveRecipes(recipes: Recipe[]): void {
  storageService.set(STORAGE_KEYS.RECIPES, recipes);
}

function bumpVersion(): void {
  const app = getApp<IAppOption>();
  if (app) app.globalData.storageVersion++;
}

function syncShoppingListToApp(ids: string[]): void {
  const app = getApp<IAppOption>();
  if (app) app.globalData.shoppingListIds = ids;
}
