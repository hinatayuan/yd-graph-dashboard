import React, { useState } from "react";
import {
  RefreshCw,
  ExternalLink,
  Search,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSepoliaTransactions } from "../hooks/useSepoliaTransactions";
import {
  SEPOLIA_EXPLORER_TX_URL,
  SEPOLIA_EXPLORER_ADDRESS_URL,
} from "../utils/constants";
import { hexToString, isValidHex } from "../utils/hexUtils";

const SepoliaTransactions: React.FC = () => {
  const [showDecodedInput, setShowDecodedInput] = useState<{
    [key: string]: boolean;
  }>({});

  // 使用指定的txHash获取特定交易详情
  const targetTxHash =
    "0xa530800245cb862bdf466ece266231fdd44258bbf88c18a6d7d341f9f149eb4b";

  const { transactions, loading, error, refetch } = useSepoliaTransactions({
    enabled: true,
    txHash: targetTxHash,
  });

  const toggleInputDecoding = (txHash: string) => {
    setShowDecodedInput((prev) => ({
      ...prev,
      [txHash]: !prev[txHash],
    }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Search className="mr-2 h-5 w-5" />
            特定交易详情
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              刷新
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-blue-50">
          <div className="text-sm text-blue-800">
            <div>
              <strong>目标交易哈希:</strong> {targetTxHash}
            </div>
            <div className="mt-1">
              <strong>网络:</strong> Sepolia 测试网
            </div>
            <div className="mt-1 text-xs flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                }`}
              ></div>
              <span className="text-blue-600">
                {loading ? "正在获取交易详情..." : "交易详情已加载"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-red-800 font-medium">获取交易详情失败</div>
              <div className="text-red-600 text-sm mt-1">{error}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">正在获取交易详情...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">未找到交易详情</div>
        ) : (
          <>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600">
                        {tx.formattedTimestamp}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm ${
                          tx.status === 1 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.status === 1 ? "成功" : "失败"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">从</div>
                      <div className="flex items-center">
                        <span className="font-mono text-sm">
                          {formatAddress(tx.from)}
                        </span>
                        <a
                          href={`${SEPOLIA_EXPLORER_ADDRESS_URL}${tx.from}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">到</div>
                      <div className="flex items-center">
                        {tx.isContractCreation ? (
                          <span className="font-mono text-sm text-purple-600">
                            [合约创建]
                          </span>
                        ) : (
                          <>
                            <span className="font-mono text-sm">
                              {formatAddress(tx.to)}
                            </span>
                            <a
                              href={`${SEPOLIA_EXPLORER_ADDRESS_URL}${tx.to}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">转账金额</div>
                      <div className="font-mono text-sm font-medium">
                        {tx.formattedValue} ETH
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Gas费用</div>
                      <div className="font-mono text-sm">
                        {tx.formattedGasFee} ETH
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">区块高度</div>
                      <div className="font-mono text-sm">#{tx.blockNumber}</div>
                    </div>
                  </div>

                  {tx.hasInputData && (
                    <div className="mt-3 border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-500">Input Data</div>
                        <button
                          onClick={() => toggleInputDecoding(tx.hash)}
                          className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {showDecodedInput[tx.hash] ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              显示原始数据
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              解析为文本
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border">
                        {showDecodedInput[tx.hash] ? (
                          <div>
                            <div className="font-mono text-xs break-all text-gray-700 mb-2">
                              <strong>解析结果:</strong>
                            </div>
                            <div className="bg-white p-2 rounded border font-mono text-xs break-all text-green-700">
                              {isValidHex(tx.input)
                                ? hexToString(tx.input)
                                : "无法解析为文本"}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              <strong>原始数据:</strong>
                            </div>
                            <div className="font-mono text-xs break-all text-gray-600 mt-1">
                              {tx.input}
                            </div>
                          </div>
                        ) : (
                          <div className="font-mono text-xs break-all text-gray-700">
                            {tx.input}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <span>交易哈希: {formatAddress(tx.hash)}</span>
                      <a
                        href={`${SEPOLIA_EXPLORER_TX_URL}${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SepoliaTransactions;
