"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSection,
  updateSection,
  deleteSection,
  toggleSectionStatus,
} from "./actions";

interface Section {
  id?: string;
  section_type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: Record<string, any>;
  image_url?: string;
  background_color?: string;
  text_color?: string;
  position?: number;
  display_order?: number;
  is_active?: boolean;
}

export function SectionForm({ section }: { section?: Section }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const sectionType = formData.get("section_type") as string;
    
    // Parse content based on section type
    let content: Record<string, any> = {};
    
    if (sectionType === "testimonials") {
      const testimonialsJson = formData.get("testimonials") as string;
      if (testimonialsJson) {
        try {
          content.testimonials = JSON.parse(testimonialsJson);
        } catch (e) {
          content.testimonials = [];
        }
      }
    } else if (sectionType === "stats") {
      const statsJson = formData.get("stats") as string;
      if (statsJson) {
        try {
          content.stats = JSON.parse(statsJson);
        } catch (e) {
          content.stats = [];
        }
      }
    } else if (sectionType === "how_it_works") {
      const stepsJson = formData.get("steps") as string;
      if (stepsJson) {
        try {
          content.steps = JSON.parse(stepsJson);
        } catch (e) {
          content.steps = [];
        }
      }
    } else if (sectionType === "partners") {
      const partnersJson = formData.get("partners") as string;
      if (partnersJson) {
        try {
          content.partners = JSON.parse(partnersJson);
        } catch (e) {
          content.partners = [];
        }
      }
    }

    const data = {
      section_type: sectionType,
      title: formData.get("title") as string || undefined,
      subtitle: formData.get("subtitle") as string || undefined,
      description: formData.get("description") as string || undefined,
      content: Object.keys(content).length > 0 ? content : undefined,
      image_url: formData.get("image_url") as string || undefined,
      background_color: formData.get("background_color") as string || undefined,
      text_color: formData.get("text_color") as string || undefined,
      position: parseInt(formData.get("position") as string) || 0,
      display_order: parseInt(formData.get("display_order") as string) || 0,
      is_active: formData.get("is_active") === "true",
    };

    try {
      if (section?.id) {
        await updateSection(section.id, data);
      } else {
        await createSection(data);
      }
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error saving section:", error);
      alert("Failed to save section. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!section?.id) return;
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      await deleteSection(section.id);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section. Please try again.");
    }
  };

  const handleToggleStatus = async () => {
    if (!section?.id) return;
    try {
      await toggleSectionStatus(section.id, !section.is_active);
      window.location.reload();
    } catch (error) {
      console.error("Error toggling section status:", error);
      alert("Failed to toggle section status. Please try again.");
    }
  };

  return (
    <div>
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} variant={section ? "outline" : "default"}>
          {section ? "Edit" : "Create Section"}
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {section ? "Edit Section" : "Create New Section"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Section Type *
                  </label>
                  <select
                    name="section_type"
                    defaultValue={section?.section_type}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select type</option>
                    <option value="hero">Hero Section</option>
                    <option value="services">Services Section</option>
                    <option value="features">Features Section</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="stats">Stats</option>
                    <option value="how_it_works">How It Works</option>
                    <option value="partners">Partners</option>
                    <option value="cta">CTA Section</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={section?.title || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    defaultValue={section?.subtitle || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={section?.description || ""}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content (JSON) - For testimonials/stats/steps/partners
                  </label>
                  <textarea
                    name={
                      section?.section_type === "testimonials"
                        ? "testimonials"
                        : section?.section_type === "stats"
                        ? "stats"
                        : section?.section_type === "how_it_works"
                        ? "steps"
                        : "partners"
                    }
                    defaultValue={
                      section?.content
                        ? JSON.stringify(section.content, null, 2)
                        : ""
                    }
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder='Example for testimonials: [{"id":"1","name":"John Doe","role":"Customer","content":"Great service!","rating":5}]'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter JSON array format. See examples in the placeholder.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    defaultValue={section?.image_url || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Background Color
                    </label>
                    <input
                      type="text"
                      name="background_color"
                      defaultValue={section?.background_color || ""}
                      placeholder="#ffffff"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <input
                      type="text"
                      name="text_color"
                      defaultValue={section?.text_color || ""}
                      placeholder="#000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Position</label>
                    <input
                      type="number"
                      name="position"
                      defaultValue={section?.position || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      defaultValue={section?.display_order || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      value="true"
                      defaultChecked={section?.is_active !== false}
                      className="rounded"
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : section ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  {section?.id && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleToggleStatus}
                      >
                        {section.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
