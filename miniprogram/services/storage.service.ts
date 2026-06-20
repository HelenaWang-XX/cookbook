/** 本地存储服务 — 封装 wx Storage API */
import { STORAGE_MAX_BYTES } from '../constants/limits';

class StorageService {
  /** 读取 JSON 数据 */
  get<T>(key: string): T | null {
    try {
      const raw = wx.getStorageSync(key);
      if (raw === '' || raw === undefined || raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`[StorageService] 读取 ${key} 失败:`, e);
      return null;
    }
  }

  /** 写入 JSON 数据 */
  set<T>(key: string, value: T): boolean {
    try {
      wx.setStorageSync(key, JSON.stringify(value));
      return true;
    } catch (e: any) {
      // 存储空间不足
      if (e?.errMsg?.includes('storage')) {
        console.error(`[StorageService] 存储空间不足，写入 ${key} 失败`);
        this.clearOldImages();
        // 重试一次
        try {
          wx.setStorageSync(key, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      }
      console.error(`[StorageService] 写入 ${key} 失败:`, e);
      return false;
    }
  }

  /** 删除数据 */
  remove(key: string): boolean {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.error(`[StorageService] 删除 ${key} 失败:`, e);
      return false;
    }
  }

  /** 获取当前存储使用量 (bytes) */
  getUsage(): Promise<number> {
    return new Promise((resolve) => {
      wx.getStorageInfo({
        success: (res) => resolve(res.currentSize * 1024),
        fail: () => resolve(0),
      });
    });
  }

  /** 获取存储使用率 (0-1) */
  async getUsageRatio(): Promise<number> {
    const used = await this.getUsage();
    return used / STORAGE_MAX_BYTES;
  }

  /** 存储空间满时清理旧步骤图 */
  private clearOldImages(): void {
    try {
      const fs = wx.getFileSystemManager();
      const userPath = wx.env.USER_DATA_PATH;
      const stepDir = `${userPath}/images/steps`;
      try {
        const files = fs.readdirSync(stepDir);
        if (files.length > 0) {
          const oldest = files.sort()[0];
          fs.unlinkSync(`${stepDir}/${oldest}`);
        }
      } catch { /* 目录可能不存在 */ }
    } catch { /* 静默失败 */ }
  }
}

export const storageService = new StorageService();
