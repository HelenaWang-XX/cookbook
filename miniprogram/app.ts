/** 个人菜谱管理小程序 — App 入口 */

/** 从本地读取购物清单选中的菜谱 ID */
function loadShoppingListIds(): void {
  try {
    const ids = wx.getStorageSync('shopping_list_ids');
    const app = getApp<IAppOption>();
    if (Array.isArray(ids)) {
      app.globalData.shoppingListIds = ids;
    }
  } catch {
    getApp<IAppOption>().globalData.shoppingListIds = [];
  }
}

App<IAppOption>({
  globalData: {
    storageVersion: 0,
    isOnline: true,
    shoppingListIds: [],
  },

  onLaunch() {
    wx.onNetworkStatusChange((res) => {
      getApp<IAppOption>().globalData.isOnline = res.isConnected;
    });

    wx.getNetworkType({
      success: (res) => {
        getApp<IAppOption>().globalData.isOnline = res.networkType !== 'none';
      },
    });

    loadShoppingListIds();
  },

  onShow() {
    loadShoppingListIds();
  },
});
