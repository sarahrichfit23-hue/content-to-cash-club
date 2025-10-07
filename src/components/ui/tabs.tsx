"use client";

import * as React from "react";

export interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
}

export function Tabs({ tabs, defaultIndex = 0 }: TabsProps) {
  const [activeIndex, setActiveIndex] = React.useState(defaultIndex);

  return (
    <div>
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              cursor: "pointer",
              borderBottom:
                activeIndex === index ? "3px solid #0070f3" : "3px solid transparent",
              fontWeight: activeIndex === index ? "bold" : "normal",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px" }}>{tabs[activeIndex].content}</div>
    </div>
  );
}
