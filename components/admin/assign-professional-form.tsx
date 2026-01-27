"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assignProfessional } from "@/app/admin/bookings/[id]/actions";
import { useRouter } from "next/navigation";
import { UserPlus, Star } from "lucide-react";

interface Professional {
  id: string;
  full_name: string;
  rating_average: number | null;
  total_reviews: number;
}

interface AssignProfessionalFormProps {
  bookingId: string;
  serviceId: string;
  currentProfessionalId?: string | null;
}

export function AssignProfessionalForm({
  bookingId,
  serviceId,
  currentProfessionalId,
}: AssignProfessionalFormProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProfessionals();
  }, [serviceId]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      // Get professionals who offer this service
      const { data: professionalServices } = await supabase
        .from("professional_services")
        .select("professional_id")
        .eq("service_id", serviceId)
        .eq("is_available", true);

      if (!professionalServices || professionalServices.length === 0) {
        setProfessionals([]);
        return;
      }

      const professionalIds = professionalServices.map((ps) => ps.professional_id);

      // Get professional profiles
      const { data: professionalsData } = await supabase
        .from("profiles")
        .select("id, full_name, rating_average, total_reviews")
        .in("id", professionalIds)
        .eq("role", "professional")
        .eq("is_active", true)
        .eq("is_verified", true);

      if (professionalsData) {
        setProfessionals(professionalsData as Professional[]);
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedProfessionalId) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("bookingId", bookingId);
    formData.append("professionalId", selectedProfessionalId);

    const result = await assignProfessional(formData);
    setSubmitting(false);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to assign professional");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assign Professional</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading professionals...</p>
        </CardContent>
      </Card>
    );
  }

  if (professionals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assign Professional</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No available professionals for this service
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Assign Professional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentProfessionalId ? (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Professional already assigned. Select a different one to reassign.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No professional assigned. Select one from the list below.
          </p>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Professional</label>
          <select
            value={selectedProfessionalId}
            onChange={(e) => setSelectedProfessionalId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select Professional --</option>
            {professionals.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.full_name}
                {prof.rating_average && (
                  <> - ⭐ {prof.rating_average.toFixed(1)} ({prof.total_reviews} reviews)</>
                )}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleAssign}
          disabled={!selectedProfessionalId || submitting}
          className="w-full"
        >
          {submitting ? "Assigning..." : "Assign Professional"}
        </Button>
      </CardContent>
    </Card>
  );
}
