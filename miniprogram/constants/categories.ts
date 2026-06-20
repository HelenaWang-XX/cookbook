/** 分类常量定义 */
import type { Category } from '../types/recipe';

export interface CategoryInfo {
  key: Category;
  label: string;
  icon: string;
  color: string;
  bgClass: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'meat', label: '荤菜', icon: '🥩', color: '#E85D3F', bgClass: 'bg-category-meat' },
  { key: 'vegetarian', label: '素菜', icon: '🥬', color: '#4CAF50', bgClass: 'bg-category-vegetarian' },
  { key: 'seafood', label: '海鲜', icon: '🦐', color: '#2196F3', bgClass: 'bg-category-seafood' },
  { key: 'soup', label: '汤羹', icon: '🍲', color: '#FF9800', bgClass: 'bg-category-soup' },
  { key: 'staple', label: '主食', icon: '🍚', color: '#8D6E63', bgClass: 'bg-category-staple' },
  { key: 'dessert', label: '甜品', icon: '🍰', color: '#E91E63', bgClass: 'bg-category-dessert' },
];

export const CATEGORY_MAP: Record<Category, CategoryInfo> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
) as Record<Category, CategoryInfo>;

export const CATEGORY_LABELS: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
) as Record<Category, string>;

/** 难度标签 */
export const DIFFICULTY_LABELS: Record<number, string> = {
  1: '简单',
  2: '中等',
  3: '困难',
};
