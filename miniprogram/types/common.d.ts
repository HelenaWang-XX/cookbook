/** 通用类型定义 */

/** API 响应包装 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** 带总数的列表响应 */
export interface ListResponse<T> {
  items: T[];
  total: number;
}

/** 页面通用 data 类型 */
export interface PageData {
  loading: boolean;
  error: string;
}

/** 全局 App 类型 */
declare global {
  interface IAppOption {
    globalData: {
      storageVersion: number;
      isOnline: boolean;
      shoppingListIds: string[];
    };
  }
}

export {};
