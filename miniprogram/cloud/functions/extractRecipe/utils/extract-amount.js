/** 从食材文本中提取数量和单位 */

/**
 * @param {string} raw
 * @returns {{ name: string, quantity: number|null, unit: string|null, amount: string }}
 */
function extractAmount(raw) {
  let working = raw.trim();

  // 去除括号内容
  working = working.replace(/[（(][^）)]*[）)]$/, '').trim();

  // 数字 + 单位
  const qtyPattern = /([\d./]+)\s*(克|g|G|千克|kg|KG|斤|两|毫升|ml|ML|升|L|个|颗|只|条|块|片|根|瓣|把|勺|汤匙|大勺|小勺|大匙|小匙|茶匙|杯|包|盒|罐|袋|张|朵|节|ml|g|kg|l|L)\s*$/;
  const qtyMatch = working.match(qtyPattern);
  if (qtyMatch) {
    const name = working.substring(0, qtyMatch.index).trim();
    const qty = parseFloat(qtyMatch[1]);
    const unit = qtyMatch[2];
    return { name, quantity: isNaN(qty) ? null : qty, unit, amount: `${qty}${unit}` };
  }

  // 只有数字
  const numPattern = /([\d.]+)\s*$/;
  const numMatch = working.match(numPattern);
  if (numMatch) {
    const name = working.substring(0, numMatch.index).trim();
    const qty = parseFloat(numMatch[1]);
    return { name, quantity: isNaN(qty) ? null : qty, unit: null, amount: `${qty}` };
  }

  // 适量/少许
  if (/适量/.test(working)) {
    return { name: working.replace(/适量/g, '').trim(), quantity: null, unit: null, amount: '适量' };
  }
  if (/少许/.test(working)) {
    return { name: working.replace(/少许/g, '').trim(), quantity: null, unit: null, amount: '少许' };
  }

  return { name: working, quantity: null, unit: null, amount: working };
}

module.exports = { extractAmount };
