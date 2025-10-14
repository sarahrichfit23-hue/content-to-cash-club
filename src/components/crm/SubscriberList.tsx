import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Lead = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  lead_source: string;
  lead_origin: string;
  lead_status: string;
  progress_status: string;
};

export default function SubscriberList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("lead_origin", "Client Acquisition")
        .order("date_created", { ascending: false });

      if (error) console.error("Error fetching leads:", error);
      else setLeads(data || []);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  if (loading)
    return <p className="p-4 text-gray-500 italic">Loading Client Acquisition leads...</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Client Acquisition Leads</h2>
      {leads.length === 0 ? (
        <p className="text-gray-500 italic">No leads found yet.</p>
      ) : (
        <table className="min-w-full text-sm border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Handle</th>
              <th className="px-3 py-2 text-left">Platform</th>
              <th className="px-3 py-2 text-left">Source</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Progress</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{lead.name}</td>
                <td className="px-3 py-2">{lead.handle}</td>
                <td className="px-3 py-2">{lead.platform}</td>
                <td className="px-3 py-2">{lead.lead_source}</td>
                <td className="px-3 py-2">{lead.lead_status}</td>
                <td className="px-3 py-2">{lead.progress_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
