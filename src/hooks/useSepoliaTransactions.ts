import { useState, useEffect } from "react";
import { ethers } from "ethers";
import type {
  SepoliaTransaction,
  SepoliaTransactionWithDetails,
  UseSepoliaTransactionsResult,
  SepoliaHookOptions,
} from "../types/sepolia";
import { SEPOLIA_RPC_URL } from "../utils/constants";

function formatEther(wei: string): string {
  try {
    return parseFloat(ethers.formatEther(wei)).toFixed(6);
  } catch {
    return "0.000000";
  }
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function calculateGasFee(gasPrice: string, gasUsed: string): string {
  try {
    const fee = BigInt(gasPrice) * BigInt(gasUsed);
    return parseFloat(ethers.formatEther(fee.toString())).toFixed(8);
  } catch {
    return "0.00000000";
  }
}

function enhanceTransaction(
  tx: SepoliaTransaction
): SepoliaTransactionWithDetails {
  return {
    ...tx,
    formattedValue: formatEther(tx.value),
    formattedGasFee: calculateGasFee(tx.gasPrice, tx.gasUsed),
    formattedTimestamp: formatTimestamp(tx.timestamp),
    isContractCreation: tx.to === null || tx.to === "",
    hasInputData: tx.input !== "0x" && tx.input.length > 2,
  };
}

export function useSepoliaTransactions(
  options: SepoliaHookOptions = {}
): UseSepoliaTransactionsResult {
  const { enabled = true, txHash } = options;

  const [transactions, setTransactions] = useState<
    SepoliaTransactionWithDetails[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = async () => {
    if (!txHash) {
      setError("未提供交易哈希");
      return;
    }

    console.log("===== 获取特定交易详情 =====", txHash);
    setLoading(true);
    setError(null);

    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

      // 获取交易详情
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        throw new Error("交易不存在");
      }

      // 获取交易收据
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error("无法获取交易收据");
      }

      // 获取区块信息以获取时间戳
      const block = await provider.getBlock(tx.blockNumber!);

      const transaction: SepoliaTransaction = {
        hash: tx.hash,
        from: tx.from || "",
        to: tx.to || "",
        value: tx.value.toString(),
        gasPrice: tx.gasPrice?.toString() || "0",
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: tx.blockNumber || 0,
        timestamp: block?.timestamp || 0,
        input: tx.data,
        status: receipt.status || 0,
      };

      const enhancedTransaction = enhanceTransaction(transaction);
      setTransactions([enhancedTransaction]);
      setLoading(false);
    } catch (err) {
      console.error("===== 获取特定交易失败 =====", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch transaction";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const refetch = async () => {
    console.log("手动刷新请求，重新获取数据");
    setTransactions([]);
    setError(null);
    setLoading(true);
    await fetchTransaction();
  };

  useEffect(() => {
    console.log("===== useEffect 触发 =====", { enabled, txHash });

    if (enabled && txHash) {
      fetchTransaction();
    }
  }, [txHash]); // 只依赖txHash

  return {
    transactions,
    loading,
    error,
    refetch,
    hasMore: false,
    loadMore: () => Promise.resolve(),
  };
}
