"use client";

import React, { useState } from "react";

export default function BrandDNAWizard() {
  const [step, setStep] = useState(1);

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h1>Brand DNA Wizard</h1>
      <p>Define your brand personality, mission, and message here.</p>

      <div style={{ marginTop: "30px" }}>
        <p>Current Step: {step}</p>
        <button
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#0070f3",
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => setStep((prev) => prev + 1)}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
