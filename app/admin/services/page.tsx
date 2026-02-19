import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ServiceForm } from "./service-form";
import { DeleteServiceButton } from "@/components/admin/delete-service-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getServices() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  try {
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching services:", error);
      return [];
    }

    return services || [];
  } catch (error) {
    console.error("Unexpected error fetching services:", error);
    return [];
  }
}

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">
            Service Management
          </h1>
          <p className="text-blue-50 mt-1">Manage services, pricing, and availability</p>
        </div>
        <ServiceForm />
      </div>

      <Card className="border border-gray-200 shadow-lg bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">All Services</CardTitle>
            <Badge variant="secondary" className="text-sm bg-white text-orange-600 font-bold">
              {services.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Category</TableHead>
                  <TableHead className="font-semibold text-gray-700">Base Price</TableHead>
                  <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-right text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No services found. Add your first service to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service, index) => (
                    <TableRow key={service.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {service.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        ₹{service.base_price}
                      </TableCell>
                      <TableCell>{service.duration_minutes} min</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            service.status === "active"
                              ? "default"
                              : service.status === "suspended"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ServiceForm service={service} />
                          <DeleteServiceButton serviceId={service.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
