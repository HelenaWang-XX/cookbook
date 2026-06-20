/** 网页菜谱抓取云函数 */
const cloud = require('wx-server-sdk');
const got = require('got');
const cheerio = require('cheerio');
const { parseXiachufang } = require('./parsers/xiachufang');
const { parseMeishichina } = require('./parsers/meishichina');
const { parseDouguo } = require('./parsers/douguo');
const { parseGeneric } = require('./parsers/generic');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

/**
 * 根据 hostname 选择解析器
 */
function getParser(url) {
  const hostname = new URL(url).hostname;
  if (hostname.includes('xiachufang')) return parseXiachufang;
  if (hostname.includes('meishichina')) return parseMeishichina;
  if (hostname.includes('douguo')) return parseDouguo;
  return parseGeneric;
}

exports.main = async (event) => {
  const { url } = event;
  if (!url) {
    return { success: false, error: '缺少 url 参数' };
  }

  try {
    // 抓取 HTML
    const response = await got(url, {
      timeout: { request: 15000 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    const html = response.body;
    const $ = cheerio.load(html);

    // 选择对应站点的解析器
    const parser = getParser(url);
    const parsed = parser($, url, html);

    if (!parsed || !parsed.name) {
      return { success: false, error: '无法解析该页面的菜谱信息，请尝试其他链接或手动录入' };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (e) {
    console.error('抓取失败:', e.message);
    if (e.response && e.response.statusCode === 404) {
      return { success: false, error: '页面不存在 (404)' };
    }
    if (e.code === 'ENOTFOUND' || e.code === 'EAI_AGAIN') {
      return { success: false, error: '无法连接到该网站，请检查链接' };
    }
    return { success: false, error: `抓取失败: ${e.message}` };
  }
};
