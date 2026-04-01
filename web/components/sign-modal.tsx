"use client";

import { useState } from "react";
import { useAccount } from "@/app/providers";
import { Modal } from "./modal";

interface TypedDataField {
  name: string;
  type: string;
  value: string;
}

interface SignModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignModal({ open, onClose }: SignModalProps) {
  const { account } = useAccount();

  const [activeTab, setActiveTab] = useState<"personal" | "typed">("personal");

  // Personal sign
  const [message, setMessage] = useState("Hello from xStocks!");
  const [signature, setSignature] = useState<string | null>(null);

  // Typed data
  const [domainName, setDomainName] = useState("xStocks");
  const [domainVersion, setDomainVersion] = useState("1");
  const [primaryType, setPrimaryType] = useState("Mail");
  const [fields, setFields] = useState<TypedDataField[]>([
    { name: "from", type: "address", value: "" },
    { name: "content", type: "string", value: "Hello from xStocks" },
  ]);
  const [typedSig, setTypedSig] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account) return null;

  const handlePersonalSign = async () => {
    setIsLoading(true);
    setError(null);
    setSignature(null);
    try {
      const sig = await account.signMessage(message);
      setSignature(sig);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signing failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignTypedData = async () => {
    setIsLoading(true);
    setError(null);
    setTypedSig(null);
    try {
      const types: Record<string, { name: string; type: string }[]> = {
        [primaryType]: fields.map((f) => ({ name: f.name, type: f.type })),
      };
      const messageObj: Record<string, string> = {};
      for (const f of fields) {
        messageObj[f.name] = f.value || (f.type === "address" ? account.address : "");
      }
      const sig = await account.signTypedData({
        domain: { name: domainName, version: domainVersion, chainId: account.chainId },
        types: types as any,
        primaryType,
        message: messageObj,
      });
      setTypedSig(sig);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Typed data signing failed");
    } finally {
      setIsLoading(false);
    }
  };

  const addField = () => setFields([...fields, { name: "", type: "string", value: "" }]);

  const removeField = (index: number) => {
    if (fields.length <= 1) return;
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof TypedDataField, value: string) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  return (
    <Modal open={open} onClose={onClose} title="Sign Message">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "personal"
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Personal Sign
          </button>
          <button
            onClick={() => setActiveTab("typed")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "typed"
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Typed Data
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {activeTab === "personal" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500"
              />
            </div>
            <button
              onClick={handlePersonalSign}
              disabled={isLoading || !message}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Signing..." : "Sign Message"}
            </button>
            {signature && (
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <p className="mb-1 text-xs font-medium text-emerald-400">Signature</p>
                <code className="break-all font-mono text-[11px] text-zinc-300">{signature}</code>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Domain */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Domain</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] text-zinc-500">Name</label>
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-zinc-500">Version</label>
                  <input
                    type="text"
                    value={domainVersion}
                    onChange={(e) => setDomainVersion(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="mb-1 block text-[11px] text-zinc-500">Chain ID</label>
                <input
                  type="text"
                  value={account.chainId}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-sm text-zinc-500"
                />
              </div>
            </div>

            {/* Primary Type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Primary Type</label>
              <input
                type="text"
                value={primaryType}
                onChange={(e) => setPrimaryType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Fields */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Fields</p>
                <button
                  onClick={addField}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-zinc-300 transition-colors hover:bg-white/15"
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">Field #{index + 1}</span>
                      {fields.length > 1 && (
                        <button onClick={() => removeField(index)} className="text-[10px] text-red-400 hover:text-red-300">
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(index, "name", e.target.value)}
                        placeholder="name"
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder-zinc-600 outline-none focus:border-blue-500"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, "type", e.target.value)}
                        className="rounded-md border border-white/10 bg-zinc-800 px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                      >
                        <option value="string">string</option>
                        <option value="address">address</option>
                        <option value="uint256">uint256</option>
                        <option value="bytes32">bytes32</option>
                        <option value="bool">bool</option>
                      </select>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateField(index, "value", e.target.value)}
                        placeholder={field.type === "address" ? "0x..." : "value"}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder-zinc-600 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSignTypedData}
              disabled={isLoading || fields.length === 0}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {isLoading ? "Signing..." : "Sign Typed Data"}
            </button>

            {typedSig && (
              <div className="rounded-lg bg-violet-500/10 p-3">
                <p className="mb-1 text-xs font-medium text-violet-400">Signature</p>
                <code className="break-all font-mono text-[11px] text-zinc-300">{typedSig}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
