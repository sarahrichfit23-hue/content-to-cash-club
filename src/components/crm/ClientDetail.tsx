import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Save } from "lucide-react";
import { format } from "date-fns";

type Lead = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  lead_source: string;
  message_version: string;
  notes: string;
  lead_status: string;
  progress_status: string;
  lead_origin: string;
  created_at?: string;
};

type ClientDetailProps = {
  leadId: string;
  onClose: () => void;
};

export default function ClientDetail({ leadId, onClose }: ClientDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updated, setUpdated] = useState<Partial<Lead>>({});

  // 🧭 Fetch lead info
  useEffect(() => {
    const fetchLead = async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("id", leadId).single();
      if (error) console.error("❌ Error fetching lead:", error);
      else setLead(data);
    };
    fetchLead();
  }, [leadId]);

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    const { error } = await supabase
      .from("leads")
      .update(updated)
      .eq("id", lead.id);

    if (error) {
      console.error("❌ Error saving lead:", error);
      alert("Error saving changes");
    } else {
      alert("✅ Lead updated successfully!");
      setLead((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!notes.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from("subscriber_notes").insert({
      subscriber_id: leadId,
      user_id: userData.user.id,
      note: notes,
    });

    if (error) console.error("❌ Error adding note:", error);
    else {
      alert("📝 Note added!");
      setNotes("");
    }
  };

  if (!lead)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Loading lead details...</p>
        </Card>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl bg-white">
        <CardHeader className="flex justify-between items-center border-b">
          <CardTitle className="text-xl font-semibold">
            Client Details — {lead.name || "Unnamed"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Info Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              {editing ? (
                <Input
                  value={updated.name ?? lead.name ?? ""}
                  onChange={(e) => setUpdated({ ...updated, name: e.target.value })}
                />
              ) : (
                <p className="text-gray-700">{lead.name || "—"}</p>
              )}
            </div>

            <div>
              <Label>Platform</Label>
              {editing ? (
                <Input
                  value={updated.platform ?? lead.platform ?? ""}
                  onChange={(e) => setUpdated({ ...updated, platform: e.target.value })}
                />
              ) : (
                <p className="text-gray-700">{lead.platform || "—"}</p>
              )}
            </div>

            <div>
              <Label>Handle</Label>
              {editing ? (
                <Input
                  value={updated.handle ?? lead.handle ?? ""}
                  onChange={(e) => setUpdated({ ...updated, handle: e.target.value })}
                />
              ) : (
                <p className="text-gray-700">@{lead.handle || "—"}</p>
              )}
            </div>

            <div>
              <Label>Lead Source</Label>
              {editing ? (
                <Input
                  value={updated.lead_source ?? lead.lead_source ?? ""}
                  onChange={(e) => setUpdated({ ...updated, lead_source: e.target.value })}
                />
              ) : (
                <p className="text-gray-700">{lead.lead_source || "—"}</p>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <Label>Notes</Label>
            {editing ? (
              <Textarea
                rows={3}
                value={updated.notes ?? lead.notes ?? ""}
                onChange={(e) => setUpdated({ ...updated, notes: e.target.value })}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes || "No notes"}</p>
            )}
          </div>

          {/* Status Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lead Status</Label>
              {editing ? (
                <select
                  value={updated.lead_status ?? lead.lead_status ?? ""}
                  onChange={(e) => setUpdated({ ...updated, lead_status: e.target.value })}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select...</option>
                  <option value="Cold">Cold</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                  <option value="Client">Client</option>
                </select>
              ) : (
                <Badge variant="outline">{lead.lead_status || "—"}</Badge>
              )}
            </div>

            <div>
              <Label>Progress</Label>
              {editing ? (
                <select
                  value={updated.progress_status ?? lead.progress_status ?? ""}
                  onChange={(e) =>
                    setUpdated({ ...updated, progress_status: e.target.value })
                  }
                  className="w-full border rounded p-2"
                >
                  <option value="">Select...</option>
                  <option value="Initial Contact">Initial Contact</option>
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Video Sent">Video Sent</option>
                  <option value="Call Booked">Call Booked</option>
                  <option value="Closed">Closed</option>
                </select>
              ) : (
                <Badge variant="secondary">{lead.progress_status || "—"}</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <p className="text-xs text-gray-500">
              Created:{" "}
              {lead.created_at
                ? format(new Date(lead.created_at), "MMM d, yyyy h:mm a")
                : "—"}
            </p>

            {editing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          {/* Add Note Section */}
          <div className="pt-4 border-t space-y-3">
            <Label>Add New Note</Label>
            <div className="flex gap-2">
              <Textarea
                rows={2}
                placeholder="Add a note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={handleAddNote}>Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
