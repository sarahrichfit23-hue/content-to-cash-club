"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { saveBrandDNA } from "@/api/save-branddna";
import jsPDF from "jspdf";

export default function BrandDNAPDFExport() {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);

  // Example placeholder data for now — later we’ll connect this to actual BrandDNAWizard inputs
  const brandData = {
    niche: "Busy professional women over 35",
    audience: "Women who want to build confidence and healthy habits",
    tone: "Empowering, relatable, and results-focused",
    mission: "To help women feel strong, confident, and in control again",
    pillars: ["Mindset", "Nutrition", "Movement", "Lifestyle"],
    colors: ["#e6b325", "#000000", "#ffffff"],
    font: "Playfair Display",
    offer_title: "Confident & Fit Blueprint",
    currency: "Lost inches and visible muscle tone",
    metric: "10 lbs and 3 inches off the waist",
    timeline: "in 8 weeks",
    without: "giving up wine or spending hours in the gym",
    offer_summary:
      "Confident & Fit Blueprint helps busy women over 35 lose 10 lbs and 3 inches off their waist in 8 weeks — without giving up wine or spending hours in the gym.",
  };

  const handleExport = async () => {
    if (!user) {
      alert("You must be logged in to export your Brand DNA.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Generate the PDF
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Your Brand DNA Profile", 20, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const yStart = 40;
      const lines = [
        `Niche: ${brandData.niche}`,
        `Audience: ${brandData.audience}`,
        `Tone: ${brandData.tone}`,
        `Mission: ${brandData.mission}`,
        `Pillars: ${brandData.pillars.join(", ")}`,
        `Colors: ${brandData.colors.join(", ")}`,
        `Font: ${brandData.font}`,
        "",
        `Offer: ${brandData.offer_title}`,
        `Currency: ${brandData.currency}`,
        `Metric: ${brandData.metric}`,
        `Timeline: ${brandData.timeline}`,
        `Without: ${brandData.without}`,
        "",
        `Offer Summary:`,
        brandData.offer_summary,
      ];

      lines.forEach((line, i) => doc.text(line, 20, yStart + i * 10));

      const pdfBlob = doc.output("blob");
      const pdfFile = new File([pdfBlob], "brand-dna.pdf", { type: "application/pdf" });

      // 2️⃣ Save to Supabase
      const result = await saveBrandDNA(user.id, brandData, pdfFile);

      if (result.success) {
        alert("✅ Your Brand DNA PDF was saved to your Library!");
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Something went wrong while generating your Brand DNA PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Brand DNA PDF Export</h1>
      <p>Download or save your personalized Brand DNA document.</p>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: loading ? "#999" : "#e6b325",
          color: "#000",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "600",
        }}
      >
        {loading ? "Saving..." : "Save to My Library"}
      </button>
    </div>
  );
}
