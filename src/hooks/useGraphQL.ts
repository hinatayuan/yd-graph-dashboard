import { useState, useEffect, useCallback } from 'react';
import { GRAPH_URL } from '../utils/constants';
import type { GraphQLResponse } from '../types';

interface UseGraphQLOptions {
  variables?: Record<string, any>;
  skip?: boolean;
  pollInterval?: number;
}

interface UseGraphQLResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGraphQL<T = any>(
  query: string, 
  options: UseGraphQLOptions = {}
): UseGraphQLResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!options.skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (options.skip) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(GRAPH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: options.variables || {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('GraphQL fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, options.variables, options.skip]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 轮询功能
  useEffect(() => {
    if (options.pollInterval && !options.skip) {
      const interval = setInterval(fetchData, options.pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.pollInterval, options.skip]);

  return { data, loading, error, refetch };
}

// 专用钩子：获取转账数据
export function useTransfers(first: number = 10, skip: number = 0) {
  return useGraphQL(`
    query GetTransfers($first: Int!, $skip: Int!) {
      transfers(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
        id
        from
        to
        value
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `, { variables: { first, skip } });
}

// 专用钩子：获取销毁数据
export function useBurns(first: number = 10, skip: number = 0) {
  return useGraphQL(`
    query GetBurns($first: Int!, $skip: Int!) {
      burns(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
        id
        from
        value
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `, { variables: { first, skip } });
}

// 专用钩子：获取冻结数据
export function useFreezes(first: number = 10, skip: number = 0) {
  return useGraphQL(`
    query GetFreezes($first: Int!, $skip: Int!) {
      freezes(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
        id
        from
        value
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `, { variables: { first, skip } });
}

// 专用钩子：获取解冻数据
export function useUnfreezes(first: number = 10, skip: number = 0) {
  return useGraphQL(`
    query GetUnfreezes($first: Int!, $skip: Int!) {
      unfreezes(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
        id
        from
        value
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `, { variables: { first, skip } });
}

// 专用钩子：获取统计数据
export function useStatistics() {
  return useGraphQL(`
    query GetStatistics {
      transfers(first: 1000, orderBy: blockTimestamp, orderDirection: desc) {
        value
      }
      burns(first: 1000, orderBy: blockTimestamp, orderDirection: desc) {
        value
      }
      freezes(first: 1000, orderBy: blockTimestamp, orderDirection: desc) {
        value
      }
      unfreezes(first: 1000, orderBy: blockTimestamp, orderDirection: desc) {
        value
      }
    }
  `, { pollInterval: 60000 }); // 每分钟更新一次统计数据
}