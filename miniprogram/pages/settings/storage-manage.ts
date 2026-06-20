/** 存储管理页 */
import { storageService } from '../../services/storage.service';
import { getAllRecipes } from '../../services/recipe.service';
import { STORAGE_MAX_BYTES } from '../../constants/limits';

Page({
  data: {
    usedMB: '0',
    totalMB: (STORAGE_MAX_BYTES / 1024 / 1024).toFixed(0),
    ratio: 0,
    recipeCount: 0,
    showWarning: false,
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const used = await storageService.getUsage();
    const ratio = used / STORAGE_MAX_BYTES;
    this.setData({
      usedMB: (used / 1024 / 1024).toFixed(1),
      ratio: Math.round(ratio * 100),
      recipeCount: getAllRecipes().length,
      showWarning: ratio > 0.8,
    });
  },

  /** 清理步骤图 */
  onClearStepImages() {
    wx.showModal({
      title: '清理所有步骤图',
      content: '这将删除所有菜谱的步骤图片（不删除封面图），确定继续？',
      confirmColor: '#FA5151',
      success: async (res) => {
        if (res.confirm) {
          try {
            const fs = wx.getFileSystemManager();
            const stepDir = `${wx.env.USER_DATA_PATH}/images/steps`;
            try {
              const files = fs.readdirSync(stepDir);
              files.forEach((f) => {
                try { fs.unlinkSync(`${stepDir}/${f}`); } catch {}
              });
            } catch {}
            wx.showToast({ title: '已清理', icon: 'success' });
            this.loadData();
          } catch {
            wx.showToast({ title: '清理失败', icon: 'none' });
          }
        }
      },
    });
  },

  /** 导出菜谱数据 */
  onExport() {
    const recipes = getAllRecipes();
    const data = JSON.stringify(recipes, null, 2);
    wx.setClipboardData({
      data,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板，请粘贴保存到安全位置', icon: 'none', duration: 3000 });
      },
    });
  },

  /** 导入菜谱数据 */
  onImport() {
    wx.showModal({
      title: '导入菜谱',
      content: '将从剪贴板读取 JSON 数据并合并导入。已有同名菜谱会保留，导入前建议先导出备份。',
      confirmColor: '#07C160',
      success: (res) => {
        if (res.confirm) {
          wx.getClipboardData({
            success: (clipRes) => {
              try {
                const data = JSON.parse(clipRes.data);
                if (!Array.isArray(data)) throw new Error('格式错误');
                const existing = getAllRecipes();
                const existingNames = new Set(existing.map((r) => r.name));
                const newRecipes = data.filter((r: any) => r.name && !existingNames.has(r.name));
                const merged = [...existing, ...newRecipes];
                storageService.set('recipes', merged);
                const app = getApp<IAppOption>();
                if (app) app.globalData.storageVersion++;
                wx.showToast({ title: `导入了 ${newRecipes.length} 道菜谱`, icon: 'success' });
              } catch {
                wx.showToast({ title: '剪贴板数据格式不正确', icon: 'none' });
              }
            },
          });
        }
      },
    });
  },
});
