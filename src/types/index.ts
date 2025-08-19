// 基础实体接口
export interface BaseEntity {
  id: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

// 转账记录
export interface Transfer extends BaseEntity {
  from: string;
  to: string;
  value: string;
}

// 销毁记录
export interface Burn extends BaseEntity {
  from: string;
  value: string;
}

// 冻结记录
export interface Freeze extends BaseEntity {
  from: string;
  value: string;
}

// 解冻记录
export interface Unfreeze extends BaseEntity {
  from: string;
  value: string;
}

// GraphQL响应类型
export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

// 查询响应类型
export interface TransfersResponse {
  transfers: Transfer[];
}

export interface BurnsResponse {
  burns: Burn[];
}

export interface FreezesResponse {
  freezes: Freeze[];
}

export interface UnfreezesResponse {
  unfreezes: Unfreeze[];
}

// 统计数据类型
export interface Statistics {
  totalTransfers: number;
  totalBurns: number;
  totalFreezes: number;
  totalUnfreezes: number;
  totalVolume: string;
  totalBurnedValue: string;
  totalFrozenValue: string;
}

// 事务类型枚举
export enum TransactionType {
  TRANSFER = 'transfer',
  BURN = 'burn',
  FREEZE = 'freeze',
  UNFREEZE = 'unfreeze'
}

// 排序选项
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// 筛选选项
export interface FilterOptions {
  type: TransactionType | 'all';
  address?: string;
  minValue?: string;
  maxValue?: string;
  startDate?: Date;
  endDate?: Date;
}

// 分页信息
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}