import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Lead = {
  id: string;
  date_created: string;
  name: string;
  handle: string;
  platform: string;
  lead_source: string;
  message_version: string;
  notes: string;
  commented: boolean;
  messaged: boolean;
  followed: boolean;
  replied: boolean;
  video_sent: boolean;
  lead_magnet_sent: boolean;
  call_booked: boolean;
  lead_status: string;
  progress_status: string;
  lead_origin: string;
};

export default function LeadsTracker() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLead, setNewLead] = useState<Partial<Lead>>({});

  // 📦 Fetch leads from Supabase
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("lead_origin", "Client Acquisition")
        .order("date_created", { ascending: false });

      if (error) console.error("❌ Error loading leads:", error);
      else setLeads(data || []);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  // 🧱 Handle input change for new leads
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
  };

  // 🧩 Add new lead
  const addNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("leads")
      .insert([{ ...newLead, lead_origin: "Client Acquisition" }])
      .select();

    if (error) {
      console.error("❌ Error adding new lead:", error.message);
      alert("Error adding new lead.");
    } else {
      setLeads((prev) => [...(data || []), ...prev]);
      setNewLead({});
    }
  };

  // 🖊️ Inline edit handler
  const handleEdit = async (id: string, field: keyof Lead, value: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ [field]: value })
      .eq("id", id);

    if (error) console.error("❌ Update error:", error);
    else {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, [field]: value } : lead))
      );
    }
  };

  // ✅ Toggle checkbox
  const handleCheck = async (id: string, field: keyof Lead, value: boolean) => {
    const { error } = await supabase
      .from("leads")
      .update({ [field]: value })
      .eq("id", id);

    if (error) console.error("❌ Toggle error:", error);
    else {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, [field]: value } : lead))
      );
    }
  };

  // 📤 Send all leads to CRM pipeline
  const handleUploadToPipeline = async () => {
    if (!window.confirm("Send all leads to CRM pipeline?")) return;

    const { data: leadsData, error } = await supabase.from("leads").select("*");
    if (error || !leadsData?.length) {
      alert("No leads available to upload.");
      return;
    }

    const inserts = leadsData.map((lead) => ({
      lead_id: lead.id,
      stage: "New Lead",
    }));

    const { error: pipelineError } = await supabase.from("pipeline").insert(inserts);
    if (pipelineError) {
      console.error("❌ Pipeline insert error:", pipelineError);
      alert("Error moving to pipeline.");
      return;
    }

    alert("✅ All leads moved to CRM pipeline!");
  };

  // 🧹 Clear leads table
  const clearLeads = async () => {
    if (!window.confirm("Clear all leads from today?")) return;

    const { error } = await supabase.from("leads").delete().neq("id", "000");
    if (error) {
      console.error("❌ Clear error:", error);
      alert("Error clearing table.");
    } else {
      setLeads([]);
    }
  };

  if (loading) return <p className="text-center text-gray-500 p-6">Loading leads...</p>;

  return (
    <section className="mt-10 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">📋 Leads Tracker</h2>
        <div className="space-x-2">
          <button
            onClick={handleUploadToPipeline}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            📤 Send to CRM
          </button>
          <button
            onClick={clearLeads}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            🧹 Clear Table
          </button>
        </div>
      </div>

      {/* ➕ Add New Lead */}
      <form
        onSubmit={addNewLead}
        className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border"
      >
        <input
          name="name"
          value={newLead.name || ""}
          onChange={handleInputChange}
          placeholder="Name"
          className="p-2 border rounded"
          required
        />
        <input
          name="handle"
          value={newLead.handle || ""}
          onChange={handleInputChange}
          placeholder="Handle (@username)"
          className="p-2 border rounded"
        />
        <input
          name="platform"
          value={newLead.platform || ""}
          onChange={handleInputChange}
          placeholder="Platform (IG, FB...)"
          className="p-2 border rounded"
        />
        <input
          name="lead_source"
          value={newLead.lead_source || ""}
          onChange={handleInputChange}
          placeholder="Lead Source"
          className="p-2 border rounded"
        />
        <select
          name="message_version"
          value={newLead.message_version || ""}
          onChange={handleInputChange}
          className="p-2 border rounded"
        >
          <option value="">Msg Ver</option>
          <option value="V1">V1</option>
          <option value="V2">V2</option>
          <option value="V3">V3</option>
        </select>
        <textarea
          name="notes"
          value={newLead.notes || ""}
          onChange={handleInputChange}
          placeholder="Notes"
          rows={2}
          className="p-2 border rounded col-span-full"
        />
        <button
          type="submit"
          className="col-span-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
        >
          ➕ Add Lead
        </button>
      </form>

      {/* 🧾 Leads Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Handle</th>
              <th className="px-3 py-2 text-left">Platform</th>
              <th className="px-3 py-2 text-left">Lead Source</th>
              <th className="px-3 py-2 text-left">Msg Ver</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Progress</th>
              <th className="px-3 py-2 text-center">Messaged</th>
              <th className="px-3 py-2 text-center">Followed</th>
              <th className="px-3 py-2 text-center">Replied</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-400 py-6 italic">
                  No leads yet — add one above ⬆️
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-3 py-2 text-gray-500">
                    {new Date(lead.date_created).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border border-transparent focus:border-gray-300 rounded p-1"
                      value={lead.name || ""}
                      onChange={(e) => handleEdit(lead.id, "name", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border border-transparent focus:border-gray-300 rounded p-1"
                      value={lead.handle || ""}
                      onChange={(e) => handleEdit(lead.id, "handle", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border border-transparent focus:border-gray-300 rounded p-1"
                      value={lead.platform || ""}
                      onChange={(e) => handleEdit(lead.id, "platform", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border border-transparent focus:border-gray-300 rounded p-1"
                      value={lead.lead_source || ""}
                      onChange={(e) => handleEdit(lead.id, "lead_source", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">{lead.message_version}</td>
                  <td className="px-3 py-2">{lead.lead_status}</td>
                  <td className="px-3 py-2">{lead.progress_status}</td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={lead.messaged}
                      onChange={(e) => handleCheck(lead.id, "messaged", e.target.checked)}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={lead.followed}
                      onChange={(e) => handleCheck(lead.id, "followed", e.target.checked)}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={lead.replied}
                      onChange={(e) => handleCheck(lead.id, "replied", e.target.checked)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
