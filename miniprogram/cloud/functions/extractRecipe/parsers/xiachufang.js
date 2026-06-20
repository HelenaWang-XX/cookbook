/** 下厨房 (xiachufang.com) 解析器 */

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {string} url
 * @param {string} html
 */
function parseXiachufang($, url, html) {
  // 尝试从 JSON-LD 提取
  const ldJson = $('script[type="application/ld+json"]').html();
  if (ldJson) {
    try {
      const parsed = JSON.parse(ldJson);
      if (parsed && parsed.name) {
        const ingredients = (parsed.recipeIngredient || []).map((raw) => {
          const match = raw.match(/^(.+?)\s*([\d.]+.*)$/);
          if (match) {
            return { name: match[1].trim(), amount: match[2].trim() };
          }
          return { name: raw.trim(), amount: '' };
        });

        const steps = (parsed.recipeInstructions || []).map((inst, idx) => ({
          order: idx + 1,
          description: typeof inst === 'string' ? inst : inst.text || '',
          imageUrl: typeof inst === 'object' ? inst.image || null : null,
        }));

        return {
          name: parsed.name,
          ingredients,
          steps,
          coverImageUrl: (parsed.image && parsed.image.url) || parsed.image || null,
          sourceUrl: url,
          sourceName: '下厨房',
          prepTime: parsed.totalTime || null,
          servings: parsed.recipeYield ? parseInt(parsed.recipeYield) : null,
        };
      }
    } catch {}
  }

  // 回退到 CSS 选择器
  const name = $('h1.recipe-title, .page-title, h1.title').first().text().trim();

  const ingredients = [];
  $('.ings tr, .ingredient-list li, [itemprop="recipeIngredient"]').each((i, el) => {
    const raw = $(el).text().trim();
    if (raw) {
      const match = raw.match(/^(.+?)\s*([\d.]+.*)$/);
      if (match) {
        ingredients.push({ name: match[1].trim(), amount: match[2].trim() });
      } else {
        ingredients.push({ name: raw, amount: '' });
      }
    }
  });

  const steps = [];
  $('.steps ol li, .step li, [itemprop="recipeInstructions"] li, .step-word').each((i, el) => {
    const desc = $(el).text().trim();
    if (desc) {
      const img = $(el).find('img').attr('src') || null;
      steps.push({ order: i + 1, description: desc, imageUrl: img });
    }
  });

  const coverImageUrl = $('.cover-img img, .recipe-cover img, [itemprop="image"]').first().attr('src') || null;

  return {
    name,
    ingredients,
    steps,
    coverImageUrl,
    sourceUrl: url,
    sourceName: '下厨房',
    prepTime: null,
    servings: null,
  };
}

module.exports = { parseXiachufang };
