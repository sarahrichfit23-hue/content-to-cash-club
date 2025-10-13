import { generateCalendar } from "../api/generate-calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


export default function ContentStrategyEngine() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

 async function handleGenerate() {
    setLoading(true);
    try {
      const plan = await generateCalendar(); // ✅ works fine now
      setIdeas(plan.split("\n").filter(Boolean));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>AI Content Strategy Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Generate a 30-day content plan for your niche with AI.
          </p>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Calendar"}
          </Button>

          <ul className="mt-6 space-y-2">
            {ideas.map((idea, i) => (
              <li key={i} className="border rounded p-2 bg-gray-50">
                {idea}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
