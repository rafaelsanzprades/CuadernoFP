"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, Suspense, useRef } from "react";

function TabSyncInner({ activeTab, setActiveTab }: { activeTab?: string, setActiveTab: (tab: any) => void }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  // Read from URL ONLY on initial mount
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  // Write to URL when activeTab changes
  useEffect(() => {
    if (activeTab) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState(null, '', url.toString());
    }
  }, [activeTab]);
  
  return null;
}

export function TabSync({ activeTab, setActiveTab }: { activeTab?: string, setActiveTab: (tab: any) => void }) {
  return (
    <Suspense fallback={null}>
      <TabSyncInner activeTab={activeTab} setActiveTab={setActiveTab} />
    </Suspense>
  );
}
