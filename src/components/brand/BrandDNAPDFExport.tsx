"use client";

import React from "react";

export default function BrandDNAPDFExport() {
  const handleExport = () => {
    alert("Exporting your Brand DNA as a PDF... (feature coming soon!)");
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Brand DNA PDF Export</h1>
      <p>Download your finalized Brand DNA document for safekeeping and sharing.</p>
      <button
        onClick={handleExport}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#0070f3",
          color: "white",
          cursor: "pointer",
        }}
      >
        Download PDF
      </button>
    </div>
  );
}
