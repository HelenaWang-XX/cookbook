/** 图片压缩服务 */
import { IMAGE_COMPRESS } from '../constants/limits';

interface CompressResult {
  filePath: string;
  size: number;
}

/**
 * 选择图片并压缩
 */
export function chooseAndCompressImage(): Promise<CompressResult | null> {
  return new Promise((resolve) => {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        compressImage(res.tempFilePaths[0]).then(resolve);
      },
      fail: () => resolve(null),
    });
  });
}

/**
 * 压缩单张图片
 */
export function compressImage(tempPath: string): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: tempPath,
      quality: IMAGE_COMPRESS.quality,
      compressedWidth: IMAGE_COMPRESS.maxWidth,
      success: (res) => {
        const fs = wx.getFileSystemManager();
        fs.getFileInfo({
          filePath: res.tempFilePath,
          success: (info: any) => {
            resolve({ filePath: res.tempFilePath, size: info.size });
          },
          fail: () => resolve({ filePath: res.tempFilePath, size: 0 }),
        });
      },
      fail: () => {
        // 压缩失败则用原图
        const fs = wx.getFileSystemManager();
        fs.getFileInfo({
          filePath: tempPath,
          success: (info: any) => resolve({ filePath: tempPath, size: info.size }),
          fail: () => reject(new Error('图片处理失败')),
        });
      },
    });
  });
}

/**
 * 保存图片到用户目录
 */
export function saveImageToLocal(tempPath: string, targetPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    try {
      fs.saveFileSync(tempPath, targetPath);
      resolve(targetPath);
    } catch (e) {
      // 目录不存在则先创建
      const dir = targetPath.substring(0, targetPath.lastIndexOf('/'));
      try {
        fs.mkdirSync(dir, true);
        fs.saveFileSync(tempPath, targetPath);
        resolve(targetPath);
      } catch (e2) {
        reject(e2);
      }
    }
  });
}

/**
 * 删除图片
 */
export function removeImage(filePath: string): boolean {
  if (!filePath) return false;
  try {
    const fs = wx.getFileSystemManager();
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 将临时图片压缩并保存到永久目录
 */
export async function compressAndSave(
  tempPath: string,
  savePath: string
): Promise<string> {
  const compressed = await compressImage(tempPath);
  return saveImageToLocal(compressed.filePath, savePath);
}
