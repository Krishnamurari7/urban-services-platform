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
import { Input } from "@/components/ui/input";
import type { Service, ProfessionalService } from "@/lib/types/database";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  Clock,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ServiceWithProfessional extends Service {
  professional_service?: ProfessionalService;
}

export default function ProfessionalServicesPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [myServices, setMyServices] = useState<ServiceWithProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingService, setAddingService] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [addingServiceId, setAddingServiceId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    service_id: "",
    price: "",
    duration_minutes: "",
    is_available: true,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      // Check if user has professional role
      if (role !== "professional") {
        // Redirect based on actual role
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "customer") {
          router.push("/customer/dashboard");
        } else {
          router.push("/login?error=unauthorized");
        }
        return;
      }
      fetchServices();
    }
  }, [user, role, authLoading, router]);

  const fetchServices = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Fetch all active services
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("status", "active")
        .order("name", { ascending: true });

      if (servicesError) throw servicesError;

      // Fetch professional's services
      const { data: professionalServices, error: profError } = await supabase
        .from("professional_services")
        .select(
          `
          *,
          service:services(*)
        `
        )
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      if (profError) throw profError;

      // Map services with professional data
      const myServicesMap = new Map();
      if (professionalServices) {
        professionalServices.forEach((ps: any) => {
          myServicesMap.set(ps.service_id, {
            ...ps.service,
            professional_service: ps,
          });
        });
      }

      setAllServices(services || []);
      setMyServices(Array.from(myServicesMap.values()));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!user || !formData.service_id || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    setAddingService(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.from("professional_services").insert({
        professional_id: user.id,
        service_id: formData.service_id,
        price: parseFloat(formData.price),
        duration_minutes: formData.duration_minutes
          ? parseInt(formData.duration_minutes)
          : null,
        is_available: formData.is_available,
      });

      if (error) throw error;

      // Reset form
      setFormData({
        service_id: "",
        price: "",
        duration_minutes: "",
        is_available: true,
      });
      setAddingServiceId(null);
      setAddingService(false);
      await fetchServices();
    } catch (error: any) {
      console.error("Error adding service:", error);
      if (error.code === "23505") {
        alert("You already offer this service. Please edit the existing one.");
      } else {
        alert("Failed to add service. Please try again.");
      }
    } finally {
      setAddingService(false);
    }
  };

  const handleUpdateService = async (professionalServiceId: string) => {
    if (!formData.price) {
      alert("Price is required");
      return;
    }

    setAddingService(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("professional_services")
        .update({
          price: parseFloat(formData.price),
          duration_minutes: formData.duration_minutes
            ? parseInt(formData.duration_minutes)
            : null,
          is_available: formData.is_available,
          updated_at: new Date().toISOString(),
        })
        .eq("id", professionalServiceId)
        .eq("professional_id", user?.id);

      if (error) throw error;

      setEditingService(null);
      setFormData({
        service_id: "",
        price: "",
        duration_minutes: "",
        is_available: true,
      });
      await fetchServices();
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Failed to update service. Please try again.");
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (professionalServiceId: string) => {
    if (!confirm("Are you sure you want to remove this service?")) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("professional_services")
        .delete()
        .eq("id", professionalServiceId)
        .eq("professional_id", user?.id);

      if (error) throw error;

      await fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to remove service. Please try again.");
    }
  };

  const toggleAvailability = async (
    professionalServiceId: string,
    currentStatus: boolean
  ) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("professional_services")
        .update({
          is_available: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", professionalServiceId)
        .eq("professional_id", user?.id);

      if (error) throw error;

      await fetchServices();
    } catch (error) {
      console.error("Error toggling availability:", error);
      alert("Failed to update availability. Please try again.");
    }
  };

  const startEditing = (service: ServiceWithProfessional) => {
    setEditingService(service.professional_service?.id || null);
    setFormData({
      service_id: service.id,
      price: service.professional_service?.price.toString() || "",
      duration_minutes:
        service.professional_service?.duration_minutes?.toString() || "",
      is_available: service.professional_service?.is_available ?? true,
    });
  };

  const cancelEditing = () => {
    setEditingService(null);
    setFormData({
      service_id: "",
      price: "",
      duration_minutes: "",
      is_available: true,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || role !== "professional") {
    return null; // Will redirect via useEffect
  }

  // Filter services based on search
  const availableServices = allServices.filter(
    (service) =>
      !myServices.some((ms) => ms.id === service.id) &&
      (searchQuery === "" ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Services</h1>
        <p className="text-gray-600">
          Add and manage the services you offer to customers.
        </p>
      </div>

      {/* My Services */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            My Services ({myServices.length})
          </CardTitle>
          <CardDescription>
            Services you currently offer to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>You haven't added any services yet.</p>
              <p className="text-sm mt-2">
                Add services from the list below to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{service.name}</h3>
                      <Badge
                        variant={
                          service.professional_service?.is_available
                            ? "default"
                            : "secondary"
                        }
                      >
                        {service.professional_service?.is_available
                          ? "Available"
                          : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          ${service.professional_service?.price.toFixed(2)}
                        </span>
                      </div>
                      {service.professional_service?.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {service.professional_service.duration_minutes} min
                          </span>
                        </div>
                      )}
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleAvailability(
                          service.professional_service!.id,
                          service.professional_service!.is_available
                        )
                      }
                    >
                      {service.professional_service?.is_available ? (
                        <XCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {service.professional_service?.is_available
                        ? "Disable"
                        : "Enable"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(service)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDeleteService(service.professional_service!.id)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editingService && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Edit Service</CardTitle>
            <CardDescription>Update service details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ($)
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: e.target.value,
                    })
                  }
                  placeholder="Optional: Custom duration"
                  min="1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available_edit"
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({ ...formData, is_available: e.target.checked })
                  }
                  className="rounded"
                />
                <label
                  htmlFor="is_available_edit"
                  className="text-sm font-medium"
                >
                  Available for booking
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateService(editingService)}
                  disabled={addingService}
                >
                  {addingService ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Service Form */}
      {addingServiceId && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Service Details</CardTitle>
            <CardDescription>
              Set your price and availability for this service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ($)
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="Enter your price"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Base price: $
                  {allServices
                    .find((s) => s.id === addingServiceId)
                    ?.base_price.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: e.target.value,
                    })
                  }
                  placeholder="Optional: Custom duration"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default:{" "}
                  {
                    allServices.find((s) => s.id === addingServiceId)
                      ?.duration_minutes
                  }{" "}
                  minutes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available_add"
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({ ...formData, is_available: e.target.checked })
                  }
                  className="rounded"
                />
                <label
                  htmlFor="is_available_add"
                  className="text-sm font-medium"
                >
                  Available for booking
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddService}
                  disabled={addingService || !formData.price}
                >
                  {addingService ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Add Service
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddingServiceId(null);
                    setFormData({
                      service_id: "",
                      price: "",
                      duration_minutes: "",
                      is_available: true,
                    });
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Service
          </CardTitle>
          <CardDescription>
            Select a service from the platform to offer to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Service Selection */}
          {availableServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                {searchQuery
                  ? "No services found matching your search."
                  : "All available services have been added."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Base: ${service.base_price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setAddingServiceId(service.id);
                      setFormData({
                        service_id: service.id,
                        price: service.base_price.toString(),
                        duration_minutes: service.duration_minutes.toString(),
                        is_available: true,
                      });
                    }}
                    disabled={addingService || addingServiceId === service.id}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
