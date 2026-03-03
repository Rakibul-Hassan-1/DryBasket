"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initGA, logPageView } from "../lib/analytics";

export default function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  useEffect(() => {
    // Log page view on route change
    if (pathname) {
      logPageView(pathname);
    }
  }, [pathname]);

  return null;
}
