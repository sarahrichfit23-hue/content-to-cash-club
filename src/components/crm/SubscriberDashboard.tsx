import { Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Archive } from "lucide-react";
import ClientDetail from "./ClientDetail";

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
  is_archived?: boolean;
  leads?: Lead;
};

const STAGES = [
  "New Lead",
  "Contacted",
  "Booked Call",
  "Client Closed",
  "Lost / Inactive",
];

// 🎨 Stage Color Map (header + column styling)
const STAGE_COLORS: Record<string, string> = {
  "New Lead": "border-t-4 border-blue-500 bg-blue-50",
  "Contacted": "border-t-4 border-yellow-500 bg-yellow-50",
  "Booked Call": "border-t-4 border-purple-500 bg-purple-50",
  "Client Closed": "border-t-4 border-green-500 bg-green-50",
  "Lost / Inactive": "border-t-4 border-red-500 bg-red-50",
};

export default function SubscriberDashboard() {
  const [pipeline, setPipeline] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  // 🧭 Fetch pipeline & lead data
  const fetchPipeline = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pipeline")
      .select("*, leads(*)")
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });

    if (error) console.error("❌ Error fetching pipeline:", error);
    else setPipeline(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  // 🔄 Handle stage update + log activity
  const handleStageChange = async (pipelineId: string, newStage: string) => {
    setUpdating(pipelineId);
    try {
      const { data: updatedRow, error } = await supabase
        .from("pipeline")
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq("id", pipelineId)
        .select("lead_id")
        .single();

      if (error) throw error;

      // 🔹 Log to subscriber_activities (audit trail)
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("subscriber_activities").insert({
          subscriber_id: updatedRow.lead_id,
          user_id: userData.user.id,
          type: "Stage Updated",
          details: `Moved to stage: ${newStage}`,
        });
      }

      // Update UI locally
      setPipeline((prev) =>
        prev.map((item) =>
          item.id === pipelineId ? { ...item, stage: newStage } : item
        )
      );
    } catch (err) {
      console.error("❌ Error updating stage:", err);
    } finally {
      setUpdating(null);
    }
  };

  // 🗂 Archive a lead (moves to My Library)
  const handleArchive = async (pipelineId: string) => {
    try {
      await supabase
        .from("pipeline")
        .update({ is_archived: true })
        .eq("id", pipelineId);
      await fetchPipeline();
    } catch (err) {
      console.error("❌ Error archiving lead:", err);
    }
  };

  // 🔁 Manual refresh
  const handleRefresh = () => {
    fetchPipeline();
  };

  // 🧩 Group leads by stage
  const grouped = STAGES.map((stage) => ({
    stage,
    leads: pipeline.filter((p) => p.stage === stage),
  }));

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-500">
        <Loader2 className="animate-spin mr-2 h-5 w-5" /> Loading CRM dashboard...
      </div>
    );

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto">
      {/* HEADER */}
<div className="flex items-center justify-between">
  <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
    💼 CRM Pipeline
  </h1>
  <div className="flex gap-2">
    <Button
      onClick={handleRefresh}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className="w-4 h-4" /> Refresh
    </Button>

    {/* ✅ New Save to Library button */}
    <Button
      onClick={async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) return alert("You must be logged in.");

          const snapshot = {
            timestamp: new Date().toISOString(),
            pipeline,
          };

          const { error } = await supabase.from("library_crm_exports").insert({
            user_id: userData.user.id,
            title: `CRM Export - ${new Date().toLocaleDateString()}`,
            data: snapshot,
          });

          if (error) {
            console.error("❌ Error saving CRM snapshot:", error);
            alert("Error saving snapshot");
          } else {
            alert("✅ CRM snapshot saved to My Library!");
          }
        } catch (err) {
          console.error(err);
          alert("Something went wrong saving the snapshot.");
        }
      }}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" /> Save to My Library
    </Button>
  </div>
</div>


      {/* PIPELINE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {grouped.map(({ stage, leads }) => (
          <Card
            key={stage}
            className={`shadow-md ${STAGE_COLORS[stage]} rounded-xl transition`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">{stage}</span>
                <Badge variant="secondary">{leads.length}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {leads.length === 0 ? (
                <p className="text-gray-400 text-sm italic text-center">
                  No leads in this stage.
                </p>
              ) : (
                leads.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedLead(item.lead_id)}
                    className="bg-white rounded-lg border p-3 space-y-1 hover:shadow-lg hover:border-gray-300 transition cursor-pointer"
                  >
                    {/* Lead header + status */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {item.leads?.name || "Unnamed"}
                      </span>

                      <Select
                        value={item.stage}
                        onValueChange={(v) => handleStageChange(item.id, v)}
                        disabled={!!updating}
                      >
                        <SelectTrigger className="h-7 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Info */}
                    <p className="text-xs text-gray-500 truncate">
                      @{item.leads?.handle || "N/A"} •{" "}
                      {item.leads?.platform || "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Source: {item.leads?.lead_source || "Unknown"}
                    </p>

                    {/* Footer badges */}
                    <div className="flex items-center justify-between text-xs mt-2">
                      <Badge
                        variant={
                          item.leads?.lead_status === "Hot"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {item.leads?.lead_status || "Cold"}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(item.id);
                          }}
                          title="Archive Lead"
                        >
                          <Archive className="w-3 h-3 text-gray-500" />
                        </Button>
                        <span className="text-gray-400">
                          {new Date(item.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🧩 Lead Detail Modal */}
      {selectedLead && (
        <ClientDetail
          leadId={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
