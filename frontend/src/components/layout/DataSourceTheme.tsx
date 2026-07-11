"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function DataSourceTheme() {
  const dataSource = useAppStore((state) => state.dataSource);

  useEffect(() => {
    document.documentElement.setAttribute("data-source", dataSource);
    document.body.setAttribute("data-source", dataSource);
  }, [dataSource]);

  return null;
}
