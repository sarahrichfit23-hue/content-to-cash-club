"use client";

import React from "react";

export function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <span style={{ position: "relative", cursor: "pointer" }}>
      {children}
      <span
        style={{
          visibility: "hidden",
          position: "absolute",
          backgroundColor: "#333",
          color: "#fff",
          textAlign: "center",
          borderRadius: "4px",
          padding: "4px 8px",
          bottom: "125%",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          opacity: 0,
          transition: "opacity 0.2s",
        }}
        className="tooltip-text"
      >
        {text}
      </span>
    </span>
  );
}

export default Tooltip;
