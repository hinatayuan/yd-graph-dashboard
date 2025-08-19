import { useState, useEffect, useCallback, useRef } from 'react';
import { GRAPH_URL } from '../utils/constants';
import type { GraphQLResponse } from '../types';

// 简单的内存缓存
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 30 * 1000; // 30秒缓存

// 生成缓存键
function getCacheKey(query: string, variables: Record<string, any>): string {
  return JSON.stringify({ query, variables });
}

// 获取缓存数据
function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key); // 清除过期缓存
  }
  return null;
}

// 设置缓存数据
function setCache<T>(key: string, data: T, duration: number = CACHE_DURATION): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + duration
  });
}

// 请求去重：防止相同请求并发执行
const pendingRequests = new Map<string, Promise<any>>();

// 定期清理过期缓存
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiry) {
      cache.delete(key);
    }
  }
}, 60000); // 每分钟清理一次过期缓存

// 导出清理缓存的函数
export function clearCache(): void {
  cache.clear();
  pendingRequests.clear();
}

// 导出获取缓存状态的函数
export function getCacheStats() {
  return {
    cacheSize: cache.size,
    pendingRequests: pendingRequests.size,
    cacheEntries: Array.from(cache.keys())
  };
}

interface UseGraphQLOptions {
  variables?: Record<string, any>;
  skip?: boolean;
  pollInterval?: number;
  cacheTime?: number; // 缓存时间，毫秒
  staleTime?: number; // 数据过期时间，毫秒
  retries?: number; // 重试次数
  retryDelay?: number; // 重试延迟，毫秒
  timeout?: number; // 请求超时，毫秒
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  const cacheTime = options.cacheTime ?? CACHE_DURATION;
  const staleTime = options.staleTime ?? CACHE_DURATION;
  const retries = options.retries ?? 3;
  const retryDelay = options.retryDelay ?? 1000;
  const timeout = options.timeout ?? 10000;

  const fetchData = useCallback(async (force: boolean = false) => {
    if (options.skip) return;

    const cacheKey = getCacheKey(query, options.variables || {});
    
    // 检查缓存
    if (!force) {
      const cachedData = getFromCache<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        return;
      }
    }

    // 防抖：如果最近有请求，跳过
    const now = Date.now();
    if (now - lastFetchRef.current < 1000 && !force) {
      return;
    }
    lastFetchRef.current = now;

    // 检查是否有相同的请求正在进行
    const existingRequest = pendingRequests.get(cacheKey);
    if (existingRequest && !force) {
      try {
        const result = await existingRequest;
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed');
      }
      setLoading(false);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    const requestPromise = (async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          setLoading(true);
          if (attempt === 0) {
            setError(null); // 只在第一次尝试时清除错误
          }

          // 创建超时控制器
          const timeoutId = setTimeout(() => {
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
          }, timeout);

          const response = await fetch(GRAPH_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              query,
              variables: options.variables || {}
            }),
            signal: abortControllerRef.current!.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            // The Graph API 特殊处理
            if (response.status === 429) {
              throw new Error('Rate limit exceeded. Please wait and try again.');
            }
            if (response.status >= 500) {
              throw new Error(`Server error: ${response.status}. Retrying...`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result: GraphQLResponse<T> = await response.json();

          if (result.errors && result.errors.length > 0) {
            const error = result.errors[0];
            throw new Error(`GraphQL error: ${error.message}`);
          }

          // 成功：缓存数据并返回
          setCache(cacheKey, result.data, cacheTime);
          setData(result.data);
          setError(null);
          return result.data;
          
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');
          
          if (lastError.name === 'AbortError') {
            return; // 请求被取消，不重试
          }
          
          // 如果是最后一次尝试，或者是不应该重试的错误
          if (attempt === retries || lastError.message.includes('Rate limit')) {
            break;
          }
          
          // 等待后重试
          console.warn(`GraphQL request attempt ${attempt + 1} failed:`, lastError.message);
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
      
      // 所有重试都失败了
      if (lastError) {
        setError(lastError.message);
        console.error('All GraphQL fetch attempts failed:', lastError);
        throw lastError;
      }
      
    })().finally(() => {
      setLoading(false);
      pendingRequests.delete(cacheKey);
    });

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }, [query, JSON.stringify(options.variables), options.skip, cacheTime]);

  const refetch = useCallback(async () => {
    await fetchData(true); // 强制刷新，跳过缓存
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    
    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // 轮询功能
  useEffect(() => {
    if (options.pollInterval && !options.skip) {
      const interval = setInterval(() => fetchData(false), options.pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.pollInterval, options.skip]);

  return { data, loading, error, refetch };
}

// 专用钩子：获取转账数据
export function useTransfers(first: number = 10, skip: number = 0, enabled: boolean = true) {
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
  `, { 
    variables: { first, skip },
    skip: !enabled,
    cacheTime: 30000, // 30秒缓存
    staleTime: 15000,  // 15秒内数据认为是新鲜的
    retries: 3,        // 重试3次
    retryDelay: 1000,  // 1秒延迟
    timeout: 15000     // 15秒超时
  });
}

// 专用钩子：获取销毁数据
export function useBurns(first: number = 10, skip: number = 0, enabled: boolean = true) {
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
  `, { 
    variables: { first, skip },
    skip: !enabled,
    cacheTime: 30000,
    staleTime: 15000,
    retries: 3,
    retryDelay: 1000,
    timeout: 15000
  });
}

// 专用钩子：获取冻结数据
export function useFreezes(first: number = 10, skip: number = 0, enabled: boolean = true) {
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
  `, { 
    variables: { first, skip },
    skip: !enabled,
    cacheTime: 30000,
    staleTime: 15000,
    retries: 3,
    retryDelay: 1000,
    timeout: 15000
  });
}

// 专用钩子：获取解冻数据
export function useUnfreezes(first: number = 10, skip: number = 0, enabled: boolean = true) {
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
  `, { 
    variables: { first, skip },
    skip: !enabled,
    cacheTime: 30000,
    staleTime: 15000,
    retries: 3,
    retryDelay: 1000,
    timeout: 15000
  });
}

// 专用钩子：获取统计数据（减少数据量，提高性能）
export function useStatistics(enabled: boolean = true) {
  return useGraphQL(`
    query GetStatistics {
      transfers(first: 500, orderBy: blockTimestamp, orderDirection: desc) {
        value
      }
      burns(first: 500, orderBy: blockTimestamp, orderDirection: desc) {
        value
      }
      freezes(first: 500, orderBy: blockTimestamp, orderDirection: desc) {
        value
      }
      unfreezes(first: 500, orderBy: blockTimestamp, orderDirection: desc) {
        value
      }
    }
  `, { 
    skip: !enabled,
    pollInterval: 120000, // 每2分钟更新一次统计数据
    cacheTime: 60000,     // 1分钟缓存
    staleTime: 30000,     // 30秒内认为数据新鲜
    retries: 2,           // 统计数据重试2次即可
    retryDelay: 2000,     // 2秒延迟
    timeout: 20000        // 20秒超时（统计查询较复杂）
  });
}