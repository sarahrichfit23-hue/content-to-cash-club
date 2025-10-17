import React from "react";
import BuddyListWithMessages from "@/components/accountability/BuddyListWithMessages";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
}

export default function StreakTracker({
  currentStreak,
  longestStreak,
  totalCheckins,
}: StreakTrackerProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">🔥 Daily Accountability</h2>
        <p className="text-muted-foreground">
          Keep your streak alive and stay connected with your accountability buddies.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">Current Streak</p>
          <p className="text-3xl font-bold text-primary">{currentStreak}🔥</p>
        </div>

        <div className="bg-card border rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">Longest Streak</p>
          <p className="text-3xl font-bold text-amber-500">{longestStreak}🔥</p>
        </div>

        <div className="bg-card border rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">Total Check-ins</p>
          <p className="text-3xl font-bold text-green-500">{totalCheckins}</p>
        </div>
      </div>

      {/* Buddy Chat Integration */}
      <div className="bg-card border rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-2">Your Accountability Buddies</h3>
        <BuddyListWithMessages />
      </div>
    </div>
  );
}
