"use client";

import { useEffect } from "react";

export function Sonner() {
  useEffect(() => {
    console.log("Sonner notifications loaded.");
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "40px", color: "#666" }}>
      <p>Sonner notification system placeholder</p>
    </div>
  );
}

export default Sonner;
