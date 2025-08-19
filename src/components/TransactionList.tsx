import React, { useState } from 'react';
import { ArrowUpDown, Flame, Lock, Unlock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Transfer, Burn, Freeze, Unfreeze, TransactionType } from '../types';
import { formatTokenValue, formatRelativeTime, formatTxHash } from '../utils/formatting';
import { ETHERSCAN_TX_URL } from '../utils/constants';
import AddressFormatter from './AddressFormatter';

interface TransactionListProps {
  transfers?: Transfer[];
  burns?: Burn[];
  freezes?: Freeze[];
  unfreezes?: Unfreeze[];
  loading?: boolean;
  title: string;
  type: TransactionType;
}

type TransactionItem = Transfer | Burn | Freeze | Unfreeze;

const TransactionList: React.FC<TransactionListProps> = ({
  transfers = [],
  burns = [],
  freezes = [],
  unfreezes = [],
  loading = false,
  title,
  type
}) => {
  const [expanded, setExpanded] = useState(true);

  const getTransactions = (): TransactionItem[] => {
    switch (type) {
      case TransactionType.TRANSFER:
        return transfers;
      case TransactionType.BURN:
        return burns;
      case TransactionType.FREEZE:
        return freezes;
      case TransactionType.UNFREEZE:
        return unfreezes;
      default:
        return [...transfers, ...burns, ...freezes, ...unfreezes]
          .sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));
    }
  };

  const getIcon = () => {
    switch (type) {
      case TransactionType.TRANSFER:
        return <ArrowUpDown size={16} className="text-blue-500" />;
      case TransactionType.BURN:
        return <Flame size={16} className="text-red-500" />;
      case TransactionType.FREEZE:
        return <Lock size={16} className="text-yellow-500" />;
      case TransactionType.UNFREEZE:
        return <Unlock size={16} className="text-green-500" />;
      default:
        return <ArrowUpDown size={16} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (transaction: TransactionItem): string => {
    if ('to' in transaction) return 'Transfer';
    if ('from' in transaction && !('to' in transaction)) {
      if (type === TransactionType.FREEZE) return 'Freeze';
      if (type === TransactionType.UNFREEZE) return 'Unfreeze';
      return 'Burn';
    }
    return 'Unknown';
  };

  const handleTxClick = (txHash: string) => {
    window.open(`${ETHERSCAN_TX_URL}${txHash}`, '_blank', 'noopener,noreferrer');
  };

  const transactions = getTransactions();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">({transactions.length})</span>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {expanded && (
        <div className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-32 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="mb-2">{getIcon()}</div>
              <p>No {title.toLowerCase()} found</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {getIcon()}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getTypeLabel(transaction)}
                        </span>
                        <button
                          onClick={() => handleTxClick(transaction.transactionHash)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          title="View on Etherscan"
                        >
                          <span>{formatTxHash(transaction.transactionHash)}</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span>From:</span>
                          <AddressFormatter 
                            address={transaction.from} 
                            length={4}
                            showCopyButton={false}
                            showExternalLink={false}
                          />
                        </div>
                        
                        {'to' in transaction && (
                          <div className="flex items-center space-x-1">
                            <span>To:</span>
                            <AddressFormatter 
                              address={transaction.to} 
                              length={4}
                              showCopyButton={false}
                              showExternalLink={false}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {formatTokenValue(transaction.value)} YD
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(transaction.blockTimestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionList;