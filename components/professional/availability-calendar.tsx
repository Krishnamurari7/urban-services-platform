"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AvailabilitySlot } from "@/lib/types/database";
import { Calendar as CalendarIcon, Plus, Trash2, Clock } from "lucide-react";

interface SlotFormData {
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
}

export function AvailabilityCalendar() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formData, setFormData] = useState<SlotFormData>({
    start_time: "",
    end_time: "",
    is_recurring: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSlots();
    }
  }, [user]);

  const fetchSlots = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("professional_id", user.id)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error("Error fetching availability slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const supabase = createClient();

      const startDateTime = `${selectedDate}T${formData.start_time}`;
      const endDateTime = `${selectedDate}T${formData.end_time}`;

      const { error } = await supabase.from("availability_slots").insert({
        professional_id: user.id,
        start_time: startDateTime,
        end_time: endDateTime,
        status: "available",
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring
          ? formData.recurrence_pattern || "weekly"
          : null,
      });

      if (error) throw error;

      // Reset form
      setFormData({
        start_time: "",
        end_time: "",
        is_recurring: false,
      });
      setShowForm(false);
      await fetchSlots();
    } catch (error) {
      console.error("Error creating availability slot:", error);
      alert("Failed to create availability slot. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (
      !user ||
      !confirm("Are you sure you want to delete this availability slot?")
    )
      return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("availability_slots")
        .delete()
        .eq("id", slotId)
        .eq("professional_id", user.id);

      if (error) throw error;
      await fetchSlots();
    } catch (error) {
      console.error("Error deleting availability slot:", error);
      alert("Failed to delete availability slot. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-[#D1FAE5] text-[#065F46]"; // Success green variant
      case "booked":
        return "bg-[#DBEAFE] text-[#1E3A8A]"; // Primary blue variant
      case "unavailable":
        return "bg-[#F1F5F9] text-[#475569]"; // Light background variant
      default:
        return "bg-[#F1F5F9] text-[#475569]"; // Light background variant
    }
  };

  // Group slots by date
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      const date = new Date(slot.start_time).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    },
    {} as Record<string, AvailabilitySlot[]>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Availability Calendar</CardTitle>
              <CardDescription>
                Manage your available time slots for bookings
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 border rounded-lg space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.is_recurring}
                  onChange={(e) =>
                    setFormData({ ...formData, is_recurring: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="recurring" className="text-sm">
                  Recurring weekly
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Slot"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {Object.keys(slotsByDate).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No availability slots added yet</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Add Your First Slot
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(slotsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dateSlots]) => (
                  <div key={date} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="space-y-2">
                      {dateSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                {new Date(slot.start_time).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}{" "}
                                -{" "}
                                {new Date(slot.end_time).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                              {slot.is_recurring && (
                                <p className="text-xs text-gray-500">
                                  Recurring weekly
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(slot.status)}>
                              {slot.status}
                            </Badge>
                            {slot.status === "available" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(slot.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
