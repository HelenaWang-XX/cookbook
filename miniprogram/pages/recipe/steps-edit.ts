/** 全屏步骤编辑器 */
import { getRecipeById, updateRecipe } from '../../services/recipe.service';
import type { RecipeStep } from '../../types/recipe';
import { compressAndSave } from '../../services/image-compressor';
import { uid } from '../../utils/uid';

const USER_DATA_PATH = wx.env.USER_DATA_PATH;

Page({
  data: {
    recipeId: '',
    steps: [] as { id: string; order: number; description: string; imagePath: string }[],
  },

  onLoad(options: Record<string, string>) {
    if (options.id) {
      const recipe = getRecipeById(options.id);
      if (recipe) {
        this.setData({
          recipeId: recipe.id,
          steps: recipe.steps.map((s) => ({
            id: uid(),
            order: s.order,
            description: s.description,
            imagePath: s.imagePath || '',
          })),
        });
      }
    }
  },

  addStep() {
    const steps = this.data.steps;
    steps.push({ id: uid(), order: steps.length + 1, description: '', imagePath: '' });
    this.setData({ steps });
  },

  removeStep(e: WechatMiniprogram.CustomEvent) {
    const idx = e.currentTarget.dataset.index;
    const steps = this.data.steps;
    steps.splice(idx, 1);
    steps.forEach((s, i) => (s.order = i + 1));
    this.setData({ steps });
  },

  onStepInput(e: WechatMiniprogram.Input) {
    const idx = e.currentTarget.dataset.index;
    this.data.steps[idx].description = e.detail.value;
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
          this.data.steps[idx].imagePath = saved;
          this.setData({ steps: this.data.steps });
        } catch {
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      },
    });
  },

  moveUp(e: WechatMiniprogram.CustomEvent) {
    const idx = e.currentTarget.dataset.index;
    if (idx === 0) return;
    const steps = this.data.steps;
    [steps[idx - 1], steps[idx]] = [steps[idx], steps[idx - 1]];
    steps.forEach((s, i) => (s.order = i + 1));
    this.setData({ steps });
  },

  moveDown(e: WechatMiniprogram.CustomEvent) {
    const idx = e.currentTarget.dataset.index;
    if (idx === this.data.steps.length - 1) return;
    const steps = this.data.steps;
    [steps[idx], steps[idx + 1]] = [steps[idx + 1], steps[idx]];
    steps.forEach((s, i) => (s.order = i + 1));
    this.setData({ steps });
  },

  onSave() {
    const recipe = getRecipeById(this.data.recipeId);
    if (!recipe) return;

    const steps: RecipeStep[] = this.data.steps
      .filter((s) => s.description.trim())
      .map((s, i) => ({
        order: i + 1,
        description: s.description.trim(),
        imagePath: s.imagePath || null,
        duration: null,
      }));

    updateRecipe(this.data.recipeId, { steps });
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },
});
