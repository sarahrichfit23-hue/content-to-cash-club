import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useNavigate } from "react-router-dom";

const gold = "#e6b325";

/* ✅ Reusable StepCard component */
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
  const { user, updateProfile } = useApp();
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const totalSteps = 7;

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
  });

  const handleChange = useCallback((field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ✅ Save to Supabase
  const handleSave = async () => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in first." });
      return;
    }
    setSaving(true);

    try {
      const { error } = await supabase.from("branddna").upsert({
        user_id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      await updateProfile({ brand_dna: formData });
      toast({
        title: "✨ You did it, Coach!",
        description:
          "Your Brand DNA is saved. You’ll be redirected to your dashboard shortly!",
        duration: 3000,
      });

      setIsComplete(true);
      setTimeout(() => {
        if (onComplete) onComplete();
        navigate("/dashboard");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error saving Brand DNA",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ PDF export
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const left = 40;
    let y = 60;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("✨ Your Brand DNA", left, y);
    y += 30;

    const addSection = (title: string, value: string | string[]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(title, left, y);
      y += 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const text = Array.isArray(value)
        ? value.join(", ")
        : value || "—";
      const split = doc.splitTextToSize(text, 500);
      doc.text(split, left, y);
      y += split.length * 16 + 10;
    };

    Object.entries(formData).forEach(([key, value]) => addSection(key, value as any));
    doc.save("Your_Brand_DNA.pdf");

    toast({
      title: "📄 Exported!",
      description: "Your Brand DNA PDF has been downloaded.",
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

      {/* Step 1: Niche */}
      {step === 1 && (
        <StepCard title="Step 1: Define Your Niche">
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
          <div className="flex justify-end mt-6">
            <Button onClick={nextStep} style={{ backgroundColor: gold }}>Next</Button>
          </div>
        </StepCard>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <StepCard title="Step 2: Audience Pain Points">
          <p className="text-gray-600 mb-3">
            What are they struggling with right now? Speak to their <em>real frustrations</em>.
          </p>
          <Textarea
            rows={4}
            placeholder="Example: They're tired of fad diets, confused by fitness info, and feel guilty for not having energy."
            value={formData.audience}
            onChange={(e) => handleChange("audience", e.target.value)}
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep} style={{ backgroundColor: gold }}>Next</Button>
          </div>
        </StepCard>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <StepCard title="Step 3: Tone & Voice">
          <p className="text-gray-600 mb-3">
            How do you want your brand to sound? Choose your vibe — the tone that fits your message.
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
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep} style={{ backgroundColor: gold }}>Next</Button>
          </div>
        </StepCard>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <StepCard title="Step 4: Mission Statement">
          <Textarea
            rows={5}
            placeholder="Example: I help busy women feel powerful again through simple, science-backed fitness and nutrition habits that actually fit their life."
            value={formData.mission}
            onChange={(e) => handleChange("mission", e.target.value)}
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep} style={{ backgroundColor: gold }}>Next</Button>
          </div>
        </StepCard>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <StepCard title="Step 5: Content Pillars">
          <Textarea
            rows={3}
            placeholder="Example: Mindset, Strength Training, Hormone Balance, Confidence"
            value={formData.pillars.join(", ")}
            onChange={(e) =>
              handleChange("pillars", e.target.value.split(",").map((x) => x.trim()))
            }
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep} style={{ backgroundColor: gold }}>Next</Button>
          </div>
        </StepCard>
      )}

      {/* Step 6 */}
      {step === 6 && (
        <StepCard title="Step 6: Visual Identity">
          <Input
            placeholder="Example: #E6B325, #FFFFFF, #000000"
            value={formData.colors.join(", ")}
            onChange={(e) =>
              handleChange("colors", e.target.value.split(",").map((x) => x.trim()))
            }
          />
          <Input
            placeholder="Example: Playfair Display, Montserrat, Lato"
            value={formData.font}
            onChange={(e) => handleChange("font", e.target.value)}
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep} style={{ backgroundColor: gold }}>Next</Button>
          </div>
        </StepCard>
      )}

      {/* Step 7 */}
      {step === 7 && (
        <StepCard title="Step 7: Money-Making Offer 💰">
          <Input
            placeholder="Offer Title (e.g., The Strong & Confident Blueprint)"
            value={formData.offer_title}
            onChange={(e) => handleChange("offer_title", e.target.value)}
          />
          <Textarea
            rows={2}
            placeholder="Who do you help?"
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
            rows={2}
            placeholder="Without... (e.g., without giving up wine or spending hours in the gym)"
            value={formData.without}
            onChange={(e) => handleChange("without", e.target.value)}
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={handleSave} style={{ backgroundColor: gold }}>
              {saving ? "Saving..." : "Finish & Save"}
            </Button>
          </div>
        </StepCard>
      )}

      {isComplete && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md z-50 p-8">
          <Confetti width={width} height={height} />
          <h2 className="text-3xl font-bold text-yellow-600 mb-3 text-center animate-pulse">
            🎉 Your Brand DNA is complete!
          </h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            You’ve defined your brand foundations — redirecting you to your Dashboard...
          </p>
          <div className="flex gap-4">
            <Button onClick={handleExportPDF} className="bg-gray-900 text-white">
              📄 Export PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
