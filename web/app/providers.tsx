"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Account } from "@jaw.id/core";

interface AccountContextValue {
  account: Account | null;
  setAccount: (account: Account | null) => void;
  logout: () => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);

  const logout = useCallback(() => {
    if (account) {
      const { Account: AccountClass } = require("@jaw.id/core");
      AccountClass.logout(process.env.NEXT_PUBLIC_JAW_API_KEY!);
    }
    setAccount(null);
  }, [account]);

  return (
    <AccountContext.Provider value={{ account, setAccount, logout }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
