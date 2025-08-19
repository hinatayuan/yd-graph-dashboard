# YD Graph Dashboard

一个基于React+TypeScript的现代化仪表板应用，用于实时显示YD Token的链上数据。数据来源于The Graph子图，提供转账、销毁、冻结、解冻等操作的可视化展示。

![YD Dashboard](https://img.shields.io/badge/React-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-blue.svg)
![The Graph](https://img.shields.io/badge/The_Graph-Protocol-purple.svg)

## 🚀 功能特性

- **📊 实时数据展示** - 自动从The Graph子图获取最新的链上数据
- **💰 多类型交易** - 支持展示转账、销毁、冻结、解冻四种交易类型
- **📱 响应式设计** - 完美适配桌面端和移动端设备
- **🎨 现代化UI** - 使用Tailwind CSS构建的美观界面
- **⚡ 高性能** - TypeScript确保类型安全，优化的数据处理
- **🔗 区块链集成** - 一键跳转到Etherscan查看详细信息
- **📋 地址复制** - 快速复制地址到剪贴板
- **🔄 自动刷新** - 数据定时自动更新

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **样式框架**: Tailwind CSS
- **图标库**: Lucide React
- **数据源**: The Graph Protocol
- **构建工具**: Create React App
- **代码规范**: ESLint + TypeScript

## 📦 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/hinatayuan/yd-graph-dashboard.git
cd yd-graph-dashboard

# 安装依赖
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

构建文件将输出到 `build/` 目录

## 📊 数据源配置

项目使用The Graph子图作为数据源，子图端点配置在 `src/utils/constants.ts`:

```typescript
export const GRAPH_URL = 'https://api.studio.thegraph.com/query/119001/yd-graph/version/latest';
```

### 支持的数据类型

| 类型 | 描述 | 图标 |
|------|------|------|
| Transfer | 代币转账交易 | ↕️ |
| Burn | 代币销毁交易 | 🔥 |
| Freeze | 代币冻结交易 | 🔒 |
| Unfreeze | 代币解冻交易 | 🔓 |

## 🎨 界面预览

### 仪表板主页
- 📈 统计卡片显示关键指标
- 📋 交易列表实时更新
- 🎯 直观的数据可视化

### 交易详情
- 🏷️ 交易类型标识
- 📍 发送方和接收方地址
- 💰 交易金额和时间
- 🔗 Etherscan链接

## 🔧 自定义配置

### 修改刷新间隔

在 `src/utils/constants.ts` 中修改：

```typescript
export const AUTO_REFRESH_INTERVAL = 30000; // 30秒
```

### 修改代币精度

```typescript
export const TOKEN_DECIMALS = 18; // 18位小数
```

### 修改分页大小

```typescript
export const DEFAULT_PAGE_SIZE = 10; // 每页显示10条
```

## 📱 响应式设计

应用采用移动优先的响应式设计：

- **手机端** (< 768px): 单列布局
- **平板端** (768px - 1024px): 双列布局  
- **桌面端** (> 1024px): 四列布局

## 🚀 部署指南

### Vercel 部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Netlify 部署

```bash
# 构建项目
npm run build

# 上传build目录到Netlify
```

### GitHub Pages 部署

```bash
# 安装gh-pages
npm install --save-dev gh-pages

# 添加到package.json
"homepage": "https://yourusername.github.io/yd-graph-dashboard",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# 部署
npm run deploy
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [The Graph](https://thegraph.com/) - 区块链数据索引协议
- [React](https://reactjs.org/) - 用户界面库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript超集
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Lucide React](https://lucide.dev/) - 图标库

## 📞 联系方式

如果您有任何问题或建议，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/hinatayuan/yd-graph-dashboard/issues)
- Email: [your-email@example.com](mailto:your-email@example.com)

---

⭐ 如果这个项目对您有帮助，请给它一个星标！