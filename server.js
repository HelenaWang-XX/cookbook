/**
 * 共享菜谱服务器 — 启动后局域网内所有设备共用同一份菜谱数据
 * 用法: node server.js
 * 访问: http://你的局域网IP:3456
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const DATA_FILE = path.resolve(__dirname, 'shared_data.json');
const WEB_ROOT = path.resolve(__dirname);

// 读取共享数据
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('读数失败，重置:', e.message);
  }
  return {};
}

// 写入共享数据
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// 静态文件 MIME 类型
const MIME = {
  '.html': 'text/html;charset=utf-8',
  '.js': 'application/javascript;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ====== API 端点 ======
  if (pathname === '/api/data') {
    if (req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(readData()));
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const newData = JSON.parse(body);
          if (req.method === 'PUT') {
            writeData(newData);
          } else {
            // POST: 合并
            const existing = readData();
            const merged = { ...existing, ...newData };
            writeData(merged);
          }
          res.writeHead(200, {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json;charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    // OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }
  }

  // ====== 静态文件 ======
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(WEB_ROOT, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    // HTML 注入：告知前端有可用同步后端
    let data = content;
    if (ext === '.html') {
      data = content.toString().replace('</head>',
        `<script>window.__SERVER_SYNC__=true;window.__SERVER_URL__=window.location.origin;</script></head>`);
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// 初始化空数据文件
if (!fs.existsSync(DATA_FILE)) writeData({});

const { networkInterfaces } = require('os');
const nets = networkInterfaces();
let ip = 'localhost';
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      ip = net.address;
      break;
    }
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🍳 我的菜谱 — 共享服务器已启动`);
  console.log(`──────────────────────────────`);
  console.log(`   电脑:   http://localhost:${PORT}`);
  console.log(`   手机:   http://${ip}:${PORT}`);
  console.log(`   (所有设备共享同一份菜谱数据)`);
  console.log(`──────────────────────────────`);
  console.log(`   按 Ctrl+C 停止服务器\n`);
});
