"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSection, updateSection } from "../actions";

export default function HeroSectionAdmin() {
  const [heroData, setHeroData] = useState({
    title: "Professional Home Services at Your Doorstep",
    subtitle: "Home Services",
    description: "Book verified experts for home cleaning, sanitization, and maintenance. Reliable, affordable, and just a click away.",
    trustText: "Trusted by 10,000+ households",
    imageUrl: "",
    certificationText: "CERTIFIED EXPERTS",
    certificationSubtext: "100% Background Checked",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionId, setSectionId] = useState<string | null>(null);

  useEffect(() => {
    loadHeroData();
  }, []);

  const loadHeroData = async () => {
    try {
      const supabase = createClient();
      const { data: sections } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("section_type", "hero")
        .eq("is_active", true)
        .single();

      if (sections) {
        setSectionId(sections.id);
        if (sections.content) {
          setHeroData({
            title: sections.content.title || heroData.title,
            subtitle: sections.content.subtitle || heroData.subtitle,
            description: sections.content.description || heroData.description,
            trustText: sections.content.trustText || heroData.trustText,
            imageUrl: sections.content.imageUrl || sections.image_url || "",
            certificationText: sections.content.certificationText || heroData.certificationText,
            certificationSubtext: sections.content.certificationSubtext || heroData.certificationSubtext,
          });
        }
      }
    } catch (error) {
      console.error("Error loading hero data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        section_type: "hero",
        title: heroData.title,
        description: heroData.description,
        image_url: heroData.imageUrl,
        content: {
          title: heroData.title,
          subtitle: heroData.subtitle,
          description: heroData.description,
          trustText: heroData.trustText,
          imageUrl: heroData.imageUrl,
          certificationText: heroData.certificationText,
          certificationSubtext: heroData.certificationSubtext,
        },
        display_order: 0,
        is_active: true,
      };

      if (sectionId) {
        await updateSection(sectionId, data);
      } else {
        await createSection(data);
      }
      alert("Hero section saved successfully!");
      await loadHeroData();
    } catch (error) {
      console.error("Error saving hero section:", error);
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
        <h1 className="text-3xl font-bold text-gray-900">Hero Section</h1>
        <p className="text-gray-600 mt-1">Manage the main hero section of your homepage</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Main Title</label>
            <Input
              id="title"
              value={heroData.title}
              onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
              placeholder="Professional Home Services at Your Doorstep"
            />
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium mb-1">Highlighted Text (will be shown in blue)</label>
            <Input
              id="subtitle"
              value={heroData.subtitle}
              onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
              placeholder="Home Services"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={heroData.description}
              onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Book verified experts for home cleaning..."
            />
          </div>

          <div>
            <label htmlFor="trustText" className="block text-sm font-medium mb-1">Trust Indicator Text</label>
            <Input
              id="trustText"
              value={heroData.trustText}
              onChange={(e) => setHeroData({ ...heroData, trustText: e.target.value })}
              placeholder="Trusted by 10,000+ households"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">Hero Image URL</label>
            <Input
              id="imageUrl"
              type="url"
              value={heroData.imageUrl}
              onChange={(e) => setHeroData({ ...heroData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="certificationText" className="block text-sm font-medium mb-1">Certification Badge Text</label>
              <Input
                id="certificationText"
                value={heroData.certificationText}
                onChange={(e) => setHeroData({ ...heroData, certificationText: e.target.value })}
                placeholder="CERTIFIED EXPERTS"
              />
            </div>
            <div>
              <label htmlFor="certificationSubtext" className="block text-sm font-medium mb-1">Certification Badge Subtext</label>
              <Input
                id="certificationSubtext"
                value={heroData.certificationSubtext}
                onChange={(e) => setHeroData({ ...heroData, certificationSubtext: e.target.value })}
                placeholder="100% Background Checked"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Hero Section"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
