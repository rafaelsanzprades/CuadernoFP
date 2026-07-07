"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, Suspense, useRef } from "react";

function TabSyncInner({ activeTab, setActiveTab }: { activeTab?: string, setActiveTab: (tab: any) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabParam = searchParams.get('tab');
  
  // Flag to track initial mount
  const mounted = useRef(false);
  
  // Read from URL on mount or URL change
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    mounted.current = true;
  }, [tabParam, setActiveTab]); // intentionally not including activeTab to avoid feedback loop

  // Write to URL when activeTab changes
  useEffect(() => {
    if (mounted.current && activeTab && activeTab !== tabParam) {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', activeTab);
      // Use window.history.replaceState to avoid Next.js router triggering a page remount or state reset
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }
  }, [activeTab, pathname, tabParam]);
  
  return null;
}

export function TabSync({ activeTab, setActiveTab }: { activeTab?: string, setActiveTab: (tab: any) => void }) {
  return (
    <Suspense fallback={null}>
      <TabSyncInner activeTab={activeTab} setActiveTab={setActiveTab} />
    </Suspense>
  );
}
