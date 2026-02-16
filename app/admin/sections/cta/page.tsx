"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSection, updateSection } from "../actions";

export default function CTASectionAdmin() {
  const [ctaData, setCtaData] = useState({
    title: "Ready to Experience a Spotless Home?",
    description: "Join over 10,000 happy customers and book your first service today with a 20% discount.",
    primaryButtonText: "Book a Service Now",
    primaryButtonLink: "/services",
    secondaryButtonText: "Download App",
    secondaryButtonLink: "/#download-app",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionId, setSectionId] = useState<string | null>(null);

  useEffect(() => {
    loadCTAData();
  }, []);

  const loadCTAData = async () => {
    try {
      const supabase = createClient();
      const { data: sections } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("section_type", "cta")
        .eq("is_active", true)
        .single();

      if (sections) {
        setSectionId(sections.id);
        if (sections.content) {
          setCtaData({
            title: sections.content.title || ctaData.title,
            description: sections.content.description || ctaData.description,
            primaryButtonText: sections.content.primaryButtonText || ctaData.primaryButtonText,
            primaryButtonLink: sections.content.primaryButtonLink || ctaData.primaryButtonLink,
            secondaryButtonText: sections.content.secondaryButtonText || ctaData.secondaryButtonText,
            secondaryButtonLink: sections.content.secondaryButtonLink || ctaData.secondaryButtonLink,
          });
        }
      }
    } catch (error) {
      console.error("Error loading CTA data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        section_type: "cta",
        title: ctaData.title,
        description: ctaData.description,
        background_color: "#2563EB", // Blue background
        text_color: "#FFFFFF", // White text
        content: {
          title: ctaData.title,
          description: ctaData.description,
          primaryButtonText: ctaData.primaryButtonText,
          primaryButtonLink: ctaData.primaryButtonLink,
          secondaryButtonText: ctaData.secondaryButtonText,
          secondaryButtonLink: ctaData.secondaryButtonLink,
        },
        display_order: 10,
        is_active: true,
      };

      if (sectionId) {
        await updateSection(sectionId, data);
      } else {
        await createSection(data);
      }
      alert("CTA section saved successfully!");
      await loadCTAData();
    } catch (error) {
      console.error("Error saving CTA section:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CTA Section</h1>
        <p className="text-gray-600 mt-1">Manage the call-to-action banner section</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CTA Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
            <Input
              id="title"
              value={ctaData.title}
              onChange={(e) => setCtaData({ ...ctaData, title: e.target.value })}
              placeholder="Ready to Experience a Spotless Home?"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={ctaData.description}
              onChange={(e) => setCtaData({ ...ctaData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Join over 10,000 happy customers..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="primaryButtonText" className="block text-sm font-medium mb-1">Primary Button Text</label>
              <Input
                id="primaryButtonText"
                value={ctaData.primaryButtonText}
                onChange={(e) => setCtaData({ ...ctaData, primaryButtonText: e.target.value })}
                placeholder="Book a Service Now"
              />
            </div>
            <div>
              <label htmlFor="primaryButtonLink" className="block text-sm font-medium mb-1">Primary Button Link</label>
              <Input
                id="primaryButtonLink"
                value={ctaData.primaryButtonLink}
                onChange={(e) => setCtaData({ ...ctaData, primaryButtonLink: e.target.value })}
                placeholder="/services"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="secondaryButtonText" className="block text-sm font-medium mb-1">Secondary Button Text</label>
              <Input
                id="secondaryButtonText"
                value={ctaData.secondaryButtonText}
                onChange={(e) => setCtaData({ ...ctaData, secondaryButtonText: e.target.value })}
                placeholder="Download App"
              />
            </div>
            <div>
              <label htmlFor="secondaryButtonLink" className="block text-sm font-medium mb-1">Secondary Button Link</label>
              <Input
                id="secondaryButtonLink"
                value={ctaData.secondaryButtonLink}
                onChange={(e) => setCtaData({ ...ctaData, secondaryButtonLink: e.target.value })}
                placeholder="/#download-app"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save CTA Section"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
