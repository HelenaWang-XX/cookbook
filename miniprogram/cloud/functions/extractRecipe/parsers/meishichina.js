/** 美食天下 (meishichina.com) 解析器 */

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {string} url
 * @param {string} html
 */
function parseMeishichina($, url, html) {
  const name = $('#recipe_title, .recipe-title h1, h1').first().text().trim();

  const ingredients = [];
  $('.recipe_ingredients ul li, #ingredients li, .ingredients li').each((i, el) => {
    const raw = $(el).text().trim();
    if (raw && !raw.includes('主料') && !raw.includes('辅料') && !raw.includes('调料')) {
      const parts = raw.split(/\s+/);
      if (parts.length >= 2) {
        ingredients.push({ name: parts[0], amount: parts.slice(1).join(' ') });
      } else {
        ingredients.push({ name: raw, amount: '' });
      }
    }
  });

  const steps = [];
  $('.recipe_step .content, #steps .step, .step .content').each((i, el) => {
    const desc = $(el).text().trim();
    if (desc) {
      const img = $(el).find('img').attr('src') || null;
      steps.push({ order: i + 1, description: desc, imageUrl: img });
    }
  });

  const coverImageUrl = $('.recipe_cover img, #recipe_img img').first().attr('src') || null;

  return {
    name,
    ingredients,
    steps,
    coverImageUrl,
    sourceUrl: url,
    sourceName: '美食天下',
    prepTime: null,
    servings: null,
  };
}

module.exports = { parseMeishichina };
