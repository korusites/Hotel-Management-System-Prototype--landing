import { createContext, useContext, type ReactNode } from "react";

import type { StaffRole } from "../lib/types";

export interface StaffAuthContextValue {
  role: StaffRole;
  logout: () => void;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

export function StaffAuthProvider({ value, children }: { value: StaffAuthContextValue; children: ReactNode }) {
  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth(): StaffAuthContextValue {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth deve ser usado dentro de StaffAuthProvider");
  return ctx;
}
