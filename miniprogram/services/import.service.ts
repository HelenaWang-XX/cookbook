/** 网页导入服务 */
import type { ParsedRecipe, RecipeInput } from '../types/recipe';
import { normalizeIngredients } from './ingredient-normalizer';

/**
 * 调用云函数抓取网页菜谱
 * 注意：需要先开通微信云开发并部署 extractRecipe 云函数
 */
export async function extractRecipeFromUrl(url: string): Promise<{ success: boolean; data?: ParsedRecipe; error?: string }> {
  try {
    const res = await wx.cloud.callFunction({
      name: 'extractRecipe',
      data: { url },
    });
    const result = res.result as { success: boolean; data?: ParsedRecipe; error?: string };
    return result;
  } catch (e: any) {
    // 云函数未部署时的友好提示
    if (e?.errCode === -1 || e?.errMsg?.includes('not found')) {
      return {
        success: false,
        error: '云函数尚未部署，请先在微信开发者工具中开通云开发并部署 extractRecipe 云函数。\n\n你也可以选择手动录入菜谱。',
      };
    }
    return { success: false, error: e?.errMsg || '抓取失败，请检查链接是否正确' };
  }
}

/**
 * 将 ParsedRecipe 转换为 RecipeInput（用于确认保存）
 */
export function parsedRecipeToInput(parsed: ParsedRecipe): RecipeInput {
  const ingredients = normalizeIngredients(
    parsed.ingredients.map((i) => `${i.name}${i.amount}`)
  );

  return {
    name: parsed.name,
    category: 'meat', // 默认，用户可手动修改
    subcategory: '',
    coverImagePath: null,
    ingredients,
    steps: parsed.steps.map((s, idx) => ({
      order: idx + 1,
      description: s.description,
      imagePath: null,
      duration: null,
    })),
    prepTime: null,
    servings: parsed.servings || 2,
    difficulty: 2,
    sourceUrl: parsed.sourceUrl,
    sourceName: parsed.sourceName,
    tags: [],
    notes: '',
  };
}
