"use client";
import React, { createContext, useContext, useState } from "react";
import { motion } from "framer-motion";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = "",
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (newValue: string) => {
    if (value === undefined) setInternalValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 p-1.5 rounded-xl bg-background/40 backdrop-blur-md border border-[var(--glass-border)] shadow-sm overflow-x-auto scrollbar-hide ${className}`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = "",
  onClick,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within a Tabs component");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => {
        context.setActiveTab(value);
        if (onClick) onClick();
      }}
      className={`relative px-4 py-2 rounded-lg text-body font-semibold transition-colors duration-200 whitespace-nowrap outline-none
        ${isActive ? "text-accent drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : "text-muted hover:text-accent hover:bg-accent/10"}
        ${className}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 bg-accent/10 border border-accent rounded-lg shadow-[0_0_15px_rgba(var(--color-accent),0.15)] -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2 h-full w-full">{children}</span>
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within a Tabs component");

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
}
