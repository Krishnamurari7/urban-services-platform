"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createPageContent, updatePageContent } from "./actions";
import { useRouter } from "next/navigation";
import { Save, Eye, Info } from "lucide-react";
import toast from "react-hot-toast";

// Predefined content keys for customer dashboard with descriptions
const CUSTOMER_DASHBOARD_FIELDS = [
  {
    key: "welcome_message",
    label: "Welcome Message",
    description: "Dashboard के सबसे ऊपर दिखाई देने वाला welcome message (user name automatically add होगा)",
    placeholder: "Welcome back",
    type: "text",
  },
  {
    key: "hero_title",
    label: "Hero Title (Main Heading)",
    description: "Dashboard का मुख्य शीर्षक - 'all in one place' text automatically highlight होगा",
    placeholder: "Your services, all in one place.",
    type: "text",
  },
  {
    key: "hero_description",
    label: "Hero Description",
    description: "Hero title के नीचे दिखाई देने वाला विवरण",
    placeholder: "Manage your bookings, track your services, and discover new professional help.",
    type: "textarea",
  },
  {
    key: "popular_services_title",
    label: "Popular Services Section Title",
    description: "Popular Services section का title",
    placeholder: "Popular Services",
    type: "text",
  },
  {
    key: "popular_services_description",
    label: "Popular Services Section Description",
    description: "Popular Services section का description",
    placeholder: "Browse our most requested services",
    type: "textarea",
  },
  {
    key: "recent_bookings_title",
    label: "Recent Bookings Section Title",
    description: "Recent Bookings section का title",
    placeholder: "Recent Bookings",
    type: "text",
  },
  {
    key: "recent_bookings_description",
    label: "Recent Bookings Section Description",
    description: "Recent Bookings section का description",
    placeholder: "View and manage your recent service bookings",
    type: "textarea",
  },
];

interface CustomerDashboardEditorProps {
  initialContents?: any[];
}

export function CustomerDashboardEditor({ initialContents = [] }: CustomerDashboardEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Record<string, any>>({});

  // Initialize form data from existing contents
  useEffect(() => {
    const contentMap: Record<string, any> = {};
    initialContents.forEach((content) => {
      if (content.page_path === "/customer/dashboard") {
        contentMap[content.content_key] = content;
      }
    });
    setContents(contentMap);
  }, [initialContents]);

  const handleFieldChange = (key: string, value: string) => {
    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        content_value: value,
        content_key: key,
        page_path: "/customer/dashboard",
        content_type: "text",
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let savedCount = 0;
      let errorCount = 0;

      for (const field of CUSTOMER_DASHBOARD_FIELDS) {
        const content = contents[field.key];
        const value = content?.content_value?.trim() || "";

        if (!value) {
          // Skip empty fields
          continue;
        }

        const submitData = {
          page_path: "/customer/dashboard",
          content_key: field.key,
          content_type: "text",
          content_value: value,
          display_order: CUSTOMER_DASHBOARD_FIELDS.findIndex((f) => f.key === field.key),
          is_active: true,
        };

        try {
          if (content?.id) {
            // Update existing
            const result = await updatePageContent(content.id, {
              content_value: value,
              content_type: "text",
              is_active: true,
            });
            if (result.error) {
              errorCount++;
              console.error(`Error updating ${field.key}:`, result.error);
            } else {
              savedCount++;
            }
          } else {
            // Create new
            const result = await createPageContent(submitData);
            if (result.error) {
              errorCount++;
              console.error(`Error creating ${field.key}:`, result.error);
            } else {
              savedCount++;
            }
          }
        } catch (error: any) {
          errorCount++;
          console.error(`Error saving ${field.key}:`, error);
        }
      }

      if (errorCount === 0) {
        toast.success(`${savedCount} fields saved successfully!`);
        router.refresh();
      } else {
        toast.error(`Saved ${savedCount} fields, but ${errorCount} failed`);
      }
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Customer Dashboard Content Editor
          </CardTitle>
          <CardDescription>
            यहाँ आप customer dashboard के सभी text और content को edit कर सकते हैं। हर field के नीचे description है जो बताती है कि वह कहाँ दिखाई देगा।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {CUSTOMER_DASHBOARD_FIELDS.map((field) => {
            const content = contents[field.key];
            const value = content?.content_value || "";

            return (
              <div key={field.key} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Label htmlFor={field.key} className="text-base font-semibold">
                    {field.label}
                  </Label>
                  <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                </div>
                <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
                  {field.description}
                </p>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full"
                  />
                )}
                {content?.is_active === false && (
                  <p className="text-xs text-orange-600">⚠️ यह content currently inactive है</p>
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save All Changes"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              💡 Tip: सभी fields को fill करने के बाद "Save All Changes" button click करें
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
