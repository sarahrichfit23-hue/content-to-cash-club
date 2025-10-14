import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import LeadsTracker from "../../components/LeadsTracker";

const getTodayKey = () => new Date().toISOString().split("T")[0];
const getMonthKey = () =>
  `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

export default function ClientAcquisitionDashboard() {
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({});
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  const todayKey = `clientacquisition-checklist-${getTodayKey()}`;
  const monthKey = `clientacquisition-progress-${getMonthKey()}`;

  // 🧠 Load saved state from localStorage
  useEffect(() => {
    const savedChecklist = localStorage.getItem(todayKey);
    const savedProgress = localStorage.getItem(monthKey);

    setChecklist(savedChecklist ? JSON.parse(savedChecklist) : {});
    const savedDays = savedProgress ? JSON.parse(savedProgress) : [];
    setCompletedDays(savedDays);
    setStreak(calculateStreak(savedDays));
  }, []);

  // 💾 Save checklist to localStorage
  useEffect(() => {
    localStorage.setItem(todayKey, JSON.stringify(checklist));
  }, [checklist]);

  // 💾 Save monthly progress to localStorage
  useEffect(() => {
    localStorage.setItem(monthKey, JSON.stringify(completedDays));
    setStreak(calculateStreak(completedDays));
  }, [completedDays]);

  // 📘 Fetch latest daily instructions from Supabase
  useEffect(() => {
    const fetchInstructions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_instructions")
        .select("*")
        .order("last_updated", { ascending: false });
      if (error) console.error("Error fetching instructions:", error);
      setInstructions(data || []);
      setLoading(false);
    };
    fetchInstructions();
  }, []);

  // 🔥 Calculate streaks
  const calculateStreak = (days: string[]) => {
    if (!days.length) return 0;
    const sorted = [...days].sort();
    let streakCount = 1;
    for (let i = sorted.length - 2; i >= 0; i--) {
      const prev = new Date(sorted[i]);
      const next = new Date(sorted[i + 1]);
      const diff = (next.getTime() - prev.getTime()) / (1000 * 3600 * 24);
      if (diff === 1) streakCount++;
      else break;
    }
    return streakCount;
  };

  const dailyItems = [
    "Add today’s 100 new outreach contacts",
    "Send initial messages (cold/warm)",
    "Engage (follow + comment)",
    "Send follow-ups",
    "Track video sent & calls booked",
    "Update pipeline statuses",
  ];

  const toggleCheck = (item: string) => {
    const newChecklist = { ...checklist, [item]: !checklist[item] };
    setChecklist(newChecklist);

    const allChecked = dailyItems.every((task) => newChecklist[task]);
    if (allChecked && !completedDays.includes(getTodayKey())) {
      const updated = [...completedDays, getTodayKey()];
      setCompletedDays(updated);
    }
  };

  const toggleDay = (dateKey: string) => {
    let updated;
    if (completedDays.includes(dateKey)) {
      updated = completedDays.filter((day) => day !== dateKey);
    } else {
      updated = [...completedDays, dateKey];
    }
    setCompletedDays(updated);
  };

  const resetChecklist = () => {
    setChecklist({});
    localStorage.removeItem(todayKey);
  };

  const resetMonth = () => {
    setCompletedDays([]);
    localStorage.removeItem(monthKey);
    setStreak(0);
  };

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading...</p>;

  const today = new Date();
  const totalDays = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  const streakGlow =
    streak >= 14
      ? "animate-pulse text-red-600 drop-shadow-[0_0_6px_rgba(255,80,0,0.6)]"
      : streak >= 7
      ? "animate-glow text-yellow-600 drop-shadow-[0_0_6px_rgba(255,200,0,0.6)]"
      : "text-gray-600";

  return (
    <div className="p-8 space-y-10 max-w-6xl mx-auto font-inter text-gray-800">
      <style>{`
        @keyframes glow {
          0% { text-shadow: 0 0 4px #ffeb3b, 0 0 8px #ffeb3b; }
          50% { text-shadow: 0 0 12px #ffd700, 0 0 24px #ffc107; }
          100% { text-shadow: 0 0 4px #ffeb3b, 0 0 8px #ffeb3b; }
        }
        .animate-glow {
          animation: glow 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* 🌟 HEADER */}
      <div className="text-center space-y-3">
        <div className="flex justify-center items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 border border-yellow-300 shadow-sm text-lg">
            ✨
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 font-playfair">
            Client Acquisition Dashboard
          </h1>
        </div>
        <p className="text-sm text-gray-500 italic">
          Track your progress, stay consistent, and build momentum ✨
        </p>
      </div>

      {/* ⚡ DAILY ACTION STEPS */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <span className="text-yellow-500 text-2xl">⚡</span> Daily Action Steps
        </h2>

        <div className="bg-gradient-to-br from-yellow-50 via-white to-gray-100 border border-gray-200 shadow rounded-xl p-6">
          <ol className="space-y-4">
            {[
              "Find 100 new leads per day",
              "Send first messages (cold/warm)",
              "Engage (follow + comment)",
              "Send follow-ups",
              "Track video sent & calls booked",
              "Update lead tracker & pipeline",
              "Reflect daily & plan next outreach block",
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-white bg-yellow-500 rounded-full shadow">
                  {index + 1}
                </div>
                <p className="text-gray-800 text-base leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ✅ DAILY CHECKLIST */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-yellow-500 text-2xl">📅</span> Daily Checklist
          </h2>
          <button
            onClick={resetChecklist}
            className="text-sm text-blue-600 hover:underline"
          >
            🔁 Reset Checklist
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg divide-y shadow-sm">
          {dailyItems.map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="checkbox"
                checked={!!checklist[item]}
                onChange={() => toggleCheck(item)}
                className="w-4 h-4 accent-yellow-500"
              />
              <span
                className={
                  checklist[item]
                    ? "line-through text-gray-400 transition-all"
                    : "text-gray-800"
                }
              >
                {item}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* 🌸 MONTHLY TRACKER */}
      <section className="mt-10 text-center">
        <h3 className="font-semibold text-gray-800 mb-1 text-lg">
          🌼 Monthly Progress Tracker
        </h3>
        <p className={`text-sm font-semibold ${streakGlow}`}>
          🔥 Current Streak: {streak} {streak === 1 ? "day" : "days"}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {[...Array(totalDays)].map((_, i) => {
            const dayNum = i + 1;
            const dateKey = new Date(
              today.getFullYear(),
              today.getMonth(),
              dayNum
            )
              .toISOString()
              .split("T")[0];
            const completed = completedDays.includes(dateKey);
            const formattedDate = new Date(dateKey).toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
              }
            );
            return (
              <button
                key={i}
                onClick={() => toggleDay(dateKey)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all focus:outline-none ${
                  completed
                    ? "bg-yellow-400 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200"
                }`}
                title={
                  completed
                    ? `✅ Completed on ${formattedDate}`
                    : `Not completed (${formattedDate})`
                }
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={resetMonth}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          🔁 Reset Month
        </button>
      </section>

      {/* 📋 LEADS TRACKER SECTION */}
      <section className="mt-16">
        <LeadsTracker />

        {/* 📤 Push Leads to CRM */}
        <div className="mt-6 text-center">
          <button
            onClick={() =>
              alert(
                "✅ All leads are automatically synced to your CRM under 'Client Acquisition'."
              )
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            🚀 Send to CRM
          </button>
          <p className="text-xs text-gray-500 mt-2">
            (Leads from this dashboard are saved under “Client Acquisition” in
            CRM)
          </p>
        </div>
      </section>
    </div>
  );
}
