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
          <Spinner label="Loading page" />
        </div>
      )}
    </RouteLoadingContext.Provider>
  );
}
