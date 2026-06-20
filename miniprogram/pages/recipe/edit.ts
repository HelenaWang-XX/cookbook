/** 菜谱编辑页 — 新增 & 编辑 */
import type { Recipe, RecipeInput, Ingredient, RecipeStep, Category, Difficulty } from '../../types/recipe';
import { getRecipeById, createRecipe, updateRecipe } from '../../services/recipe.service';
import { normalizeIngredient } from '../../services/ingredient-normalizer';
import { compressAndSave } from '../../services/image-compressor';
import { uid } from '../../utils/uid';
import { CATEGORIES, DIFFICULTY_LABELS } from '../../constants/categories';

const USER_DATA_PATH = wx.env.USER_DATA_PATH;

Page({
  data: {
    isEdit: false,
    recipeId: '',

    name: '',
    category: 'meat' as Category,
    categoryIndex: 0,
    subcategory: '',
    coverImagePath: '',
    prepTime: '',
    servings: 2,
    difficulty: 2 as Difficulty,
    tags: [] as string[],
    notes: '',
    sourceUrl: '',
    sourceName: '',

    // 食材列表（每个食材一行原始文本）
    ingredientRows: [] as { id: string; value: string }[],

    // 步骤列表
    stepRows: [] as { id: string; order: number; description: string; imagePath: string }[],

    categories: CATEGORIES.map((c) => ({ key: c.key, label: c.label + c.icon })),
    difficultyOptions: [1, 2, 3].map((d) => ({ value: d, label: DIFFICULTY_LABELS[d] })),

    saving: false,
  },

  onLoad(options: Record<string, string>) {
    if (options.id) {
      const recipe = getRecipeById(options.id);
      if (recipe) {
        this.loadRecipeData(recipe);
        wx.setNavigationBarTitle({ title: '编辑菜谱' });
        return;
      }
    }
    wx.setNavigationBarTitle({ title: '添加菜谱' });
    // 默认添加一个空食材行和步骤行
    this.addIngredientRow();
    this.addStepRow();
  },

  loadRecipeData(recipe: Recipe) {
    this.setData({
      isEdit: true,
      recipeId: recipe.id,
      name: recipe.name,
      category: recipe.category,
      categoryIndex: CATEGORIES.findIndex((c) => c.key === recipe.category),
      subcategory: recipe.subcategory,
      coverImagePath: recipe.coverImagePath || '',
      prepTime: recipe.prepTime ? String(recipe.prepTime) : '',
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      tags: recipe.tags,
      notes: recipe.notes,
      sourceUrl: recipe.sourceUrl || '',
      sourceName: recipe.sourceName || '',
      ingredientRows: recipe.ingredients.map((ing) => ({
        id: ing.id,
        value: `${ing.canonicalName} ${ing.amount}`,
      })),
      stepRows: recipe.steps.map((s) => ({
        id: uid(),
        order: s.order,
        description: s.description,
        imagePath: s.imagePath || '',
      })),
    });
  },

  // ===== 基本信息 =====

  onNameInput(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value });
  },

  onCategoryChange(e: WechatMiniprogram.PickerChange) {
    const idx = Number(e.detail.value);
    this.setData({
      categoryIndex: idx,
      category: CATEGORIES[idx].key,
    });
  },

  onSubcategoryInput(e: WechatMiniprogram.Input) {
    this.setData({ subcategory: e.detail.value });
  },

  onPreptimeInput(e: WechatMiniprogram.Input) {
    this.setData({ prepTime: e.detail.value });
  },

  onServingsChange(e: WechatMiniprogram.SliderChange) {
    this.setData({ servings: e.detail.value });
  },

  onDifficultyChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ difficulty: (Number(e.detail.value) + 1) as Difficulty });
  },

  onNotesInput(e: WechatMiniprogram.Input) {
    this.setData({ notes: e.detail.value });
  },

  // ===== 封面图 =====

  async onCoverUpload() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const path = `${USER_DATA_PATH}/images/covers/${Date.now()}.jpg`;
        try {
          const saved = await compressAndSave(res.tempFilePaths[0], path);
          this.setData({ coverImagePath: saved });
        } catch {
          wx.showToast({ title: '图片保存失败', icon: 'none' });
        }
      },
    });
  },

  onCoverRemove() {
    this.setData({ coverImagePath: '' });
  },

  // ===== 食材 =====

  addIngredientRow() {
    const rows = this.data.ingredientRows;
    rows.push({ id: uid(), value: '' });
    this.setData({ ingredientRows: rows });
  },

  removeIngredientRow(e: WechatMiniprogram.CustomEvent) {
    const idx = e.currentTarget.dataset.index;
    const rows = this.data.ingredientRows;
    rows.splice(idx, 1);
    this.setData({ ingredientRows: rows });
  },

  onIngredientInput(e: WechatMiniprogram.Input) {
    const idx = e.currentTarget.dataset.index;
    const rows = this.data.ingredientRows;
    rows[idx].value = e.detail.value;
    this.setData({ ingredientRows: rows });
  },

  // ===== 步骤 =====

  addStepRow() {
    const rows = this.data.stepRows;
    rows.push({
      id: uid(),
      order: rows.length + 1,
      description: '',
      imagePath: '',
    });
    this.setData({ stepRows: rows });
  },

  removeStepRow(e: WechatMiniprogram.CustomEvent) {
    const idx = e.currentTarget.dataset.index;
    const rows = this.data.stepRows;
    rows.splice(idx, 1);
    // 重新排序
    rows.forEach((r, i) => (r.order = i + 1));
    this.setData({ stepRows: rows });
  },

  onStepInput(e: WechatMiniprogram.Input) {
    const idx = e.currentTarget.dataset.index;
    const rows = this.data.stepRows;
    rows[idx].description = e.detail.value;
    this.setData({ stepRows: rows });
  },

  async onStepImage(e: WechatMiniprogram.CustomEvent) {
    const idx = e.currentTarget.dataset.index;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const path = `${USER_DATA_PATH}/images/steps/${Date.now()}.jpg`;
        try {
          const saved = await compressAndSave(res.tempFilePaths[0], path);
          const rows = this.data.stepRows;
          rows[idx].imagePath = saved;
          this.setData({ stepRows: rows });
        } catch {
          wx.showToast({ title: '图片保存失败', icon: 'none' });
        }
      },
    });
  },

  // ===== 标签 =====

  onTagsChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ tags: e.detail.tags });
  },

  // ===== 保存 =====

  async onSave() {
    if (this.data.saving) return;
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入菜名', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    // 解析食材
    const ingredients: Ingredient[] = this.data.ingredientRows
      .filter((r) => r.value.trim())
      .map((r) => normalizeIngredient(r.value.trim(), { id: r.id }));

    if (ingredients.length === 0) {
      wx.showToast({ title: '请至少添加一种食材', icon: 'none' });
      this.setData({ saving: false });
      return;
    }

    // 解析步骤
    const steps: RecipeStep[] = this.data.stepRows
      .filter((s) => s.description.trim())
      .map((s, i) => ({
        order: i + 1,
        description: s.description.trim(),
        imagePath: s.imagePath || null,
        duration: null,
      }));

    if (steps.length === 0) {
      wx.showToast({ title: '请至少添加一个步骤', icon: 'none' });
      this.setData({ saving: false });
      return;
    }

    const input: RecipeInput = {
      name: this.data.name.trim(),
      category: this.data.category,
      subcategory: this.data.subcategory.trim(),
      coverImagePath: this.data.coverImagePath || null,
      ingredients,
      steps,
      prepTime: this.data.prepTime ? Number(this.data.prepTime) : null,
      servings: this.data.servings,
      difficulty: this.data.difficulty,
      sourceUrl: this.data.sourceUrl || null,
      sourceName: this.data.sourceName || null,
      tags: this.data.tags,
      notes: this.data.notes.trim(),
    };

    if (this.data.isEdit) {
      const updated = updateRecipe(this.data.recipeId, input);
      if (updated) {
        wx.showToast({ title: '已保存', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 800);
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    } else {
      createRecipe(input);
      wx.showToast({ title: '已添加', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    }

    this.setData({ saving: false });
  },
});
