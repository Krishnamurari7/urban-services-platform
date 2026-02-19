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

// Predefined content keys for book service page with descriptions
const BOOK_SERVICE_PAGE_FIELDS = [
  {
    key: "page_title",
    label: "Page Title (Main Heading)",
    description: "Book Service page का मुख्य शीर्षक",
    placeholder: "Book a Service",
    type: "text",
  },
  {
    key: "page_subtitle",
    label: "Page Subtitle",
    description: "Page title के नीचे दिखाई देने वाला subtitle (optional)",
    placeholder: "Choose your service and book instantly",
    type: "text",
  },
  {
    key: "help_text",
    label: "Help Text / Instructions",
    description: "Page के ऊपर दिखाई देने वाला help text या instructions",
    placeholder: "Select a service, choose a professional, pick a date and time, and complete your booking.",
    type: "textarea",
  },
  {
    key: "step_1_label",
    label: "Step 1 Label (Select Service)",
    description: "Booking process के पहले step का label",
    placeholder: "Select Service",
    type: "text",
  },
  {
    key: "step_2_label",
    label: "Step 2 Label (Choose Professional)",
    description: "Booking process के दूसरे step का label",
    placeholder: "Choose Professional",
    type: "text",
  },
  {
    key: "step_3_label",
    label: "Step 3 Label (Date & Time)",
    description: "Booking process के तीसरे step का label",
    placeholder: "Date & Time",
    type: "text",
  },
  {
    key: "step_4_label",
    label: "Step 4 Label (Address)",
    description: "Booking process के चौथे step का label",
    placeholder: "Address",
    type: "text",
  },
  {
    key: "step_5_label",
    label: "Step 5 Label (Review)",
    description: "Booking process के पांचवें step का label",
    placeholder: "Review",
    type: "text",
  },
  {
    key: "step_6_label",
    label: "Step 6 Label (Payment)",
    description: "Booking process के छठे step का label",
    placeholder: "Payment",
    type: "text",
  },
  {
    key: "payment_secure_text",
    label: "Payment Security Text",
    description: "Payment section में दिखाई देने वाला security message",
    placeholder: "Secure Payment: You will be redirected to Razorpay's secure payment gateway...",
    type: "textarea",
  },
  {
    key: "payment_info_text",
    label: "Payment Info Text",
    description: "Payment section में दिखाई देने वाला additional info",
    placeholder: "Your payment information is secure and encrypted",
    type: "text",
  },
];

interface BookServicePageEditorProps {
  initialContents?: any[];
}

export function BookServicePageEditor({ initialContents = [] }: BookServicePageEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Record<string, any>>({});

  // Initialize form data from existing contents
  useEffect(() => {
    const contentMap: Record<string, any> = {};
    initialContents.forEach((content) => {
      if (content.page_path === "/customer/book-service") {
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
        page_path: "/customer/book-service",
        content_type: "text",
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let savedCount = 0;
      let errorCount = 0;

      for (const field of BOOK_SERVICE_PAGE_FIELDS) {
        const content = contents[field.key];
        const value = content?.content_value?.trim() || "";

        if (!value) {
          // Skip empty fields
          continue;
        }

        const submitData = {
          page_path: "/customer/book-service",
          content_key: field.key,
          content_type: "text",
          content_value: value,
          display_order: BOOK_SERVICE_PAGE_FIELDS.findIndex((f) => f.key === field.key),
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
            Book Service Page Content Editor
          </CardTitle>
          <CardDescription>
            यहाँ आप Book Service page के सभी text और content को edit कर सकते हैं। हर field के नीचे description है जो बताती है कि वह कहाँ दिखाई देगा।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {BOOK_SERVICE_PAGE_FIELDS.map((field) => {
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
