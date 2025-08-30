import { createContext, useContext } from 'react';

export const StaticRefreshContext = createContext<() => void>(() => {});

export function useStaticRefresh() {
  return useContext(StaticRefreshContext);
}
