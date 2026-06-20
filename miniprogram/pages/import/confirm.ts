/** 确认导入页 — 预览解析结果并编辑后保存 */
import type { ParsedRecipe, RecipeInput, Category } from '../../types/recipe';
import { parsedRecipeToInput } from '../../services/import.service';
import { createRecipe } from '../../services/recipe.service';
import { CATEGORIES } from '../../constants/categories';

Page({
  data: {
    parsed: null as ParsedRecipe | null,
    name: '',
    category: 'meat' as Category,
    categoryIndex: 0,
    ingredientTexts: [] as string[],
    stepTexts: [] as string[],
    categories: CATEGORIES.map((c) => ({ key: c.key, label: c.label + c.icon })),
    saving: false,
  },

  onLoad(options: Record<string, string>) {
    if (options.data) {
      try {
        const parsed: ParsedRecipe = JSON.parse(decodeURIComponent(options.data));
        this.setData({
          parsed,
          name: parsed.name || '',
          ingredientTexts: parsed.ingredients.map((i) => `${i.name} ${i.amount}`),
          stepTexts: parsed.steps.map((s) => s.description),
        });
      } catch {
        wx.showToast({ title: '数据解析失败', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1000);
      }
    }
  },

  onNameInput(e: WechatMiniprogram.Input) { this.setData({ name: e.detail.value }); },
  onCategoryChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ categoryIndex: Number(e.detail.value), category: CATEGORIES[Number(e.detail.value)].key });
  },

  onIngredientInput(e: WechatMiniprogram.Input) {
    const idx = e.currentTarget.dataset.index;
    const arr = this.data.ingredientTexts;
    arr[idx] = e.detail.value;
    this.setData({ ingredientTexts: arr });
  },
  onStepInput(e: WechatMiniprogram.Input) {
    const idx = e.currentTarget.dataset.index;
    const arr = this.data.stepTexts;
    arr[idx] = e.detail.value;
    this.setData({ stepTexts: arr });
  },

  async onSave() {
    if (!this.data.name.trim()) { wx.showToast({ title: '请输入菜名', icon: 'none' }); return; }
    this.setData({ saving: true });

    const input: RecipeInput = {
      name: this.data.name.trim(),
      category: this.data.category,
      subcategory: '',
      coverImagePath: null,
      ingredients: this.data.ingredientTexts.filter((t) => t.trim()).map((t) => {
        // 简单构造 Ingredient
        const { normalizeIngredient } = require('../../services/ingredient-normalizer');
        return normalizeIngredient(t.trim());
      }),
      steps: this.data.stepTexts.filter((t) => t.trim()).map((t, i) => ({
        order: i + 1,
        description: t.trim(),
        imagePath: null,
        duration: null,
      })),
      prepTime: null,
      servings: this.data.parsed?.servings || 2,
      difficulty: 2,
      sourceUrl: this.data.parsed?.sourceUrl || null,
      sourceName: this.data.parsed?.sourceName || null,
      tags: [],
      notes: '',
    };

    createRecipe(input);
    wx.showToast({ title: '已导入', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack({ delta: 2 });
    }, 800);
    this.setData({ saving: false });
  },
});
