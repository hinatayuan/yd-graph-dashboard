import { useState, useEffect } from 'react';

// 延迟挂载 Hook，用于避免首次加载时的并发请求
export function useDelayedMount(delay: number = 100): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isMounted;
}

// 错开请求时间的 Hook
export function useStaggeredMount(index: number, baseDelay: number = 50): boolean {
  const delay = baseDelay * index;
  return useDelayedMount(delay);
}