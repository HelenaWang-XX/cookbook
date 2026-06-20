/** 食材别名管理页 */
import { getAllAliases, addCustomAlias, removeCustomAlias } from '../../services/ingredient-normalizer';
import type { IngredientAlias } from '../../types/ingredient';

Page({
  data: {
    aliases: [] as IngredientAlias[],
  },

  onShow() {
    this.setData({ aliases: getAllAliases() });
  },

  onDelete(e: WechatMiniprogram.CustomEvent) {
    const name = e.currentTarget.dataset.name;
    wx.showModal({
      title: '删除别名',
      content: `确定删除「${name}」的别名映射吗？`,
      confirmColor: '#FA5151',
      success: (res) => {
        if (res.confirm) {
          removeCustomAlias(name);
          this.setData({ aliases: getAllAliases() });
        }
      },
    });
  },

  onAdd() {
    wx.showModal({
      title: '添加别名',
      editable: true,
      placeholderText: '格式：标准名称=别名1,别名2',
      success: (res) => {
        if (res.confirm && res.content) {
          const parts = res.content.split('=');
          if (parts.length === 2) {
            const canonicalName = parts[0].trim();
            const aliases = parts[1].split(/[,，]/).map((a) => a.trim()).filter(Boolean);
            if (canonicalName && aliases.length > 0) {
              addCustomAlias({ canonicalName, aliases, unit: '个', category: 'other' });
              this.setData({ aliases: getAllAliases() });
              wx.showToast({ title: '已添加', icon: 'success' });
            } else {
              wx.showToast({ title: '格式有误', icon: 'none' });
            }
          } else {
            wx.showToast({ title: '格式有误，请用 = 分隔', icon: 'none' });
          }
        }
      },
    });
  },
});
