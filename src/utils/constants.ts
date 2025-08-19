// The Graph子图端点
export const GRAPH_URL = 'https://api.studio.thegraph.com/query/119001/yd-graph/v0.0.1';

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

// Sepolia 测试网配置
export const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/d6150d4bab92441bb828dd5674ec7766';
export const TARGET_ADDRESS = '0xE88b9063227f1B0B40FD0104cdE9d0893dD8A8c7';
export const SEPOLIA_EXPLORER_TX_URL = 'https://sepolia.etherscan.io/tx/';
export const SEPOLIA_EXPLORER_ADDRESS_URL = 'https://sepolia.etherscan.io/address/';


// 本地存储键
export const STORAGE_KEYS = {
  THEME: 'yd-dashboard-theme',
  SETTINGS: 'yd-dashboard-settings',
  FAVORITES: 'yd-dashboard-favorites'
} as const;