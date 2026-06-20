/** 食材标准化服务 */
import type { Ingredient, IngredientCategory } from '../types/recipe';
import type { IngredientAlias } from '../types/ingredient';
import { BUILTIN_ALIASES, buildAliasMap } from '../constants/ingredient-aliases';
import { normalizeUnit } from '../constants/unit-normalization';
import { uid } from '../utils/uid';
import { storageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

/** 初始化别名查找表 */
let aliasMap = buildAliasMap(BUILTIN_ALIASES);

/** 加载自定义别名并合并 */
export function loadAliases(): void {
  const custom = storageService.get<IngredientAlias[]>(STORAGE_KEYS.CUSTOM_ALIASES) || [];
  const merged = [...BUILTIN_ALIASES, ...custom];
  aliasMap = buildAliasMap(merged);
}

/** 获取当前别名表 */
export function getAliasMap(): Map<string, { canonicalName: string; unit: string; category: string }> {
  return aliasMap;
}

/** 添加自定义别名 */
export function addCustomAlias(alias: IngredientAlias): void {
  const custom = storageService.get<IngredientAlias[]>(STORAGE_KEYS.CUSTOM_ALIASES) || [];
  const idx = custom.findIndex((a) => a.canonicalName === alias.canonicalName);
  if (idx >= 0) {
    custom[idx] = alias;
  } else {
    custom.push(alias);
  }
  storageService.set(STORAGE_KEYS.CUSTOM_ALIASES, custom);
  loadAliases();
}

/** 删除自定义别名 */
export function removeCustomAlias(canonicalName: string): void {
  const custom = storageService.get<IngredientAlias[]>(STORAGE_KEYS.CUSTOM_ALIASES) || [];
  const filtered = custom.filter((a) => a.canonicalName !== canonicalName);
  storageService.set(STORAGE_KEYS.CUSTOM_ALIASES, filtered);
  loadAliases();
}

/** 获取所有别名（内置+自定义） */
export function getAllAliases(): IngredientAlias[] {
  const custom = storageService.get<IngredientAlias[]>(STORAGE_KEYS.CUSTOM_ALIASES) || [];
  return [...BUILTIN_ALIASES, ...custom];
}

/**
 * 从原始食材文本中解析名称、数量和单位
 * 例如: "鸡蛋2个" → { name: "鸡蛋", quantity: 2, unit: "个", amount: "2个" }
 *       "盐适量" → { name: "盐", quantity: null, unit: null, amount: "适量" }
 *       "生抽 15ml" → { name: "生抽", quantity: 15, unit: "ml", amount: "15ml" }
 */
export function parseIngredientRaw(raw: string): { name: string; quantity: number | null; unit: string | null; amount: string } {
  let working = raw.trim();

  // 1. 去除末尾括号内内容
  working = working.replace(/[（(][^）)]*[）)]$/, '').trim();

  // 2. 尝试提取末尾的数量+单位: 数字 + 单位
  const qtyPattern = /([\d.]+)\s*(克|g|G|千克|kg|KG|斤|两|毫升|ml|ML|升|L|个|颗|只|条|块|片|根|瓣|把|勺|汤匙|大勺|小勺|大匙|小匙|茶匙|杯|包|盒|罐|袋|张|朵|节|颗|ml|g|kg|l|L)\s*$/;
  const qtyMatch = working.match(qtyPattern);
  if (qtyMatch) {
    const name = working.substring(0, qtyMatch.index!).trim();
    const qty = parseFloat(qtyMatch[1]);
    const rawUnit = qtyMatch[2];
    const unit = normalizeUnit(rawUnit);
    return { name, quantity: isNaN(qty) ? null : qty, unit, amount: `${qty}${unit || rawUnit}` };
  }

  // 3. 检查末尾是否只有数字（无单位）
  const numPattern = /([\d.]+)\s*$/;
  const numMatch = working.match(numPattern);
  if (numMatch) {
    const name = working.substring(0, numMatch.index!).trim();
    const qty = parseFloat(numMatch[1]);
    return { name, quantity: isNaN(qty) ? null : qty, unit: null, amount: `${qty}` };
  }

  // 4. 检查"适量"/"少许"
  if (/适量/.test(working)) {
    const name = working.replace(/适量/g, '').trim();
    return { name, quantity: null, unit: null, amount: '适量' };
  }
  if (/少许/.test(working)) {
    const name = working.replace(/少许/g, '').trim();
    return { name, quantity: null, unit: null, amount: '少许' };
  }

  // 5. 无法解析，直接返回
  return { name: working, quantity: null, unit: null, amount: working };
}

/**
 * 标准化单个食材：解析 → 别名查表 → 返回 Ingredient
 */
export function normalizeIngredient(raw: string, existing?: Partial<Ingredient>): Ingredient {
  const parsed = parseIngredientRaw(raw);
  const canonical = aliasMap.get(parsed.name);

  return {
    id: existing?.id || uid(),
    canonicalName: canonical?.canonicalName || parsed.name,
    amount: parsed.amount,
    quantity: parsed.quantity,
    unit: parsed.unit || canonical?.unit || null,
    category: (canonical?.category || existing?.category || 'other') as IngredientCategory,
    notes: existing?.notes || '',
  };
}

/**
 * 批量标准化食材列表
 */
export function normalizeIngredients(raws: string[]): Ingredient[] {
  return raws.map((r) => normalizeIngredient(r));
}

// 初始化加载别名
loadAliases();
