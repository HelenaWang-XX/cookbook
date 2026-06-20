/** 购物清单页 */
import type { MergedIngredient } from '../../types/ingredient';
import { generateShoppingList, formatMergedAmount, toggleChecked, clearChecked } from '../../services/shopping-list.service';
import { clearShoppingList, removeFromShoppingList } from '../../services/recipe.service';

Page({
  data: {
    mergedList: [] as MergedIngredient[],
    allChecked: false,
    loading: true,
  },

  onShow() {
    const list = generateShoppingList();
    const allChecked = list.length > 0 && list.every((i) => i.checked);
    this.setData({ mergedList: list, allChecked, loading: false });
  },

  /** 勾选/取消 */
  onToggleItem(e: WechatMiniprogram.CustomEvent) {
    const name = e.currentTarget.dataset.name;
    const checked = !e.currentTarget.dataset.checked;
    toggleChecked(name, checked);
    const list = generateShoppingList();
    const allChecked = list.length > 0 && list.every((i) => i.checked);
    this.setData({ mergedList: list, allChecked });
  },

  /** 全选/取消全选 */
  onToggleAll() {
    const newState = !this.data.allChecked;
    this.data.mergedList.forEach((item) => {
      if (item.checked !== newState) {
        toggleChecked(item.canonicalName, newState);
      }
    });
    const list = generateShoppingList();
    this.setData({ mergedList: list, allChecked: newState });
  },

  /** 清空所有勾选 */
  onClearChecked() {
    wx.showModal({
      title: '清空勾选',
      content: '确定要清除所有勾选状态吗？',
      success: (res) => {
        if (res.confirm) {
          clearChecked();
          const list = generateShoppingList();
          this.setData({ mergedList: list, allChecked: false });
        }
      },
    });
  },

  /** 清空购物清单 */
  onClearAll() {
    wx.showModal({
      title: '清空清单',
      content: '确定要清空整个购物清单吗？这会移除所有选中的菜谱。',
      confirmColor: '#FA5151',
      success: (res) => {
        if (res.confirm) {
          clearShoppingList();
          this.setData({ mergedList: [], allChecked: false });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  },

  /** 查看合并来源 */
  showMergeLog(e: WechatMiniprogram.CustomEvent) {
    const canonicalName = e.currentTarget.dataset.name;
    wx.navigateTo({ url: `/pages/shopping-list/merge-log?name=${canonicalName}` });
  },

  /** 去修改数量 */
  goToEdit() {
    wx.navigateTo({ url: '/pages/shopping-list/edit' });
  },
});
