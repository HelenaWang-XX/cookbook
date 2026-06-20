/** 我的页面 */
import { getRecipeCount, getCategoryStats } from '../../services/recipe.service';
import { getShoppingListIds } from '../../services/recipe.service';
import { storageService } from '../../services/storage.service';

Page({
  data: {
    recipeCount: 0,
    shoppingListCount: 0,
    storageRatio: 0,
    showStorageWarning: false,
  },

  onShow() {
    this.loadStats();
  },

  loadStats() {
    this.setData({
      recipeCount: getRecipeCount(),
      shoppingListCount: getShoppingListIds().length,
    });
    this.loadStorageUsage();
  },

  async loadStorageUsage() {
    const ratio = await storageService.getUsageRatio();
    this.setData({
      storageRatio: Math.round(ratio * 100),
      showStorageWarning: ratio > 0.8,
    });
  },

  /** 购物清单 */
  goToShoppingList() {
    wx.navigateTo({ url: '/pages/shopping-list/list' });
  },

  /** 存储管理 */
  goToStorageManage() {
    wx.navigateTo({ url: '/pages/settings/storage-manage' });
  },

  /** 别名管理 */
  goToAliasManage() {
    wx.navigateTo({ url: '/pages/settings/alias-manage' });
  },

  /** 关于 */
  goToAbout() {
    wx.navigateTo({ url: '/pages/settings/about' });
  },

  /** 新建菜谱 */
  goToAdd() {
    wx.navigateTo({ url: '/pages/recipe/edit' });
  },
});
