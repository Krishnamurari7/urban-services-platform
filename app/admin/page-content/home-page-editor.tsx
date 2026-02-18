"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createPageContent, updatePageContent, getPageContentsForAdmin } from "./actions";
import { useRouter } from "next/navigation";
import { Save, Eye, Info } from "lucide-react";
import toast from "react-hot-toast";

// Predefined content keys for home page with descriptions
const HOME_PAGE_FIELDS = [
  {
    key: "hero_title",
    label: "Hero Title (Main Heading)",
    description: "यह homepage के सबसे ऊपर दिखाई देगा - मुख्य शीर्षक",
    placeholder: "Professional Home Services at Your Doorstep",
    type: "text",
  },
  {
    key: "hero_subtitle",
    label: "Hero Subtitle (Highlighted Text)",
    description: "यह title में नीले रंग में दिखाई देगा",
    placeholder: "Home Services",
    type: "text",
  },
  {
    key: "hero_description",
    label: "Hero Description",
    description: "Hero section के नीचे दिखाई देने वाला विवरण",
    placeholder: "Book verified experts for home cleaning, sanitization, and maintenance...",
    type: "textarea",
  },
  {
    key: "hero_trust_text",
    label: "Trust Text",
    description: "Hero section में दिखाई देने वाला trust message",
    placeholder: "Trusted by 10,000+ households",
    type: "text",
  },
  {
    key: "hero_certification_text",
    label: "Certification Text",
    description: "Certification badge में दिखाई देने वाला text",
    placeholder: "CERTIFIED EXPERTS",
    type: "text",
  },
  {
    key: "hero_certification_subtext",
    label: "Certification Subtext",
    description: "Certification badge में दिखाई देने वाला subtext",
    placeholder: "100% Background Checked",
    type: "text",
  },
  {
    key: "hero_image_url",
    label: "Hero Image URL",
    description: "Hero section में दिखाई देने वाली image का URL",
    placeholder: "https://example.com/image.jpg",
    type: "url",
  },
];

interface HomePageEditorProps {
  initialContents?: any[];
}

export function HomePageEditor({ initialContents = [] }: HomePageEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Record<string, any>>({});

  // Initialize form data from existing contents
  useEffect(() => {
    const contentMap: Record<string, any> = {};
    initialContents.forEach((content) => {
      if (content.page_path === "/") {
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
        page_path: "/",
        content_type: "text",
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let savedCount = 0;
      let errorCount = 0;

      for (const field of HOME_PAGE_FIELDS) {
        const content = contents[field.key];
        const value = content?.content_value?.trim() || "";

        if (!value) {
          // Skip empty fields
          continue;
        }

        const submitData = {
          page_path: "/",
          content_key: field.key,
          content_type: "text",
          content_value: value,
          display_order: HOME_PAGE_FIELDS.findIndex((f) => f.key === field.key),
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
            Home Page Content Editor
          </CardTitle>
          <CardDescription>
            यहाँ आप homepage के सभी text और content को edit कर सकते हैं। हर field के नीचे description है जो बताती है कि वह कहाँ दिखाई देगा।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {HOME_PAGE_FIELDS.map((field) => {
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
