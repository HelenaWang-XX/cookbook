/** 菜谱详情页 */
import type { Recipe } from '../../types/recipe';
import { getRecipeById, deleteRecipe, addToShoppingList, removeFromShoppingList, getShoppingListIds } from '../../services/recipe.service';
import { CATEGORY_LABELS } from '../../constants/categories';
import { DIFFICULTY_LABELS } from '../../constants/categories';
import { formatDuration } from '../../utils/format';

Page({
  data: {
    recipe: null as Recipe | null,
    categoryLabel: '',
    difficultyLabel: '',
    durationText: '',
    isInShoppingList: false,
    loading: true,
    error: '',
  },

  onLoad(options: Record<string, string>) {
    if (options.id) {
      this.loadRecipe(options.id);
    } else {
      this.setData({ loading: false, error: '缺少菜谱 ID' });
    }
  },

  onShow() {
    if (this._recipeId) {
      this.loadRecipe(this._recipeId);
    }
  },

  _recipeId: '',

  loadRecipe(id: string) {
    this._recipeId = id;
    const recipe = getRecipeById(id);
    if (recipe) {
      const shoppingIds = getShoppingListIds();
      this.setData({
        recipe,
        categoryLabel: CATEGORY_LABELS[recipe.category] || recipe.category,
        difficultyLabel: DIFFICULTY_LABELS[recipe.difficulty] || '',
        durationText: formatDuration(recipe.prepTime),
        isInShoppingList: shoppingIds.includes(recipe.id),
        loading: false,
        error: '',
      });
    } else {
      this.setData({ loading: false, error: '菜谱不存在' });
    }
  },

  /** 编辑菜谱 */
  editRecipe() {
    wx.navigateTo({ url: `/pages/recipe/edit?id=${this.data.recipe!.id}` });
  },

  /** 删除菜谱 */
  deleteRecipe() {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${this.data.recipe!.name}"吗？此操作不可恢复。`,
      confirmColor: '#FA5151',
      success: (res) => {
        if (res.confirm) {
          deleteRecipe(this.data.recipe!.id);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1000);
        }
      },
    });
  },

  /** 加入/移出购物清单 */
  toggleShoppingList() {
    const recipe = this.data.recipe!;
    if (this.data.isInShoppingList) {
      removeFromShoppingList(recipe.id);
      this.setData({ isInShoppingList: false });
      wx.showToast({ title: '已移出购物清单', icon: 'none' });
    } else {
      addToShoppingList(recipe.id);
      this.setData({ isInShoppingList: true });
      wx.showToast({ title: '已加入购物清单', icon: 'success' });
    }
  },

  /** 分享 */
  onShareAppMessage() {
    const recipe = this.data.recipe;
    return {
      title: recipe ? `${recipe.name} — 我的菜谱` : '我的菜谱',
      path: recipe ? `/pages/recipe/detail?id=${recipe.id}` : '/pages/index/index',
    };
  },
});
