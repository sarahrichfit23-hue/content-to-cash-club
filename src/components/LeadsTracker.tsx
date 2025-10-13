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
};

export default function LeadsTracker() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧭 Fetch only today’s leads
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .gte("date_created", today)
        .order("date_created", { ascending: false });
      if (error) console.error("Error loading leads:", error);
      else setLeads(data || []);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const handleCheck = async (id: string, field: keyof Lead, value: boolean) => {
    const { error } = await supabase
      .from("leads")
      .update({ [field]: value })
      .eq("id", id);
    if (error) console.error(error);
    else setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, [field]: value } : lead
      )
    );
  };

  if (loading) return <p className="text-center p-6 text-gray-500">Loading...</p>;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        📋 Leads Tracker
      </h2>

      <table className="min-w-full text-sm border border-gray-200 rounded-lg bg-white shadow-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Handle</th>
            <th className="px-3 py-2 text-left">Platform</th>
            <th className="px-3 py-2 text-left">Lead Source</th>
            <th className="px-3 py-2 text-left">Msg Ver</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Progress</th>
            <th className="px-3 py-2 text-left">Messaged</th>
            <th className="px-3 py-2 text-left">Followed</th>
            <th className="px-3 py-2 text-left">Replied</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2">{lead.date_created?.split("T")[0]}</td>
              <td className="px-3 py-2">{lead.name}</td>
              <td className="px-3 py-2">{lead.handle}</td>
              <td className="px-3 py-2">{lead.platform}</td>
              <td className="px-3 py-2">{lead.lead_source}</td>
              <td className="px-3 py-2">{lead.message_version}</td>
              <td className="px-3 py-2">{lead.lead_status}</td>
              <td className="px-3 py-2">{lead.progress_status}</td>
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={lead.messaged}
                  onChange={(e) =>
                    handleCheck(lead.id, "messaged", e.target.checked)
                  }
                />
              </td>
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={lead.followed}
                  onChange={(e) =>
                    handleCheck(lead.id, "followed", e.target.checked)
                  }
                />
              </td>
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={lead.replied}
                  onChange={(e) =>
                    handleCheck(lead.id, "replied", e.target.checked)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

