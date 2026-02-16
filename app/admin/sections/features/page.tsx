"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSection, updateSection } from "../actions";
import { Plus, Trash2 } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

export default function FeaturesSectionAdmin() {
  const [sectionData, setSectionData] = useState({
    title: "Why Homeowners Trust Us",
    description: "We've simplified home maintenance so you can focus on what matters. Every expert on our platform undergoes a rigorous vetting process.",
    features: [
      {
        title: "Verified Professionals",
        description: "Background-checked and certified experts with 5+ years of experience.",
        icon: "Shield",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Transparent Pricing",
        description: "No hidden charges. Know what you pay before you book the service.",
        icon: "DollarSign",
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "24/7 Dedicated Support",
        description: "Need help? Our customer success team is available around the clock.",
        icon: "Headphones",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
    ] as Feature[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionId, setSectionId] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturesData();
  }, []);

  const loadFeaturesData = async () => {
    try {
      const supabase = createClient();
      const { data: sections } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("section_type", "features")
        .eq("is_active", true)
        .single();

      if (sections) {
        setSectionId(sections.id);
        if (sections.content) {
          setSectionData({
            title: sections.content.title || sectionData.title,
            description: sections.content.description || sectionData.description,
            features: sections.content.features || sectionData.features,
          });
        }
      }
    } catch (error) {
      console.error("Error loading features data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        section_type: "features",
        title: sectionData.title,
        description: sectionData.description,
        content: {
          title: sectionData.title,
          description: sectionData.description,
          features: sectionData.features,
        },
        display_order: 2,
        is_active: true,
      };

      if (sectionId) {
        await updateSection(sectionId, data);
      } else {
        await createSection(data);
      }
      alert("Features section saved successfully!");
      await loadFeaturesData();
    } catch (error) {
      console.error("Error saving features section:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    setSectionData({
      ...sectionData,
      features: [
        ...sectionData.features,
        {
          title: "",
          description: "",
          icon: "Shield",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
      ],
    });
  };

  const removeFeature = (index: number) => {
    setSectionData({
      ...sectionData,
      features: sectionData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const updatedFeatures = [...sectionData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setSectionData({ ...sectionData, features: updatedFeatures });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Features Section</h1>
        <p className="text-gray-600 mt-1">Manage the 'Why Homeowners Trust Us' section</p>
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
              <label className="block text-sm font-medium">Features</label>
              <Button type="button" onClick={addFeature} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>

            <div className="space-y-4">
              {sectionData.features.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Feature {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeFeature(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Feature Title</label>
                      <Input
                        value={feature.title}
                        onChange={(e) => updateFeature(index, "title", e.target.value)}
                        placeholder="Verified Professionals"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(index, "description", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Background-checked and certified experts..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Icon Name</label>
                        <Input
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, "icon", e.target.value)}
                          placeholder="Shield"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Text Color</label>
                        <Input
                          value={feature.color}
                          onChange={(e) => updateFeature(index, "color", e.target.value)}
                          placeholder="text-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Background Color</label>
                        <Input
                          value={feature.bgColor}
                          onChange={(e) => updateFeature(index, "bgColor", e.target.value)}
                          placeholder="bg-blue-100"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Features Section"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
