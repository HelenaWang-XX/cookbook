/** 简易 UUID v4 生成器 */
export function uid(): string {
  const hex = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      s += '-';
    } else if (i === 14) {
      s += '4';
    } else if (i === 19) {
      s += hex[(Math.random() * 4) | 8];
    } else {
      s += hex[(Math.random() * 16) | 0];
    }
  }
  return s;
}
