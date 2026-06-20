# 我的菜谱 — 微信小程序

个人菜谱管理微信小程序，支持手动录入、网页抓取、分类浏览、双向搜索、智能购物清单合并。

## 技术栈

- 微信原生小程序 (WXML + WXSS + TypeScript)
- weui-miniprogram (微信官方 UI 组件库)
- 微信云函数 (Cloud Base SCF) — 网页抓取

## 项目结构

```
miniprogram/
├── app.ts / app.json / app.wxss    # 小程序入口
├── types/                          # TypeScript 类型定义
├── constants/                      # 常量（分类、别名表、单位映射）
├── services/                       # 服务层（CRUD、标准化、图片压缩）
├── utils/                          # 工具函数
├── pages/                          # 页面
│   ├── index/                      # 首页 Dashboard
│   ├── browse/                     # 分类浏览
│   ├── search/                     # 双向搜索
│   ├── mine/                       # 我的
│   ├── recipe/                     # 菜谱详情、编辑、步骤编辑
│   ├── import/                     # 网页导入
│   ├── shopping-list/              # 购物清单
│   └── settings/                   # 设置（存储管理、别名管理）
├── components/                     # 可复用组件
├── cloud/functions/extractRecipe/  # 网页抓取云函数
└── assets/                         # 图标、默认图片
```

## 快速开始

### 1. 克隆并安装依赖

```bash
cd miniprogram
npm install
```

### 2. 微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram/` 目录
3. 填入你的 AppID（在 project.config.json 中或通过开发者工具设置）
4. 在开发者工具中：工具 → 构建 npm

### 3. 开通云开发（用于网页抓取）

1. 微信开发者工具 → 云开发 → 开通
2. 创建环境
3. 右键 `cloud/functions/extractRecipe/` → 上传并部署：云端安装依赖
4. 在 `app.ts` 中初始化云开发

### 4. 添加 Tab Bar 图标

参见 `miniprogram/assets/README.md`，需要准备 8 个图标文件和一个默认封面图。

## 核心功能

| 功能 | 说明 |
|------|------|
| 📝 菜谱管理 | 手动录入、编辑、删除菜谱 |
| 🔗 网页抓取 | 自动解析下厨房/美食天下/豆果美食等链接 |
| 📂 分类浏览 | 荤菜/素菜/海鲜/汤羹/主食/甜品 |
| 🔍 双向搜索 | 按菜名搜 + 按已有食材搜能做什么 |
| 🛒 购物清单 | 多道菜合并食材，自动汇总采购量 |
| 🏷️ 食材标准化 | 内置 200+ 食材别名，统一名称 |
| 💾 本地存储 | 离线可用，数据存本地 |
| 📸 图片压缩 | 自动压缩上传图片到 30-40KB |
| 📤 数据备份 | 导出/导入菜谱 JSON |

## 待完成

- [ ] 准备 Tab Bar 图标资源
- [ ] 准备默认封面图
- [ ] 配置云开发环境
- [ ] 部署 extractRecipe 云函数
- [ ] 微信小程序审核上线
