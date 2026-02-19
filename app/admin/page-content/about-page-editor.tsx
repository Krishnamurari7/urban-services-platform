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

// Predefined content keys for about page with descriptions
const ABOUT_PAGE_FIELDS = [
  // Hero Section
  {
    key: "hero_title",
    label: "Hero Title (Main Heading)",
    description: "About page के सबसे ऊपर दिखाई देने वाला मुख्य शीर्षक",
    placeholder: "About Vera Company",
    type: "text",
  },
  {
    key: "hero_description",
    label: "Hero Description",
    description: "Hero section में दिखाई देने वाला विवरण",
    placeholder: "We're revolutionizing the way people connect with professional services...",
    type: "textarea",
  },
  // Story Section
  {
    key: "story_paragraph_1",
    label: "Story Paragraph 1",
    description: "Our Story section का पहला paragraph",
    placeholder: "Vera Company was founded with a simple mission...",
    type: "textarea",
  },
  {
    key: "story_paragraph_2",
    label: "Story Paragraph 2",
    description: "Our Story section का दूसरा paragraph",
    placeholder: "Today, we've built a platform that brings together...",
    type: "textarea",
  },
  {
    key: "story_paragraph_3",
    label: "Story Paragraph 3",
    description: "Our Story section का तीसरा paragraph",
    placeholder: "We're proud to serve thousands of customers...",
    type: "textarea",
  },
  // Stats Section
  {
    key: "stats_customers",
    label: "Happy Customers Stat",
    description: "Happy Customers का value (जैसे: 10,000+)",
    placeholder: "10,000+",
    type: "text",
  },
  {
    key: "stats_professionals",
    label: "Verified Professionals Stat",
    description: "Verified Professionals का value (जैसे: 500+)",
    placeholder: "500+",
    type: "text",
  },
  {
    key: "stats_services",
    label: "Services Completed Stat",
    description: "Services Completed का value (जैसे: 50,000+)",
    placeholder: "50,000+",
    type: "text",
  },
  {
    key: "stats_rating",
    label: "Average Rating Stat",
    description: "Average Rating का value (जैसे: 4.8★)",
    placeholder: "4.8★",
    type: "text",
  },
  // Values Section
  {
    key: "values_title",
    label: "Values Section Title",
    description: "Our Values section का title",
    placeholder: "Our Values",
    type: "text",
  },
  {
    key: "values_subtitle",
    label: "Values Section Subtitle",
    description: "Our Values section का subtitle",
    placeholder: "The principles that guide everything we do",
    type: "text",
  },
  {
    key: "value_1_title",
    label: "Value 1 Title (Trust & Safety)",
    description: "पहले value का title",
    placeholder: "Trust & Safety",
    type: "text",
  },
  {
    key: "value_1_description",
    label: "Value 1 Description",
    description: "पहले value का description",
    placeholder: "Every professional is verified and background checked...",
    type: "textarea",
  },
  {
    key: "value_2_title",
    label: "Value 2 Title (Customer First)",
    description: "दूसरे value का title",
    placeholder: "Customer First",
    type: "text",
  },
  {
    key: "value_2_description",
    label: "Value 2 Description",
    description: "दूसरे value का description",
    placeholder: "Your satisfaction is our top priority...",
    type: "textarea",
  },
  {
    key: "value_3_title",
    label: "Value 3 Title (Excellence)",
    description: "तीसरे value का title",
    placeholder: "Excellence",
    type: "text",
  },
  {
    key: "value_3_description",
    label: "Value 3 Description",
    description: "तीसरे value का description",
    placeholder: "We maintain the highest standards of quality...",
    type: "textarea",
  },
  {
    key: "value_4_title",
    label: "Value 4 Title (Community)",
    description: "चौथे value का title",
    placeholder: "Community",
    type: "text",
  },
  {
    key: "value_4_description",
    label: "Value 4 Description",
    description: "चौथे value का description",
    placeholder: "Building connections between professionals and customers...",
    type: "textarea",
  },
  // Mission & Vision
  {
    key: "mission_title",
    label: "Mission Title",
    description: "Our Mission card का title",
    placeholder: "Our Mission",
    type: "text",
  },
  {
    key: "mission_text",
    label: "Mission Text",
    description: "Our Mission card का text",
    placeholder: "To make professional services accessible, reliable...",
    type: "textarea",
  },
  {
    key: "vision_title",
    label: "Vision Title",
    description: "Our Vision card का title",
    placeholder: "Our Vision",
    type: "text",
  },
  {
    key: "vision_text",
    label: "Vision Text",
    description: "Our Vision card का text",
    placeholder: "To become the most trusted platform for professional services...",
    type: "textarea",
  },
  // CTA Section
  {
    key: "cta_title",
    label: "CTA Section Title",
    description: "Join Us Today section का title",
    placeholder: "Join Us Today",
    type: "text",
  },
  {
    key: "cta_description",
    label: "CTA Section Description",
    description: "Join Us Today section का description",
    placeholder: "Whether you're looking for services or want to offer them...",
    type: "textarea",
  },
  {
    key: "cta_button_1_text",
    label: "CTA Button 1 Text",
    description: "पहले button का text",
    placeholder: "Get Started",
    type: "text",
  },
  {
    key: "cta_button_1_link",
    label: "CTA Button 1 Link",
    description: "पहले button का link",
    placeholder: "/register",
    type: "text",
  },
  {
    key: "cta_button_2_text",
    label: "CTA Button 2 Text",
    description: "दूसरे button का text",
    placeholder: "Become a Professional",
    type: "text",
  },
  {
    key: "cta_button_2_link",
    label: "CTA Button 2 Link",
    description: "दूसरे button का link",
    placeholder: "/become-professional",
    type: "text",
  },
];

interface AboutPageEditorProps {
  initialContents?: any[];
}

export function AboutPageEditor({ initialContents = [] }: AboutPageEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Record<string, any>>({});

  // Initialize form data from existing contents
  useEffect(() => {
    const contentMap: Record<string, any> = {};
    initialContents.forEach((content) => {
      if (content.page_path === "/about") {
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
        page_path: "/about",
        content_type: "text",
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let savedCount = 0;
      let errorCount = 0;

      for (const field of ABOUT_PAGE_FIELDS) {
        const content = contents[field.key];
        const value = content?.content_value?.trim() || "";

        if (!value) {
          // Skip empty fields
          continue;
        }

        const submitData = {
          page_path: "/about",
          content_key: field.key,
          content_type: "text",
          content_value: value,
          display_order: ABOUT_PAGE_FIELDS.findIndex((f) => f.key === field.key),
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
            About Page Content Editor
          </CardTitle>
          <CardDescription>
            यहाँ आप About page के सभी text और content को edit कर सकते हैं। हर field के नीचे description है जो बताती है कि वह कहाँ दिखाई देगा।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ABOUT_PAGE_FIELDS.map((field) => {
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
