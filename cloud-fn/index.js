// CloudBase 云函数 - 菜谱数据同步 API
exports.main = async function(event, context) {
  var { action, data } = event;
  // 简单 KV 存储（CloudBase 自带云函数全局缓存）
  var store = {};
  
  try {
    if (action === 'get') {
      return { code: 0, data: store };
    }
    if (action === 'set') {
      Object.assign(store, data);
      return { code: 0, message: 'ok' };
    }
    return { code: -1, message: 'unknown action' };
  } catch(e) {
    return { code: -1, message: e.message };
  }
};
