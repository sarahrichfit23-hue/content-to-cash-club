import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { jsPDF } from "jspdf";
import { saveBrandDNA } from "@/api/save-branddna";
import { supabase } from "@/lib/supabase"; // ✅ Make sure this path matches your setup
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

// 🌟 Elegant gold color scheme
const gold = "#e6b325";

/* ✅ Reusable StepCard (moved outside component to prevent re-renders) */
const StepCard = React.memo(function StepCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-lg border-t-4" style={{ borderColor: gold }}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
});

export default function BrandDNAWizard({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const { user } = useApp();
  const { toast } = useToast();
  const { width, height } = useWindowSize(); // ✅ Added for Confetti
  const [isComplete, setIsComplete] = useState(false); // ✅ Added completion state

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    niche: "",
    audience: "",
    tone: "",
    mission: "",
    pillars: [] as string[],
    colors: [] as string[],
    font: "",
    offer_title: "",
    currency: "",
    metric: "",
    timeline: "",
    without: "",
    offer_summary: "",
  });

  const totalSteps = 8;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ✅ Memoized to stop unnecessary re-renders
  const handleChange = useCallback(
    (field: string, value: string | string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // ✅ Save to Supabase
  const handleSave = async () => {
      console.log("Current user:", user);
    if (!user) return alert("Please log in first.");
    setSaving(true);
    const { error } = await supabase.from("branddna").insert({
      user_id: user.id,
      ...formData,
    });
    setSaving(false);
    if (error) {
      console.error("❌ Error saving:", error);
      alert("Error saving your Brand DNA. Check console for details.");
    } else {
   toast({
  title: "💫 You did it, Coach!",
  description: (
    <div>
      <p>
        Your <strong>Brand DNA</strong> is officially locked in — that foundation is glowing ✨
      </p>
      <p className="mt-1">
        You can now <strong>download your PDF</strong> or view it below.
      </p>
    </div>
  ),
  className: "toast-gold-glow text-gray-900 rounded-xl px-5 py-4 font-medium",
  duration: 5000,
});

// 🎉 Show completion overlay (don’t navigate away yet)
setIsComplete(true);

    }
  };

  // ✅ Generate & download the Brand DNA as a PDF
const handleExportPDF = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const left = 40;
  let y = 60;

  // 🪄 Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("✨ Your Brand DNA", left, y);
  y += 30;

  // 🧩 Add content sections dynamically
  const addSection = (title: string, value: string | string[]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, left, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const text =
      Array.isArray(value) && value.length
        ? value.join(", ")
        : typeof value === "string" && value.trim() !== ""
        ? value
        : "—";

    const splitText = doc.splitTextToSize(text, 500);
    doc.text(splitText, left, y);
    y += splitText.length * 16 + 10;
  };

  // ✨ All your Brand DNA fields
  addSection("Niche", formData.niche);
  addSection("Audience Pain Points", formData.audience);
  addSection("Tone & Voice", formData.tone);
  addSection("Mission Statement", formData.mission);
  addSection("Content Pillars", formData.pillars);
  addSection("Brand Colors", formData.colors);
  addSection("Font", formData.font);
  addSection("Offer Title", formData.offer_title);
  addSection("Currency", formData.currency);
  addSection("Metric", formData.metric);
  addSection("Timeline", formData.timeline);
  addSection("Without", formData.without);
  addSection("Offer Summary", formData.offer_summary);

  // 🧾 Footer
  y += 20;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(
    "Created with ❤️ using the Premium Coaches Brand DNA Wizard",
    left,
    y
  );

  // ✅ Trigger download
 doc.save("Your_Brand_DNA.pdf");

  // ✅ Toast belongs here
  toast({
    title: "📄 Brand DNA Exported!",
    description: "Your Brand DNA PDF has been downloaded successfully.",
    className: "toast-gold-glow text-gray-900 rounded-xl px-5 py-4 font-medium",
    duration: 4000,
  });
};


  return (
    <div className="relative max-w-3xl mx-auto space-y-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          ✨ Build Your Brand DNA
        </h1>
        <Progress value={(step / totalSteps) * 100} className="w-48" />
      </div>

      {/* Step 1: Define Your Niche */}
      {step === 1 && (
        <StepCard key="step-1" title="Step 1: Define Your Niche">
          <p className="text-gray-600">
            Who do you help — and be <em>specific</em>! The more clear, the better your marketing.
          </p>
          <ul className="list-disc ml-5 text-sm text-gray-600 mb-3">
            <li>Busy moms over 35 who struggle to stay consistent</li>
            <li>Women with PCOS who want to lose weight naturally</li>
            <li>Ex-athletes who want to feel strong again</li>
          </ul>
          <Input
            placeholder="Example: Busy professional women over 30 who feel burnt out and want to regain energy"
            value={formData.niche}
            onChange={(e) => handleChange("niche", e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={nextStep} style={{ backgroundColor: gold }}>
              Next
            </Button>
          </div>
        </StepCard>
      )}

      {/* Step 2: Identify Audience Pain Points */}
{step === 2 && (
  <StepCard key="step-2" title="Step 2: Audience Pain Points">
    <p className="text-gray-600 mb-3">
      What are they struggling with right now? Speak to their <em>real frustrations</em>.
    </p>
    <Textarea
      key="audience-textarea"
      rows={4}
      placeholder="Example: They're tired of fad diets, confused by fitness info, and feel guilty for not having energy."
      value={formData.audience}
      onChange={(e) => handleChange("audience", e.target.value)}
    />
    <div className="flex justify-between mt-6">
      <Button variant="outline" onClick={prevStep}>
        Back
      </Button>
      <Button onClick={nextStep} style={{ backgroundColor: gold }}>
        Next
      </Button>
    </div>
  </StepCard>
)}

{/* Step 3: Choose Your Tone & Voice */}
{step === 3 && (
  <StepCard key="step-3" title="Step 3: Tone & Voice">
    <p className="text-gray-600 mb-3">
      How do you want your brand to <em>sound</em>? Choose your vibe — the tone that fits your message.
    </p>
    <ul className="list-disc ml-5 text-sm text-gray-600 mb-3">
      <li>Empowering big-sister energy 👑</li>
      <li>Science-backed and confident 🧠</li>
      <li>Heart-centered and nurturing 💛</li>
      <li>Bold, direct, and no-BS 🔥</li>
    </ul>
    <Input
      placeholder="Example: Empowering big-sister energy that motivates without pressure"
      value={formData.tone}
      onChange={(e) => handleChange("tone", e.target.value)}
    />
    <div className="flex justify-between mt-6">
      <Button variant="outline" onClick={prevStep}>
        Back
      </Button>
      <Button onClick={nextStep} style={{ backgroundColor: gold }}>
        Next
      </Button>
    </div>
  </StepCard>
)}

{/* Step 4: Mission Statement */}
{step === 4 && (
  <StepCard key="step-4" title="Step 4: Mission Statement">
    <p className="text-gray-600 mb-3">
      Your mission should make people say “yes, that’s exactly what I need!” — keep it clear and heartfelt.
    </p>
    <Textarea
      key="mission-textarea"
      rows={5}
      placeholder="Example: I help busy women feel powerful and confident again through simple, science-backed fitness and nutrition habits that actually fit their life."
      value={formData.mission}
      onChange={(e) => handleChange("mission", e.target.value)}
    />
    <div className="flex justify-between mt-6">
      <Button variant="outline" onClick={prevStep}>
        Back
      </Button>
      <Button onClick={nextStep} style={{ backgroundColor: gold }}>
        Next
      </Button>
    </div>
  </StepCard>
)}

{/* Step 5: Content Pillars */}
{step === 5 && (
  <StepCard key="step-5" title="Step 5: Content Pillars">
    <p className="text-gray-600 mb-3">
      Choose 3–5 main topics that define your message — your content “pillars.”
    </p>
    <ul className="list-disc ml-5 text-sm text-gray-600 mb-3">
      <li>Mindset</li>
      <li>Nutrition</li>
      <li>Fitness</li>
      <li>Hormone Health</li>
      <li>Business & Marketing</li>
    </ul>
    <Textarea
      key="pillars-textarea"
      rows={3}
      placeholder="Example: Mindset, Strength Training, Hormone Balance, Confidence"
      value={formData.pillars.join(", ")}
      onChange={(e) =>
        handleChange(
          "pillars",
          e.target.value.split(",").map((x) => x.trim())
        )
      }
    />
    <div className="flex justify-between mt-6">
      <Button variant="outline" onClick={prevStep}>
        Back
      </Button>
      <Button onClick={nextStep} style={{ backgroundColor: gold }}>
        Next
      </Button>
    </div>
  </StepCard>
)}

{/* Step 6: Brand Colors & Font */}
{step === 6 && (
  <StepCard key="step-6" title="Step 6: Visual Identity">
    <p className="text-gray-600 mb-3">
      Pick 2–3 brand colors and your main font. These set your brand’s visual mood.
    </p>
    <div className="space-y-3">
      <Input
        placeholder="Example: #E6B325, #FFFFFF, #000000"
        value={formData.colors.join(", ")}
        onChange={(e) =>
          handleChange(
            "colors",
            e.target.value.split(",").map((x) => x.trim())
          )
        }
      />
      <Input
        placeholder="Example: Playfair Display, Montserrat, Lato"
        value={formData.font}
        onChange={(e) => handleChange("font", e.target.value)}
      />
    </div>
    <div className="flex justify-between mt-6">
      <Button variant="outline" onClick={prevStep}>
        Back
      </Button>
      <Button onClick={nextStep} style={{ backgroundColor: gold }}>
        Next
      </Button>
    </div>
  </StepCard>
)}


      {/* Step 7: The Money-Making Offer Formula 💰 */}
      {step === 7 && (
        <StepCard key="step-7" title="Step 7: The Money-Making Offer Formula">
          <p className="text-gray-600 mb-3">
            Let’s craft your irresistible, measurable offer statement.
          </p>
          <div className="space-y-4">
            <Input
              placeholder="Your offer title (e.g., The Strong & Confident Blueprint)"
              value={formData.offer_title}
              onChange={(e) => handleChange("offer_title", e.target.value)}
            />
            <Textarea
              key="offer-niche"
              rows={2}
              placeholder="Who do you help? (e.g., busy moms over 35 who feel stuck)"
              value={formData.niche}
              onChange={(e) => handleChange("niche", e.target.value)}
            />
            <Input
              placeholder="Currency (e.g., lose weight, gain muscle)"
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
            />
            <Input
              placeholder="Metric (e.g., 15lbs, 3 inches, 2x energy)"
              value={formData.metric}
              onChange={(e) => handleChange("metric", e.target.value)}
            />
            <Input
              placeholder="Timeline (e.g., in 8 weeks, in 90 days)"
              value={formData.timeline}
              onChange={(e) => handleChange("timeline", e.target.value)}
            />
            <Textarea
              key="without-textarea"
              rows={2}
              placeholder="Without... (e.g., without giving up wine or spending hours in the gym)"
              value={formData.without}
              onChange={(e) => handleChange("without", e.target.value)}
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-6">
            <p className="font-medium text-gray-800 mb-2">Your Offer Summary:</p>
            <p className="italic text-gray-700">
              {formData.offer_title || "Your Offer Title"} helps{" "}
              {formData.niche || "[Your Ideal Client]"} {formData.currency || "[Goal]"}{" "}
              {formData.metric || ""} {formData.timeline || ""} without{" "}
              {formData.without || "[Obstacle]"}.
            </p>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={handleSave} style={{ backgroundColor: gold }}>
              Finish & Save
            </Button>
          </div>
        </StepCard>
      )}

{/* 🎉 Completion Overlay */}
{isComplete && (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md z-50 animate-fadeIn p-8">
    <Confetti width={width} height={height} />
    <h2 className="text-3xl font-bold text-yellow-600 mb-3 text-center animate-pulse">
      🎉 Your Brand DNA is complete!
    </h2>
    <p className="text-gray-600 mb-6 text-center max-w-md">
      You’ve defined your brand foundations — now you can save or export your Brand DNA below.
    </p>
    <div className="flex gap-4">
      <Button onClick={handleSave} style={{ backgroundColor: gold }}>
        💾 Save Again
      </Button>
      <Button onClick={handleExportPDF} className="bg-gray-900 text-white">
        📄 Export PDF
      </Button>
    </div>
     <p className="text-sm text-gray-500 mt-6">
      💡 Next up: Customize your Brand Colors & Fonts!
    </p>
  </div>
)}
</div>
);
}
