// /app/StoreProvider.tsx

"use client";

import { Provider } from "react-redux";
import { store } from "../lib/store";
import { ReactNode } from "react";

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
