/** 通用解析器 — 基于 schema.org JSON-LD + meta 标签 */

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {string} url
 * @param {string} html
 */
function parseGeneric($, url, html) {
  // 尝试 JSON-LD
  const ldJsons = [];
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      ldJsons.push(JSON.parse($(el).html()));
    } catch {}
  });

  for (const ld of ldJsons) {
    // 处理 @graph 结构
    const items = ld['@graph'] || [ld];
    for (const item of items) {
      if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
        const name = item.name || '';
        const ingredients = (item.recipeIngredient || []).map((raw) => {
          const match = raw.match(/^(.+?)\s*([\d.]+.*)$/);
          if (match) return { name: match[1].trim(), amount: match[2].trim() };
          return { name: raw.trim(), amount: '' };
        });
        const steps = (item.recipeInstructions || []).map((inst, idx) => ({
          order: idx + 1,
          description: typeof inst === 'string' ? inst : inst.text || '',
          imageUrl: typeof inst === 'object' ? inst.image || null : null,
        }));
        const coverImageUrl = (item.image && item.image.url) || (Array.isArray(item.image) ? item.image[0] : item.image) || null;

        return {
          name,
          ingredients,
          steps,
          coverImageUrl: typeof coverImageUrl === 'string' ? coverImageUrl : null,
          sourceUrl: url,
          sourceName: new URL(url).hostname,
          prepTime: item.totalTime || null,
          servings: item.recipeYield ? parseInt(item.recipeYield) : null,
        };
      }
    }
  }

  // JSON-LD 解析失败，尝试 meta 标签
  const name = $('meta[property="og:title"]').attr('content')
    || $('title').text()
    || $('h1').first().text().trim();

  const coverImageUrl = $('meta[property="og:image"]').attr('content')
    || $('img').first().attr('src')
    || null;

  return {
    name,
    ingredients: [],
    steps: [],
    coverImageUrl,
    sourceUrl: url,
    sourceName: new URL(url).hostname,
    prepTime: null,
    servings: null,
  };
}

module.exports = { parseGeneric };
