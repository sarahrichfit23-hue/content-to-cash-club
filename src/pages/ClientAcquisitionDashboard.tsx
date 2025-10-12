import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function ClientAcquisitionDashboard() {
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    fetchInstructions();
  }, []);

  async function fetchInstructions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_instructions")
      .select("*")
      .order("last_updated", { ascending: false });
    if (error) console.error("Error fetching instructions:", error);
    setInstructions(data || []);
    setLoading(false);
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Client Acquisition Dashboard</h1>

      <Accordion type="single" collapsible className="w-full space-y-2">
        <AccordionItem value="item-1">
          <AccordionTrigger>🧠 Daily Action Steps</AccordionTrigger>
          <AccordionContent>
            {instructions.length > 0 ? (
              <div className="space-y-3">
                <h2 className="font-semibold text-lg">{instructions[0].title}</h2>
                <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-3 rounded-md border">
                  {instructions[0].content}
                </pre>
                <p className="text-xs text-gray-400 italic">
                  Last updated:{" "}
                  {new Date(instructions[0].last_updated).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p>No instructions available yet.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

