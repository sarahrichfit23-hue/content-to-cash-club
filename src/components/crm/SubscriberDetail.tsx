import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Edit } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// 🧠 Types
interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  tags?: string[];
  source?: string;
  opt_in_date?: string;
}

interface Activity {
  id: string;
  subscriber_id: string;
  activity_type: string;
  activity_data?: Record<string, any>;
  created_at: string;
}

interface Note {
  id: string;
  subscriber_id: string;
  note: string;
  created_at: string;
}

interface SubscriberDetailProps {
  subscriber: Subscriber;
  onClose: () => void;
  onUpdate?: (updated: Subscriber) => void;
}

export default function SubscriberDetail({
  subscriber,
  onClose,
  onUpdate,
}: SubscriberDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Subscriber>(subscriber);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (subscriber) {
      setEditedData(subscriber);
      fetchActivities();
      fetchNotes();
    }
  }, [subscriber]);

  // 🧾 Load activity history
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriber_activities")
        .select("*")
        .eq("subscriber_id", subscriber.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("❌ Error fetching activities:", error);
    }
  };

  // 📝 Load subscriber notes
  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriber_notes")
        .select("*")
        .eq("subscriber_id", subscriber.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("❌ Error fetching notes:", error);
    }
  };

  // 💾 Save subscriber updates
  const handleSave = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("subscribers")
        .update({
          name: editedData.name,
          email: editedData.email,
          phone: editedData.phone,
          tags: editedData.tags,
          status: editedData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriber.id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Log activity
      await supabase.from("subscriber_activities").insert({
        subscriber_id: subscriber.id,
        user_id: user.id,
        activity_type: "profile_updated",
        activity_data: { changes: editedData },
      });

      toast({
        title: "✅ Subscriber Updated",
        description: "Subscriber information has been updated successfully.",
      });

      setIsEditing(false);
      onUpdate?.(editedData);
    } catch (error) {
      console.error("❌ Error updating subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to update subscriber.",
        variant: "destructive",
      });
    }
  };

  // 🗒️ Add a note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("subscriber_notes").insert({
        subscriber_id: subscriber.id,
        user_id: user.id,
        note: newNote,
      });

      if (error) throw error;
      toast({ title: "📝 Note Added", description: "Note added successfully." });
      setNewNote("");
      fetchNotes();
    } catch (error) {
      console.error("❌ Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    }
  };

  // 🏷️ Add tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (editedData.tags?.includes(newTag)) return;
    setEditedData({
      ...editedData,
      tags: [...(editedData.tags || []), newTag],
    });
    setNewTag("");
  };

  // ❌ Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setEditedData({
      ...editedData,
      tags: editedData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  // 🎯 Map activity type to icon
  const getActivityIcon = (type: string) => {
    const map: Record<string, string> = {
      opt_in: "✅",
      email_sent: "📧",
      email_opened: "👁️",
      email_clicked: "🔗",
      sms_sent: "💬",
      tag_added: "🏷️",
      status_changed: "🔄",
    };
    return map[type] || "📌";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Subscriber Details</h2>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs defaultValue="profile" className="p-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <Label>Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.name || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm mt-1">
                          {subscriber.name || "No name"}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <Label>Email</Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedData.email}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              email: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm mt-1">{subscriber.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <Label>Phone</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.phone || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              phone: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm mt-1">
                          {subscriber.phone || "No phone"}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <Label>Status</Label>
                      {isEditing ? (
                        <Select
                          value={editedData.status}
                          onValueChange={(value) =>
                            setEditedData({ ...editedData, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="unsubscribed">
                              Unsubscribed
                            </SelectItem>
                            <SelectItem value="bounced">Bounced</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="mt-1">
                          {subscriber.status || "N/A"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
