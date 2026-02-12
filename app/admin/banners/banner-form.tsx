"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "./actions";

interface Banner {
  id?: string;
  title?: string;
  description?: string | null;
  image_url?: string;
  mobile_image_url?: string | null;
  link_url?: string | null;
  link_text?: string | null;
  position?: number;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

export function BannerForm({ banner }: { banner?: Banner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const mobileImageUrl = formData.get("mobile_image_url") as string;
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string,
      mobile_image_url: mobileImageUrl && mobileImageUrl.trim() ? mobileImageUrl : undefined,
      link_url: formData.get("link_url") as string,
      link_text: formData.get("link_text") as string,
      position: parseInt(formData.get("position") as string) || 0,
      is_active: formData.get("is_active") === "true",
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
    };

    try {
      let result;
      if (banner?.id) {
        result = await updateBanner(banner.id, data);
      } else {
        result = await createBanner(data);
      }
      
      if (result?.error) {
        alert(`Failed to save banner: ${result.error}`);
        return;
      }
      
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert("Failed to save banner. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!banner?.id) return;
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const result = await deleteBanner(banner.id);
      if (result?.error) {
        alert(`Failed to delete banner: ${result.error}`);
        return;
      }
      window.location.reload();
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner. Please try again.");
    }
  };

  const handleToggleStatus = async () => {
    if (!banner?.id) return;

    try {
      const result = await toggleBannerStatus(banner.id, !banner.is_active);
      if (result?.error) {
        alert(`Failed to update banner status: ${result.error}`);
        return;
      }
      window.location.reload();
    } catch (error) {
      console.error("Error toggling banner status:", error);
      alert("Failed to update banner status. Please try again.");
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setIsOpen(true)}
          variant={banner ? "ghost" : "default"}
          size={banner ? "sm" : "md"}
        >
          {banner ? "Edit" : "Create Banner"}
        </Button>
        {banner?.id && (
          <>
            <Button onClick={handleToggleStatus} variant="outline" size="sm">
              {banner.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button onClick={handleDelete} variant="outline" size="sm">
              Delete
            </Button>
          </>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {banner ? "Edit Banner" : "Create New Banner"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={banner?.title}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={banner?.description || ""}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Desktop Image URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="image_url"
                      defaultValue={banner?.image_url}
                      required
                      placeholder="https://example.com/desktop-banner.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Image for desktop/laptop (recommended: 1920x600px)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mobile Image URL <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="mobile_image_url"
                      defaultValue={banner?.mobile_image_url || ""}
                      placeholder="https://example.com/mobile-banner.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Image for mobile devices (recommended: 800x600px). If not provided, desktop image will be used.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Link URL
                    </label>
                    <input
                      type="url"
                      name="link_url"
                      defaultValue={banner?.link_url || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Link Text
                    </label>
                    <input
                      type="text"
                      name="link_text"
                      defaultValue={banner?.link_text || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Position
                    </label>
                    <input
                      type="number"
                      name="position"
                      defaultValue={banner?.position || 0}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      defaultValue={
                        banner?.start_date
                          ? new Date(banner.start_date)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      defaultValue={
                        banner?.end_date
                          ? new Date(banner.end_date).toISOString().slice(0, 16)
                          : ""
                      }
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
                      defaultChecked={banner?.is_active ?? true}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : banner ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
