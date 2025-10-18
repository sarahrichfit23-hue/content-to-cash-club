"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Get the current user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  // Fetch notifications when user ID is set
  useEffect(() => {
    if (currentUserId) {
      fetchNotifications();
    }
    // eslint-disable-next-line
  }, [currentUserId]);

  // Close the dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      console.error("❌ Error fetching notifications:", error.message);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  // Mark as read
  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    fetchNotifications();
  };

  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center gap-1 text-yellow-700"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {notifications.filter((n) => !n.is_read).length > 0 && (
          <span className="ml-1 text-xs font-bold bg-amber-200 rounded-full px-2 py-0.5">
            {notifications.filter((n) => !n.is_read).length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-xl z-50">
          <div className="p-4 border-b font-bold text-lg">Notifications</div>
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex flex-col p-4 border-b last:border-b-0 cursor-pointer transition ${
                    n.is_read ? "bg-gray-50" : "bg-white"
                  }`}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) window.location.href = n.link;
                  }}
                >
                  <span className="font-semibold">{n.title}</span>
                  <span className="text-sm text-gray-600">{n.message}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}