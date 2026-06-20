/** 首页 Dashboard */
import { getRecentRecipes, getRecipeCount, getCategoryStats, getShoppingListIds } from '../../services/recipe.service';
import { generateShoppingList } from '../../services/shopping-list.service';
import type { Recipe } from '../../types/recipe';
import { CATEGORIES } from '../../constants/categories';

Page({
  data: {
    recentRecipes: [] as Recipe[],
    recipeCount: 0,
    shoppingListCount: 0,
    categoryStats: [] as { key: string; label: string; icon: string; count: number; color: string }[],
    loading: true,
    error: '',
    storageVersion: 0,
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    try {
      const recipes = getRecentRecipes(6);
      const stats = getCategoryStats();
      const shoppingIds = getShoppingListIds();

      const categoryStats = CATEGORIES.map((cat) => ({
        key: cat.key,
        label: cat.label,
        icon: cat.icon,
        count: stats[cat.key] || 0,
        color: cat.color,
      }));

      this.setData({
        recentRecipes: recipes,
        recipeCount: getRecipeCount(),
        shoppingListCount: shoppingIds.length,
        categoryStats,
        loading: false,
        error: '',
      });
    } catch (e) {
      this.setData({ loading: false, error: '数据加载失败' });
    }
  },

  /** 跳转菜谱详情 */
  goToDetail(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/recipe/detail?id=${id}` });
  },

  /** 跳转分类浏览 */
  goToCategory(e: WechatMiniprogram.CustomEvent) {
    const key = e.currentTarget.dataset.key;
    wx.switchTab({ url: `/pages/browse/browse?category=${key}` });
  },

  /** 新增菜谱 */
  goToAdd() {
    wx.navigateTo({ url: '/pages/recipe/edit' });
  },

  /** 打开购物清单 */
  goToShoppingList() {
    wx.navigateTo({ url: '/pages/shopping-list/list' });
  },

  /** 网页导入 */
  goToImport() {
    wx.navigateTo({ url: '/pages/import/web-extract' });
  },

  /** 下拉刷新 */
  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },
});
