import React, { useMemo } from 'react';
import { BarChart3, ArrowUpDown, Flame, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useTransfers, useBurns, useFreezes, useUnfreezes, useStatistics } from '../hooks/useGraphQL';
import { TransactionType } from '../types';
import { formatTokenValue, formatNumber } from '../utils/formatting';
import StatCard from './StatCard';
import TransactionList from './TransactionList';

const Dashboard: React.FC = () => {
  // 获取各类型数据
  const { data: transfersData, loading: transfersLoading, refetch: refetchTransfers } = useTransfers(20);
  const { data: burnsData, loading: burnsLoading, refetch: refetchBurns } = useBurns(20);
  const { data: freezesData, loading: freezesLoading, refetch: refetchFreezes } = useFreezes(20);
  const { data: unfreezesData, loading: unfreezesLoading, refetch: refetchUnfreezes } = useUnfreezes(20);
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useStatistics();

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

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchTransfers(),
      refetchBurns(),
      refetchFreezes(),
      refetchUnfreezes(),
      refetchStats()
    ]);
  };

  const isLoading = transfersLoading || burnsLoading || freezesLoading || unfreezesLoading || statsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">YD Token Dashboard</h1>
                <p className="text-sm text-gray-500">Real-time on-chain data</p>
              </div>
            </div>
            
            <button
              onClick={handleRefreshAll}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Transfers"
            value={statistics ? formatNumber(statistics.totalTransfers) : '0'}
            icon={ArrowUpDown}
            iconColor="text-blue-500"
            loading={statsLoading}
          />
          
          <StatCard
            title="Total Burned"
            value={statistics ? `${formatTokenValue(statistics.totalBurnedValue)} YD` : '0 YD'}
            icon={Flame}
            iconColor="text-red-500"
            loading={statsLoading}
          />
          
          <StatCard
            title="Currently Frozen"
            value={statistics ? `${formatTokenValue(statistics.netFrozenValue)} YD` : '0 YD'}
            icon={Lock}
            iconColor="text-yellow-500"
            loading={statsLoading}
          />
          
          <StatCard
            title="Transfer Volume"
            value={statistics ? `${formatTokenValue(statistics.totalTransferVolume)} YD` : '0 YD'}
            icon={BarChart3}
            iconColor="text-green-500"
            loading={statsLoading}
          />
        </div>

        {/* Transaction Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TransactionList
              title="Recent Transfers"
              type={TransactionType.TRANSFER}
              transfers={transfersData?.transfers || []}
              loading={transfersLoading}
            />
            
            <TransactionList
              title="Recent Burns"
              type={TransactionType.BURN}
              burns={burnsData?.burns || []}
              loading={burnsLoading}
            />
          </div>
          
          <div className="space-y-6">
            <TransactionList
              title="Recent Freezes"
              type={TransactionType.FREEZE}
              freezes={freezesData?.freezes || []}
              loading={freezesLoading}
            />
            
            <TransactionList
              title="Recent Unfreezes"
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
              Powered by The Graph Protocol
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Data updates every 30 seconds</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;