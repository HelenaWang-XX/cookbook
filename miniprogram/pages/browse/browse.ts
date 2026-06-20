/** 分类浏览页 */
import { getRecipesByCategory, getAllRecipes } from '../../services/recipe.service';
import type { Recipe, Category } from '../../types/recipe';
import { CATEGORIES, CATEGORY_LABELS } from '../../constants/categories';

Page({
  data: {
    categories: CATEGORIES.map((c) => ({ ...c, active: false })),
    activeCategory: 'all' as string,
    recipes: [] as Recipe[],
    loading: true,
  },

  onLoad(options: Record<string, string>) {
    const category = options.category || 'all';
    this.setData({ activeCategory: category });
    this.updateCategoryActive(category);
    this.loadRecipes(category);
  },

  onShow() {
    const app = getApp<IAppOption>();
    if (app?.globalData.storageVersion !== this._lastVersion) {
      this._lastVersion = app?.globalData.storageVersion || 0;
      this.loadRecipes(this.data.activeCategory);
    }
  },

  _lastVersion: 0,

  /** 切换分类 */
  switchCategory(e: WechatMiniprogram.CustomEvent) {
    const key = e.currentTarget.dataset.key;
    this.setData({ activeCategory: key });
    this.updateCategoryActive(key);
    this.loadRecipes(key);
  },

  updateCategoryActive(key: string) {
    const categories = this.data.categories.map((c) => ({
      ...c,
      active: c.key === key,
    }));
    this.setData({ categories });
  },

  loadRecipes(category: string) {
    let recipes: Recipe[];
    if (category === 'all') {
      recipes = getAllRecipes();
    } else {
      recipes = getRecipesByCategory(category as Category);
    }
    this.setData({ recipes, loading: false });
  },

  /** 跳转详情 */
  goToDetail(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/recipe/detail?id=${id}` });
  },

  /** 新增菜谱 */
  goToAdd() {
    wx.navigateTo({ url: '/pages/recipe/edit' });
  },
});
