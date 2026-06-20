/** 网页导入页 — 输入URL并抓取 */
import { extractRecipeFromUrl } from '../../services/import.service';
import type { ParsedRecipe } from '../../types/recipe';

Page({
  data: {
    url: '',
    loading: false,
    error: '',
    isOnline: true,
  },

  onShow() {
    const app = getApp<IAppOption>();
    this.setData({ isOnline: app?.globalData.isOnline ?? true });
  },

  onUrlInput(e: WechatMiniprogram.Input) {
    this.setData({ url: e.detail.value, error: '' });
  },

  /** 从剪贴板粘贴 */
  onPaste() {
    wx.getClipboardData({
      success: (res) => {
        this.setData({ url: res.data, error: '' });
      },
    });
  },

  /** 开始抓取 */
  async onExtract() {
    const url = this.data.url.trim();
    if (!url) {
      this.setData({ error: '请输入菜谱链接' });
      return;
    }
    if (!url.startsWith('http')) {
      this.setData({ error: '请输入有效的网页链接（以 http:// 或 https:// 开头）' });
      return;
    }
    if (!this.data.isOnline) {
      this.setData({ error: '当前无网络连接，网页导入需要联网' });
      return;
    }

    this.setData({ loading: true, error: '' });

    const result = await extractRecipeFromUrl(url);

    if (result.success && result.data) {
      // 将解析结果编码传入确认页
      const encoded = encodeURIComponent(JSON.stringify(result.data));
      wx.navigateTo({ url: `/pages/import/confirm?data=${encoded}` });
    } else {
      this.setData({
        error: result.error || '抓取失败，请检查链接是否有效',
        loading: false,
      });
    }
  },
});
