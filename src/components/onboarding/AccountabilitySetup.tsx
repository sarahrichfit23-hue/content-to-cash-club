import React, { useState } from "react";

export default function AccountabilitySetup({
  onComplete,
  onBack,
}: {
  onComplete: (data: { postingGoal: number; contentTypes: string[]; checkinTime: string }) => void,
  onBack: () => void
}) {
  const [postingGoal, setPostingGoal] = useState(3);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [checkinTime, setCheckinTime] = useState("08:00");

  const contentOptions = [
    "IG Reels",
    "IG Carousels",
    "Email",
    "DMs",
    "TikTok"
  ];

  const toggleContentType = (type: string) => {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      postingGoal,
      contentTypes,
      checkinTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="font-medium block mb-2">
          How many pieces of content will you post each week?
        </label>
        <input
          type="number"
          min={1}
          max={14}
          value={postingGoal}
          onChange={e => setPostingGoal(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2 w-32"
        />
      </div>
      <div>
        <label className="font-medium block mb-2">Preferred Content Types</label>
        <div className="flex flex-wrap gap-2">
          {contentOptions.map(type => (
            <button
              type="button"
              key={type}
              onClick={() => toggleContentType(type)}
              className={`px-3 py-1 rounded border transition ${
                contentTypes.includes(type)
                  ? "bg-yellow-200 border-yellow-400 font-bold"
                  : "bg-gray-100 border-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="font-medium block mb-2">
          What time of day will you check in?
        </label>
        <input
          type="time"
          value={checkinTime}
          onChange={e => setCheckinTime(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-40"
        />
      </div>
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-yellow-500 text-white rounded font-semibold hover:bg-yellow-600"
          disabled={contentTypes.length === 0}
        >
          Finish Onboarding
        </button>
      </div>
    </form>
  );
}