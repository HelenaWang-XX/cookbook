/** 豆果美食 (douguo.com) 解析器 */

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {string} url
 * @param {string} html
 */
function parseDouguo($, url, html) {
  const name = $('.recipe-title h1, h1.recipe-name, h1').first().text().trim();

  const ingredients = [];
  $('.reci-tag .item, .ingredients .item, .material li').each((i, el) => {
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
  $('.stepcont, .step-item, .steps li').each((i, el) => {
    const desc = $(el).text().trim();
    if (desc) {
      const img = $(el).find('img').attr('src') || null;
      steps.push({ order: i + 1, description: desc, imageUrl: img });
    }
  });

  const coverImageUrl = $('.recipe-cover img, .cover img').first().attr('src') || null;

  return {
    name,
    ingredients,
    steps,
    coverImageUrl,
    sourceUrl: url,
    sourceName: '豆果美食',
    prepTime: null,
    servings: null,
  };
}

module.exports = { parseDouguo };
