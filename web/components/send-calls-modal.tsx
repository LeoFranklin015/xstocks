"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "@/app/providers";
import { DUMMY_RECIPIENT } from "@/lib/constants";
import { Modal } from "./modal";

interface BatchCall {
  to: string;
  value: string;
}

interface SendCallsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SendCallsModal({ open, onClose }: SendCallsModalProps) {
  const { account } = useAccount();

  const [recipient, setRecipient] = useState<string>(DUMMY_RECIPIENT);
  const [amount, setAmount] = useState("0.0001");
  const [txHash, setTxHash] = useState<string | null>(null);

  const [batchCalls, setBatchCalls] = useState<BatchCall[]>([
    { to: DUMMY_RECIPIENT, value: "0.0001" },
  ]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account) return null;

  const handleSendTransaction = async () => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const hash = await account.sendTransaction([
        { to: recipient as `0x${string}`, value: parseEther(amount) },
      ]);
      setTxHash(hash);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstimateGas = async () => {
    setIsLoading(true);
    setError(null);
    setGasEstimate(null);
    try {
      const gas = await account.estimateGas([
        { to: recipient as `0x${string}`, value: parseEther(amount) },
      ]);
      setGasEstimate(gas.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gas estimation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const addBatchCall = () => {
    setBatchCalls([...batchCalls, { to: DUMMY_RECIPIENT, value: "0.0001" }]);
  };

  const removeBatchCall = (index: number) => {
    if (batchCalls.length <= 1) return;
    setBatchCalls(batchCalls.filter((_, i) => i !== index));
  };

  const updateBatchCall = (index: number, field: keyof BatchCall, value: string) => {
    const updated = [...batchCalls];
    updated[index] = { ...updated[index], [field]: value };
    setBatchCalls(updated);
  };

  const handleBatchCalls = async () => {
    setIsLoading(true);
    setError(null);
    setBatchId(null);
    setBatchStatus(null);
    try {
      const calls = batchCalls.map((c) => ({
        to: c.to as `0x${string}`,
        value: parseEther(c.value),
      }));
      const { id } = await account.sendCalls(calls);
      setBatchId(id);

      const poll = setInterval(() => {
        const status = account.getCallStatus(id);
        if (status) {
          setBatchStatus(
            status.status === 200
              ? "Confirmed"
              : status.status === 100
                ? "Pending"
                : status.status === 400
                  ? "Failed"
                  : status.status === 500
                    ? "Reverted"
                    : `Unknown (${status.status})`
          );
          if (status.status !== 100) clearInterval(poll);
        }
      }, 2000);
      setTimeout(() => clearInterval(poll), 60000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch calls failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Wallet Calls">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "single"
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Single Call
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "batch"
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Batch Calls
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {activeTab === "single" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                Recipient
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                Amount (ETH)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSendTransaction}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
              <button
                onClick={handleEstimateGas}
                disabled={isLoading}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 disabled:opacity-50"
              >
                Estimate
              </button>
            </div>

            {txHash && (
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <p className="mb-1 text-xs font-medium text-emerald-400">Transaction Hash</p>
                <code className="break-all font-mono text-xs text-zinc-300">{txHash}</code>
              </div>
            )}

            {gasEstimate && (
              <div className="rounded-lg bg-amber-500/10 p-3">
                <p className="mb-1 text-xs font-medium text-amber-400">Gas Estimate</p>
                <code className="font-mono text-xs text-zinc-300">{gasEstimate}</code>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">
                {batchCalls.length} call{batchCalls.length > 1 ? "s" : ""}
              </p>
              <button
                onClick={addBatchCall}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/15"
              >
                +
              </button>
            </div>

            <div className="space-y-2">
              {batchCalls.map((call, index) => (
                <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-500">
                      Call #{index + 1}
                    </span>
                    {batchCalls.length > 1 && (
                      <button
                        onClick={() => removeBatchCall(index)}
                        className="text-[11px] text-red-400 transition-colors hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={call.to}
                      onChange={(e) => updateBatchCall(index, "to", e.target.value)}
                      placeholder="0x..."
                      className="w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-xs text-white placeholder-zinc-600 outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={call.value}
                      onChange={(e) => updateBatchCall(index, "value", e.target.value)}
                      placeholder="0.0001"
                      className="w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-xs text-white placeholder-zinc-600 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleBatchCalls}
              disabled={isLoading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : `Send ${batchCalls.length} Call${batchCalls.length > 1 ? "s" : ""}`}
            </button>

            {batchId && (
              <div className="rounded-lg bg-violet-500/10 p-3">
                <p className="mb-1 text-xs font-medium text-violet-400">Batch ID</p>
                <code className="break-all font-mono text-xs text-zinc-300">{batchId}</code>
                {batchStatus && (
                  <p className="mt-2 text-xs">
                    <span className="text-zinc-500">Status: </span>
                    <span
                      className={
                        batchStatus === "Confirmed"
                          ? "text-emerald-400"
                          : batchStatus === "Pending"
                            ? "text-amber-400"
                            : "text-red-400"
                      }
                    >
                      {batchStatus}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
