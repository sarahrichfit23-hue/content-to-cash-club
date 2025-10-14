import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ClientDetail from "./ClientDetail";

const STAGES = [
  "New Lead",
  "Contacted",
  "Booked Call",
  "Client Closed",
  "Lost / Inactive",
];

type Lead = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  lead_source: string;
  lead_status: string;
  progress_status: string;
  lead_origin: string;
};

type Pipeline = {
  id: string;
  lead_id: string;
  stage: string;
  updated_at: string;
  leads?: Lead;
};

export default function PipelineBoard() {
  const [pipeline, setPipeline] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  // 🧭 Fetch pipeline + lead info
  const fetchPipeline = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pipeline")
      .select("*, leads(*)")
      .order("updated_at", { ascending: false });

    if (error) console.error("❌ Error loading pipeline:", error);
    else setPipeline(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  // 🪄 Handle drop event
  const handleDrop = async (stage: string, leadId: string) => {
    setPipeline((prev) =>
      prev.map((p) =>
        p.id === leadId ? { ...p, stage, updated_at: new Date().toISOString() } : p
      )
    );

    const { error } = await supabase
      .from("pipeline")
      .update({ stage, updated_at: new Date().toISOString() })
      .eq("id", leadId);

    if (error) console.error("❌ Supabase update error:", error);
  };

  const grouped = STAGES.map((stage) => ({
    stage,
    leads: pipeline.filter((p) => p.stage === stage),
  }));

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-500">
        <Loader2 className="animate-spin mr-2 h-5 w-5" /> Loading Pipeline...
      </div>
    );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">🚀 CRM Pipeline Board</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {grouped.map(({ stage, leads }) => (
          <Card
            key={stage}
            className="bg-gray-50 border-gray-200 rounded-lg shadow-sm flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const leadId = e.dataTransfer.getData("leadId");
              if (leadId) handleDrop(stage, leadId);
            }}
          >
            <CardHeader className="flex justify-between items-center border-b">
              <CardTitle className="flex justify-between items-center w-full">
                <span className="text-sm font-semibold">{stage}</span>
                <Badge variant="secondary">{leads.length}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
              {leads.length === 0 ? (
                <p className="text-gray-400 text-sm italic text-center mt-4">
                  Drop leads here
                </p>
              ) : (
                leads.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggingId(item.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => setSelectedLead(item.lead_id)}
                    className={`border bg-white rounded-md p-3 shadow-sm cursor-pointer transition hover:shadow-md ${
                      draggingId === item.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {item.leads?.name || "Unnamed"}
                    </div>
                    <p className="text-xs text-gray-500">
                      @{item.leads?.handle} • {item.leads?.platform}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Source: {item.leads?.lead_source || "—"}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-xs">
                      <Badge variant="outline">{item.leads?.lead_status || "Cold"}</Badge>
                      <span className="text-gray-400">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Detail Modal */}
      {selectedLead && (
        <ClientDetail
          leadId={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
