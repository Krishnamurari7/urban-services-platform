"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSection, updateSection } from "../actions";
import { Plus, Trash2 } from "lucide-react";

interface Service {
  name: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export default function ServicesSectionAdmin() {
  const [sectionData, setSectionData] = useState({
    title: "Our Premium Services",
    description: "Explore our range of professional cleaning and maintenance solutions designed to keep your home pristine.",
    services: [
      {
        name: "Deep Cleaning",
        description: "Complete sanitization of all rooms, bathrooms, and balconies using industrial tools.",
        href: "/services?category=cleaning&type=deep",
        icon: "Home",
        color: "text-blue-500",
      },
      {
        name: "Kitchen Cleaning",
        description: "Oil & grease removal, chimney cleaning, and detailed cabinet sanitization.",
        href: "/services?category=cleaning&type=kitchen",
        icon: "UtensilsCrossed",
        color: "text-orange-500",
      },
      {
        name: "Sofa & Carpet",
        description: "Shampooing and deep extraction cleaning for furniture and expensive rugs.",
        href: "/services?category=cleaning&type=sofa-carpet",
        icon: "Sofa",
        color: "text-blue-400",
      },
      {
        name: "Pest Control",
        description: "Eco-friendly pest treatment for cockroaches, ants, and termites.",
        href: "/services?category=pest-control",
        icon: "Bug",
        color: "text-purple-500",
      },
    ] as Service[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionId, setSectionId] = useState<string | null>(null);

  useEffect(() => {
    loadServicesData();
  }, []);

  const loadServicesData = async () => {
    try {
      const supabase = createClient();
      const { data: sections } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("section_type", "services")
        .eq("is_active", true)
        .single();

      if (sections) {
        setSectionId(sections.id);
        if (sections.content) {
          setSectionData({
            title: sections.content.title || sectionData.title,
            description: sections.content.description || sectionData.description,
            services: sections.content.services || sectionData.services,
          });
        }
      }
    } catch (error) {
      console.error("Error loading services data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        section_type: "services",
        title: sectionData.title,
        description: sectionData.description,
        content: {
          title: sectionData.title,
          description: sectionData.description,
          services: sectionData.services,
        },
        display_order: 1,
        is_active: true,
      };

      if (sectionId) {
        await updateSection(sectionId, data);
      } else {
        await createSection(data);
      }
      alert("Services section saved successfully!");
      await loadServicesData();
    } catch (error) {
      console.error("Error saving services section:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    setSectionData({
      ...sectionData,
      services: [
        ...sectionData.services,
        {
          name: "",
          description: "",
          href: "",
          icon: "Home",
          color: "text-blue-500",
        },
      ],
    });
  };

  const removeService = (index: number) => {
    setSectionData({
      ...sectionData,
      services: sectionData.services.filter((_, i) => i !== index),
    });
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updatedServices = [...sectionData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setSectionData({ ...sectionData, services: updatedServices });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Services Section</h1>
        <p className="text-gray-600 mt-1">Manage the premium services section</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Section Title</label>
            <Input
              id="title"
              value={sectionData.title}
              onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Section Description</label>
            <textarea
              id="description"
              value={sectionData.description}
              onChange={(e) => setSectionData({ ...sectionData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">Services</label>
              <Button type="button" onClick={addService} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            <div className="space-y-4">
              {sectionData.services.map((service, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Service {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeService(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Service Name</label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(index, "name", e.target.value)}
                        placeholder="Deep Cleaning"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(index, "description", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Complete sanitization of all rooms..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Link URL</label>
                        <Input
                          value={service.href}
                          onChange={(e) => updateService(index, "href", e.target.value)}
                          placeholder="/services?category=cleaning"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Icon Name</label>
                        <Input
                          value={service.icon}
                          onChange={(e) => updateService(index, "icon", e.target.value)}
                          placeholder="Home"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Services Section"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
