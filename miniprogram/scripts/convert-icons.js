/** 将 SVG 图标转换为 81x81 PNG (tab bar 图标规格) */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.resolve(__dirname, '../assets/icons');
const SVG_FILES = ['home', 'home-active', 'browse', 'browse-active', 'search', 'search-active', 'mine', 'mine-active'];

async function convertAll() {
  for (const name of SVG_FILES) {
    const svgPath = path.join(ICONS_DIR, `${name}.svg`);
    const pngPath = path.join(ICONS_DIR, `${name}.png`);

    if (!fs.existsSync(svgPath)) {
      console.log(`⚠ 跳过 ${name}.svg (文件不存在)`);
      continue;
    }

    try {
      await sharp(svgPath)
        .resize(81, 81)
        .png()
        .toFile(pngPath);
      console.log(`✅ ${name}.png`);
    } catch (err) {
      console.error(`❌ ${name}.png 转换失败:`, err.message);
    }
  }
  console.log('\n完成！共 8 个图标');
}

convertAll();
