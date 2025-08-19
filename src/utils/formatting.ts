import { TOKEN_DECIMALS } from './constants';

// 格式化地址显示
export const formatAddress = (address: string, length: number = 6): string => {
  if (!address) return '';
  if (address.length <= length * 2 + 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

// 格式化代币值
export const formatTokenValue = (value: string, decimals: number = TOKEN_DECIMALS): string => {
  try {
    const bigIntValue = BigInt(value);
    const divisor = BigInt(10 ** decimals);
    const integerPart = bigIntValue / divisor;
    const fractionalPart = bigIntValue % divisor;
    
    if (fractionalPart === BigInt(0)) {
      return formatNumber(integerPart.toString());
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    
    if (trimmedFractional === '') {
      return formatNumber(integerPart.toString());
    }
    
    return `${formatNumber(integerPart.toString())}.${trimmedFractional}`;
  } catch (error) {
    console.error('Error formatting token value:', error);
    return '0';
  }
};

// 格式化数字显示
export const formatNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  
  return num.toLocaleString();
};

// 格式化时间戳
export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
};

// 格式化相对时间
export const formatRelativeTime = (timestamp: string): string => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y ago`;
  } catch (error) {
    return 'Unknown';
  }
};

// 格式化交易哈希
export const formatTxHash = (hash: string, length: number = 10): string => {
  if (!hash) return '';
  if (hash.length <= length * 2 + 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};

// 验证以太坊地址
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// 验证交易哈希
export const isValidTxHash = (hash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};