export interface SepoliaTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  blockNumber: number;
  timestamp: number;
  input: string;
  status: number;
}

export interface SepoliaTransactionWithDetails extends SepoliaTransaction {
  formattedValue: string;
  formattedGasFee: string;
  formattedTimestamp: string;
  isContractCreation: boolean;
  hasInputData: boolean;
}

export interface UseSepoliaTransactionsResult {
  transactions: SepoliaTransactionWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export interface SepoliaHookOptions {
  pageSize?: number;
  enabled?: boolean;
  txHash?: string;
}
