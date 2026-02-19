"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateFooterSettings, getFooterSettings } from "./actions";
import toast from "react-hot-toast";

interface FooterSettings {
  id?: string;
  company_name?: string;
  company_description?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  quick_links?: Array<{ name: string; url: string }>;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  cookie_policy_url?: string;
  newsletter_enabled?: boolean;
  newsletter_text?: string;
  copyright_text?: string;
}

export function FooterForm({ initialData }: { initialData: FooterSettings | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FooterSettings>({
    company_name: initialData?.company_name || "Vera Company",
    company_description: initialData?.company_description || "",
    logo_url: initialData?.logo_url || "/logo.png",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    facebook_url: initialData?.facebook_url || "",
    instagram_url: initialData?.instagram_url || "",
    twitter_url: initialData?.twitter_url || "",
    linkedin_url: initialData?.linkedin_url || "",
    quick_links: initialData?.quick_links || [
      { name: "About Us", url: "/about" },
      { name: "Our Services", url: "/services" },
      { name: "Expert Partners", url: "/become-professional" },
      { name: "Pricing Plans", url: "/#pricing" },
      { name: "Careers", url: "/careers" },
    ],
    privacy_policy_url: initialData?.privacy_policy_url || "/privacy-policy",
    terms_of_service_url: initialData?.terms_of_service_url || "/terms-of-service",
    cookie_policy_url: initialData?.cookie_policy_url || "/cookies",
    newsletter_enabled: initialData?.newsletter_enabled ?? true,
    newsletter_text: initialData?.newsletter_text || "Subscribe for latest updates and offers.",
    copyright_text: initialData?.copyright_text || "All rights reserved.",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateFooterSettings(formData);
      
      if (result?.error) {
        toast.error(`Failed to save footer settings: ${result.error}`);
        return;
      }
      
      toast.success("Footer settings saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving footer settings:", error);
      toast.error("Failed to save footer settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuickLink = () => {
    setFormData({
      ...formData,
      quick_links: [...(formData.quick_links || []), { name: "", url: "" }],
    });
  };

  const removeQuickLink = (index: number) => {
    const newLinks = [...(formData.quick_links || [])];
    newLinks.splice(index, 1);
    setFormData({ ...formData, quick_links: newLinks });
  };

  const updateQuickLink = (index: number, field: "name" | "url", value: string) => {
    const newLinks = [...(formData.quick_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, quick_links: newLinks });
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
        <CardTitle className="text-xl font-bold">Footer Settings</CardTitle>
        <p className="text-blue-50 text-sm mt-1">Edit footer content and links</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Info Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
            
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="company_description">Company Description</Label>
              <Textarea
                id="company_description"
                value={formData.company_description}
                onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="/logo.png"
                className="mt-1"
              />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="support@veracompany.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                placeholder="123 Main St, Suite 500, San Francisco, CA 94107"
                className="mt-1"
              />
            </div>
          </div>

          {/* Social Media Links Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook_url">Facebook URL</Label>
                <Input
                  id="facebook_url"
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="instagram_url">Instagram URL</Label>
                <Input
                  id="instagram_url"
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="twitter_url">Twitter URL</Label>
                <Input
                  id="twitter_url"
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4 border-b pb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
              <Button type="button" onClick={addQuickLink} variant="outline" size="sm">
                Add Link
              </Button>
            </div>
            
            <div className="space-y-3">
              {(formData.quick_links || []).map((link, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Link Name</Label>
                    <Input
                      value={link.name}
                      onChange={(e) => updateQuickLink(index, "name", e.target.value)}
                      placeholder="About Us"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Link URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateQuickLink(index, "url", e.target.value)}
                      placeholder="/about"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeQuickLink(index)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Links Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900">Footer Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
                <Input
                  id="privacy_policy_url"
                  value={formData.privacy_policy_url}
                  onChange={(e) => setFormData({ ...formData, privacy_policy_url: e.target.value })}
                  placeholder="/privacy-policy"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="terms_of_service_url">Terms of Service URL</Label>
                <Input
                  id="terms_of_service_url"
                  value={formData.terms_of_service_url}
                  onChange={(e) => setFormData({ ...formData, terms_of_service_url: e.target.value })}
                  placeholder="/terms-of-service"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cookie_policy_url">Cookie Policy URL</Label>
                <Input
                  id="cookie_policy_url"
                  value={formData.cookie_policy_url}
                  onChange={(e) => setFormData({ ...formData, cookie_policy_url: e.target.value })}
                  placeholder="/cookies"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900">Newsletter</h3>
            
            <div>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.newsletter_enabled}
                  onChange={(e) => setFormData({ ...formData, newsletter_enabled: e.target.checked })}
                  className="rounded"
                />
                <span>Enable Newsletter Subscription</span>
              </Label>
            </div>

            {formData.newsletter_enabled && (
              <div>
                <Label htmlFor="newsletter_text">Newsletter Text</Label>
                <Input
                  id="newsletter_text"
                  value={formData.newsletter_text}
                  onChange={(e) => setFormData({ ...formData, newsletter_text: e.target.value })}
                  placeholder="Subscribe for latest updates and offers."
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Copyright Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Copyright</h3>
            
            <div>
              <Label htmlFor="copyright_text">Copyright Text</Label>
              <Input
                id="copyright_text"
                value={formData.copyright_text}
                onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                placeholder="All rights reserved."
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Saving..." : "Save Footer Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
