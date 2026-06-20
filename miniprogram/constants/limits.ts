/** 限制常量 */

/** 存储警告阈值 (80%) */
export const STORAGE_WARN_THRESHOLD = 0.8;

/** 存储上限 10MB */
export const STORAGE_MAX_BYTES = 10 * 1024 * 1024;

/** 图片压缩参数 */
export const IMAGE_COMPRESS = {
  quality: 70,
  maxWidth: 800,
  targetSizeKB: 40,
} as const;

/** 最大封面图数量 */
export const MAX_COVER_IMAGES = 150;

/** 最大步骤图数量 */
export const MAX_STEP_IMAGES = 500;
