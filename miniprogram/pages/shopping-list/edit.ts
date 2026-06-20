/** 编辑购物清单 — 管理加入的菜谱 */
import { getShoppingListIds, removeFromShoppingList, getAllRecipes } from '../../services/recipe.service';
import type { Recipe } from '../../types/recipe';

Page({
  data: {
    recipes: [] as Recipe[],
  },

  onShow() {
    const ids = getShoppingListIds();
    const all = getAllRecipes();
    const recipes = all.filter((r) => ids.includes(r.id));
    this.setData({ recipes });
  },

  removeRecipe(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    removeFromShoppingList(id);
    this.onShow();
    wx.showToast({ title: '已移除', icon: 'none' });
  },
});
