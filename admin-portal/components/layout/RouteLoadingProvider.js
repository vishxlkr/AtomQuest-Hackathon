"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Spinner from "../ui/Spinner";

const RouteLoadingContext = createContext({
  isRouteLoading: false,
  startRouteLoading: () => {},
});

export function useRouteLoading() {
  return useContext(RouteLoadingContext);
}

export default function RouteLoadingProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  useEffect(() => {
    setIsRouteLoading(false);
  }, [pathname, searchParams]);

  const value = useMemo(
    () => ({
      isRouteLoading,
      startRouteLoading: () => setIsRouteLoading(true),
    }),
    [isRouteLoading]
  );

  return (
    <RouteLoadingContext.Provider value={value}>
      {children}
      {isRouteLoading && (
        <div className="fixed bottom-0 left-[220px] right-0 top-0 z-30 flex items-center justify-center bg-[#111118]/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-white/[0.08] bg-[#16161f]/95 px-6 py-5 shadow-2xl shadow-black/30">
            <Spinner label="Loading page" />
            <p className="text-[13px] font-medium text-slate-300">Loading...</p>
          </div>
        </div>
      )}
    </RouteLoadingContext.Provider>
  );
}
