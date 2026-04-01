"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME_FULL } from "@/lib/constants";

const TERMS_KEY = "xstream_terms_accepted";
const TERMS_VERSION = "2";

const termsSections = [
  {
    title: "Protocol Risk",
    content:
      "xStream Markets is experimental software deployed on blockchain networks. Smart contracts may contain bugs or vulnerabilities. You acknowledge that interacting with the protocol carries inherent risk of partial or total loss of funds. The protocol has not been formally verified and may behave unexpectedly under edge-case conditions.",
  },
  {
    title: "No Financial Advice",
    content:
      "Nothing on this platform constitutes financial, investment, legal, or tax advice. dx and px tokens are protocol-native instruments -- not securities, not investment contracts. You are solely responsible for your own decisions. Past performance of any asset or strategy does not indicate future results.",
  },
  {
    title: "Jurisdiction",
    content:
      "You confirm that you are not a resident of, or accessing this platform from, any jurisdiction where the use of decentralized finance protocols is prohibited or restricted. You are responsible for compliance with your local laws, including but not limited to tax reporting obligations.",
  },
  {
    title: "No Guarantees",
    content:
      "The protocol is provided as-is with no warranty of any kind, express or implied. Projected yields, APY figures, and price data are informational only and not guaranteed. The protocol team makes no representations regarding uptime, availability, or accuracy of displayed data.",
  },
  {
    title: "Eligibility",
    content:
      "You represent that you are at least 18 years of age (or the age of majority in your jurisdiction) and have the legal capacity to enter into these terms. If you are using the protocol on behalf of an entity, you represent that you have authority to bind that entity.",
  },
  {
    title: "Intellectual Property",
    content:
      "All intellectual property rights in the protocol interface, branding, documentation, and associated materials are owned by or licensed to xStream Markets. You may not copy, modify, distribute, or create derivative works from the platform without explicit written permission.",
  },
  {
    title: "Privacy & Data",
    content:
      "The protocol interface may collect wallet addresses, transaction data, and usage analytics. On-chain transactions are publicly visible by nature. We do not sell personal data to third parties. By using the protocol, you consent to the collection of anonymized usage metrics for the purpose of improving the platform.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by applicable law, xStream Markets and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or funds, arising out of your use of the protocol.",
  },
  {
    title: "Indemnification",
    content:
      "You agree to indemnify, defend, and hold harmless xStream Markets, its contributors, affiliates, and service providers from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your use of the protocol or violation of these terms.",
  },
  {
    title: "Amendments",
    content:
      "We reserve the right to modify these terms at any time. Material changes will be communicated via the protocol interface. Continued use of the platform after changes constitutes acceptance of the revised terms. You will be prompted to re-accept terms when significant changes are made.",
  },
  {
    title: "Governing Law",
    content:
      "These terms shall be governed by and construed in accordance with applicable law, without regard to conflict-of-law principles. Any disputes arising from or relating to these terms or your use of the protocol shall be resolved through binding arbitration in accordance with applicable arbitration rules.",
  },
];

export default function TermsGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TERMS_KEY);
      setAccepted(stored === TERMS_VERSION);
    } catch {
      setAccepted(false);
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem(TERMS_KEY, TERMS_VERSION);
    } catch {
      // storage unavailable, continue anyway
    }
    setAccepted(true);
  }

  // Loading state
  if (accepted === null) {
    return null;
  }

  if (accepted) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl rounded-2xl border border-white/[0.06] bg-[#111111] shadow-2xl"
        >
          {/* Header */}
          <div className="border-b border-white/[0.06] px-6 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#c8ff00]/10">
                <ShieldCheck className="size-5 text-[#c8ff00]" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-safira)] text-xl tracking-tight">
                  Terms of Use
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {APP_NAME_FULL}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Before using the protocol, please review and accept the following
              terms. These exist to protect both you and the protocol.
            </p>
          </div>

          {/* Terms sections */}
          <div className="max-h-[340px] overflow-y-auto px-6 py-4 space-y-4">
            {termsSections.map((section, idx) => (
              <div key={section.title}>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  {idx + 1}. {section.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Accept */}
          <div className="border-t border-white/[0.06] px-6 py-5 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <button
                type="button"
                onClick={() => setChecked(!checked)}
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  checked
                    ? "border-[#c8ff00] bg-[#c8ff00]"
                    : "border-white/20 bg-white/[0.04] group-hover:border-white/30"
                }`}
              >
                {checked && <Check className="size-3.5 text-[#0a0a0a]" />}
              </button>
              <span className="text-sm text-muted-foreground leading-snug">
                I have read and agree to the Terms of Use, and I understand the
                risks associated with using decentralized finance protocols.
              </span>
            </label>
            <Button
              onClick={handleAccept}
              disabled={!checked}
              className="w-full bg-[#c8ff00] text-[#0a0a0a] hover:bg-[#c8ff00]/80 font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Accept and Continue
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
