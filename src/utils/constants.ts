// The Graph子图端点
export const GRAPH_URL = 'https://api.studio.thegraph.com/query/119001/yd-graph/version/latest';

// 分页配置
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// 刷新间隔（毫秒）
export const AUTO_REFRESH_INTERVAL = 30000; // 30秒

// 代币精度（假设18位小数）
export const TOKEN_DECIMALS = 18;

// 区块链浏览器URL模板
export const ETHERSCAN_TX_URL = 'https://etherscan.io/tx/';
export const ETHERSCAN_ADDRESS_URL = 'https://etherscan.io/address/';

// 本地存储键
export const STORAGE_KEYS = {
  THEME: 'yd-dashboard-theme',
  SETTINGS: 'yd-dashboard-settings',
  FAVORITES: 'yd-dashboard-favorites'
} as const;