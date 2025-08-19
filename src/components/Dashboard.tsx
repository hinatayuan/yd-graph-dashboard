import React, { useMemo, useCallback } from 'react';
import { BarChart3, ArrowUpDown, Flame, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useTransfers, useBurns, useFreezes, useUnfreezes, useStatistics } from '../hooks/useGraphQL';
import { useStaggeredMount } from '../hooks/useDelayedMount';
import { TransactionType } from '../types';
import { formatTokenValue, formatNumber } from '../utils/formatting';
import StatCard from './StatCard';
import TransactionList from './TransactionList';

const Dashboard: React.FC = () => {
  // 添加数据获取控制开关
  const [enableDataFetch, setEnableDataFetch] = React.useState(false);
  
  // 错开请求时间，避免并发冲突
  const isTransfersReady = useStaggeredMount(0, 0) && enableDataFetch;    // 立即加载
  const isBurnsReady = useStaggeredMount(1, 100) && enableDataFetch;      // 100ms 后
  const isFreezesReady = useStaggeredMount(2, 200) && enableDataFetch;    // 200ms 后
  const isUnfreezesReady = useStaggeredMount(3, 300) && enableDataFetch;  // 300ms 后
  const isStatsReady = useStaggeredMount(4, 400) && enableDataFetch;      // 400ms 后

  // 获取各类型数据（有条件加载）
  const { data: transfersData, loading: transfersLoading, refetch: refetchTransfers } = useTransfers(20, 0, isTransfersReady);
  const { data: burnsData, loading: burnsLoading, refetch: refetchBurns } = useBurns(20, 0, isBurnsReady);
  const { data: freezesData, loading: freezesLoading, refetch: refetchFreezes } = useFreezes(20, 0, isFreezesReady);
  const { data: unfreezesData, loading: unfreezesLoading, refetch: refetchUnfreezes } = useUnfreezes(20, 0, isUnfreezesReady);
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useStatistics(isStatsReady);

  // 首先定义加载状态
  const isLoading = transfersLoading || burnsLoading || freezesLoading || unfreezesLoading || statsLoading;

  // 计算统计数据
  const statistics = useMemo(() => {
    if (!statsData) return null;

    const totalTransferVolume = statsData.transfers?.reduce((sum: bigint, transfer: any) => {
      return sum + BigInt(transfer.value);
    }, BigInt(0)) || BigInt(0);

    const totalBurnedValue = statsData.burns?.reduce((sum: bigint, burn: any) => {
      return sum + BigInt(burn.value);
    }, BigInt(0)) || BigInt(0);

    const totalFrozenValue = statsData.freezes?.reduce((sum: bigint, freeze: any) => {
      return sum + BigInt(freeze.value);
    }, BigInt(0)) || BigInt(0);

    const totalUnfrozenValue = statsData.unfreezes?.reduce((sum: bigint, unfreeze: any) => {
      return sum + BigInt(unfreeze.value);
    }, BigInt(0)) || BigInt(0);

    return {
      totalTransfers: statsData.transfers?.length || 0,
      totalBurns: statsData.burns?.length || 0,
      totalFreezes: statsData.freezes?.length || 0,
      totalUnfreezes: statsData.unfreezes?.length || 0,
      totalTransferVolume: totalTransferVolume.toString(),
      totalBurnedValue: totalBurnedValue.toString(),
      totalFrozenValue: totalFrozenValue.toString(),
      totalUnfrozenValue: totalUnfrozenValue.toString(),
      netFrozenValue: (totalFrozenValue - totalUnfrozenValue).toString()
    };
  }, [statsData]);

  const handleRefreshAll = useCallback(async () => {
    // 限流：防止用户频繁点击刷新
    if (isLoading) return;
    
    if (enableDataFetch) {
      await Promise.all([
        refetchTransfers(),
        refetchBurns(),
        refetchFreezes(),
        refetchUnfreezes(),
        refetchStats()
      ]);
    }
  }, [isLoading, enableDataFetch, refetchTransfers, refetchBurns, refetchFreezes, refetchUnfreezes, refetchStats]);
  
  const handleToggleDataFetch = useCallback(() => {
    setEnableDataFetch(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">BNB 代币仪表盘</h1>
                <p className="text-sm text-gray-500">实时链上数据</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleToggleDataFetch}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                  enableDataFetch 
                    ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                    : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                }`}
              >
                {enableDataFetch ? '停止数据获取' : '启用数据获取'}
              </button>
              
              <button
                onClick={handleRefreshAll}
                disabled={isLoading || !enableDataFetch}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新数据
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="转账总数"
            value={statistics ? formatNumber(statistics.totalTransfers) : '0'}
            icon={ArrowUpDown}
            iconColor="text-blue-500"
            loading={statsLoading}
          />
          
          <StatCard
            title="销毁总量"
            value={statistics ? `${formatTokenValue(statistics.totalBurnedValue)} BNB` : '0 BNB'}
            icon={Flame}
            iconColor="text-red-500"
            loading={statsLoading}
          />
          
          <StatCard
            title="当前冻结"
            value={statistics ? `${formatTokenValue(statistics.netFrozenValue)} BNB` : '0 BNB'}
            icon={Lock}
            iconColor="text-yellow-500"
            loading={statsLoading}
          />
          
          <StatCard
            title="交易量"
            value={statistics ? `${formatTokenValue(statistics.totalTransferVolume)} BNB` : '0 BNB'}
            icon={BarChart3}
            iconColor="text-green-500"
            loading={statsLoading}
          />
        </div>

        {/* Transaction Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TransactionList
              title="最近转账"
              type={TransactionType.TRANSFER}
              transfers={transfersData?.transfers || []}
              loading={transfersLoading}
            />
            
            <TransactionList
              title="最近销毁"
              type={TransactionType.BURN}
              burns={burnsData?.burns || []}
              loading={burnsLoading}
            />
          </div>
          
          <div className="space-y-6">
            <TransactionList
              title="最近冻结"
              type={TransactionType.FREEZE}
              freezes={freezesData?.freezes || []}
              loading={freezesLoading}
            />
            
            <TransactionList
              title="最近解冻"
              type={TransactionType.UNFREEZE}
              unfreezes={unfreezesData?.unfreezes || []}
              loading={unfreezesLoading}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              由 The Graph 协议提供支持
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>数据缓存30秒，统计数据每2分钟更新</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  !enableDataFetch ? 'bg-gray-400' :
                  isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                }`}></div>
                <span>
                  {!enableDataFetch ? '已暂停' : isLoading ? '加载中' : '实时'}
                </span>
              </div>
              {enableDataFetch && (
                <span className="text-xs text-orange-600">
                  ⚠️ The Graph API 请求已启用
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;