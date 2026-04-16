"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { AddTransactionModal } from "@/components/AddTransactionModal";

type AddModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const AddModalContext = createContext<AddModalContextValue | null>(null);

export function AddModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AddModalContext.Provider value={{ isOpen, open, close }}>
      {children}
      <AddTransactionModal open={isOpen} onClose={close} />
    </AddModalContext.Provider>
  );
}

export function useAddModal() {
  const ctx = useContext(AddModalContext);
  if (!ctx) throw new Error("useAddModal must be used within AddModalProvider");
  return ctx;
}
