import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Users, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Segment = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  filters: {
    status?: string;
    source?: string;
    tags?: string[];
    dateRange?: string;
  };
  subscriber_count?: number;
  is_dynamic?: boolean;
  created_at?: string;
};

interface SubscriberSegmentsProps {
  onSelectSegment?: (segment: Segment) => void;
}

export default function SubscriberSegments({
  onSelectSegment,
}: SubscriberSegmentsProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSegment, setNewSegment] = useState<Segment>({
    id: "",
    user_id: "",
    name: "",
    description: "",
    filters: {
      status: "",
      source: "",
      tags: [],
      dateRange: "",
    },
    subscriber_count: 0,
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { toast } = useToast();

  // 🧭 Load segments and available tags
  useEffect(() => {
    fetchSegments();
    fetchAvailableTags();
  }, []);

  // 🧱 Fetch all segments for current user
  const fetchSegments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("subscriber_segments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Count subscribers per segment
      const segmentsWithCounts = await Promise.all(
        (data || []).map(async (segment: Segment) => ({
          ...segment,
          subscriber_count: await getSegmentCount(segment.filters),
        }))
      );

      setSegments(segmentsWithCounts);
    } catch (error) {
      console.error("❌ Error fetching segments:", error);
    }
  };

  // 🏷️ Fetch unique tags from subscribers
  const fetchAvailableTags = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("subscribers")
        .select("tags")
        .eq("user_id", user.id);

      if (error) throw error;

      const tags = new Set<string>();
      data?.forEach((sub: any) => {
        sub.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));
    } catch (error) {
      console.error("❌ Error fetching tags:", error);
    }
  };

  // 🔢 Count how many subscribers match segment filters
  const getSegmentCount = async (filters: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return 0;

      let query = supabase
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (filters.status) query = query.eq("status", filters.status);
      if (filters.source) query = query.eq("source", filters.source);
      if (filters.tags?.length > 0) query = query.contains("tags", filters.tags);

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error("❌ Error getting segment count:", error);
      return 0;
    }
  };

  // ➕ Create a new segment
  const handleCreateSegment = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (!newSegment.name.trim()) {
        toast({
          title: "Missing Name",
          description: "Please enter a segment name.",
          variant: "destructive",
        });
        return;
      }

      const count = await getSegmentCount(newSegment.filters);

      const { error } = await supabase.from("subscriber_segments").insert({
        user_id: user.id,
        name: newSegment.name,
        description: newSegment.description,
        filters: newSegment.filters,
        subscriber_count: count,
      });

      if (error) throw error;

      toast({
        title: "✅ Segment Created",
        description: "Your segment has been created successfully.",
      });

      setIsCreating(false);
      setNewSegment({
        ...newSegment,
        name: "",
        description: "",
        filters: { status: "", source: "", tags: [], dateRange: "" },
      });
      fetchSegments();
    } catch (error) {
      console.error("❌ Error creating segment:", error);
      toast({
        title: "Error",
        description: "Failed to create segment.",
        variant: "destructive",
      });
    }
  };

  // 🗑️ Delete a segment
  const handleDeleteSegment = async (segmentId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("subscriber_segments")
        .delete()
        .eq("id", segmentId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "🗑️ Segment Deleted",
        description: "Segment has been deleted successfully.",
      });

      fetchSegments();
    } catch (error) {
      console.error("❌ Error deleting segment:", error);
      toast({
        title: "Error",
        description: "Failed to delete segment.",
        variant: "destructive",
      });
    }
  };

  // 🔘 Toggle tags in segment filter
  const handleTagToggle = (tag: string) => {
    const tags = newSegment.filters.tags || [];
    const updatedTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    setNewSegment({
      ...newSegment,
      filters: { ...newSegment.filters, tags: updatedTags },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header + Create Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Segments</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Segment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Segment Name</Label>
                <Input
                  value={newSegment.name}
                  onChange={(e) =>
                    setNewSegment({ ...newSegment, name: e.target.value })
                  }
                  placeholder="e.g., Active Email Subscribers"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={newSegment.description}
                  onChange={(e) =>
                    setNewSegment({
                      ...newSegment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this segment"
                />
              </div>

              {/* Filters Section */}
              <div className="space-y-3">
                <Label>Filters</Label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Status</Label>
                    <Select
                      value={newSegment.filters.status || ""}
                      onValueChange={(v) =>
                        setNewSegment({
                          ...newSegment,
                          filters: { ...newSegment.filters, status: v },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="unsubscribed">
                          Unsubscribed
                        </SelectItem>
                        <SelectItem value="bounced">Bounced</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Source</Label>
                    <Select
                      value={newSegment.filters.source || ""}
                      onValueChange={(v) =>
                        setNewSegment({
                          ...newSegment,
                          filters: { ...newSegment.filters, source: v },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="landing_page">Landing Page</SelectItem>
                        <SelectItem value="import">Import</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.length === 0 && (
                      <p className="text-sm text-gray-400 italic">
                        No tags available yet.
                      </p>
                    )}
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          newSegment.filters.tags?.includes(tag)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleCreateSegment} className="w-full">
                Create Segment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => (
          <Card
            key={segment.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectSegment?.(segment)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{segment.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSegment(segment.id);
                    }}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {segment.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {segment.description}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {segment.subscriber_count ?? 0} subscribers
                  </span>
                </div>
                {segment.is_dynamic && (
                  <Badge variant="secondary" className="text-xs">
                    Dynamic
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {segment.filters.status && (
                  <Badge variant="outline" className="text-xs">
                    Status: {segment.filters.status}
                  </Badge>
                )}
                {segment.filters.source && (
                  <Badge variant="outline" className="text-xs">
                    Source: {segment.filters.source}
                  </Badge>
                )}
                {segment.filters.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
