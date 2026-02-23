"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { createComprehensiveService, updateComprehensiveService } from "./comprehensive-actions";
import { uploadImage } from "@/lib/utils/image-upload";
import { useAuth } from "@/hooks/use-auth";

interface PricingVariant {
  id?: string;
  title: string;
  price: number;
  duration_minutes: number;
  discount_price?: number;
  is_popular: boolean;
}

interface Feature {
  id?: string;
  feature_title: string;
}

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

interface GalleryImage {
  id?: string;
  image_url: string;
  alt_text?: string;
}

interface ServiceData {
  id?: string;
  name?: string;
  slug?: string;
  short_description?: string;
  long_description?: string;
  category?: string;
  subcategory?: string;
  service_type?: "normal" | "intense" | "deep";
  thumbnail_image?: string;
  image_url?: string;
  status?: "active" | "inactive" | "suspended";
  duration_label?: string;
  best_for?: string;
  cleaning_type?: string;
  equipment_used?: string;
  warranty_info?: string;
  pricing?: PricingVariant[];
  features?: Feature[];
  faqs?: FAQ[];
  gallery?: GalleryImage[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };
}

export function ComprehensiveServiceForm({ service }: { service?: ServiceData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState<ServiceData>({
    name: service?.name || "",
    slug: service?.slug || "",
    short_description: service?.short_description || "",
    long_description: service?.long_description || "",
    category: service?.category || "",
    subcategory: service?.subcategory || "",
    service_type: service?.service_type || "normal",
    thumbnail_image: service?.thumbnail_image || "",
    image_url: service?.image_url || "",
    status: service?.status || "active",
    duration_label: service?.duration_label || "",
    best_for: service?.best_for || "",
    cleaning_type: service?.cleaning_type || "",
    equipment_used: service?.equipment_used || "",
    warranty_info: service?.warranty_info || "",
    pricing: service?.pricing || [],
    features: service?.features || [],
    faqs: service?.faqs || [],
    gallery: service?.gallery || [],
    seo: service?.seo || {
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    },
  });

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSEOChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    handleInputChange("name", name);
    if (!service?.id) {
      // Only auto-generate for new services
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      handleInputChange("slug", slug);
    }
  };

  // Pricing management
  const addPricing = () => {
    setFormData((prev) => ({
      ...prev,
      pricing: [
        ...(prev.pricing || []),
        {
          title: "",
          price: 0,
          duration_minutes: 60,
          is_popular: false,
        },
      ],
    }));
  };

  const updatePricing = (index: number, field: keyof PricingVariant, value: any) => {
    setFormData((prev) => {
      const pricing = [...(prev.pricing || [])];
      pricing[index] = { ...pricing[index], [field]: value };
      return { ...prev, pricing };
    });
  };

  const removePricing = (index: number) => {
    setFormData((prev) => {
      const pricing = [...(prev.pricing || [])];
      pricing.splice(index, 1);
      return { ...prev, pricing };
    });
  };

  // Features management
  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), { feature_title: "" }],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => {
      const features = [...(prev.features || [])];
      features[index] = { ...features[index], feature_title: value };
      return { ...prev, features };
    });
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => {
      const features = [...(prev.features || [])];
      features.splice(index, 1);
      return { ...prev, features };
    });
  };

  // FAQ management
  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }],
    }));
  };

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    setFormData((prev) => {
      const faqs = [...(prev.faqs || [])];
      faqs[index] = { ...faqs[index], [field]: value };
      return { ...prev, faqs };
    });
  };

  const removeFAQ = (index: number) => {
    setFormData((prev) => {
      const faqs = [...(prev.faqs || [])];
      faqs.splice(index, 1);
      return { ...prev, faqs };
    });
  };

  // Image upload handlers
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImages((prev) => [...prev, "thumbnail"]);
    try {
      const result = await uploadImage({
        file,
        bucket: "service-images",
        folder: "thumbnails",
        userId: user?.id,
      });

      if (result.error) {
        alert(`Failed to upload thumbnail: ${result.error}`);
      } else {
        handleInputChange("thumbnail_image", result.url);
        handleInputChange("image_url", result.url); // Also set as main image
      }
    } catch (error: any) {
      alert(`Error uploading thumbnail: ${error.message}`);
    } finally {
      setUploadingImages((prev) => prev.filter((id) => id !== "thumbnail"));
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages((prev) => [...prev, ...files.map((_, i) => `gallery-${i}`)]);
    try {
      const uploadPromises = files.map((file) =>
        uploadImage({
          file,
          bucket: "service-images",
          folder: "gallery",
          userId: user?.id,
        })
      );

      const results = await Promise.all(uploadPromises);
      const newGalleryImages = results
        .filter((r) => !r.error)
        .map((r) => ({ image_url: r.url, alt_text: "" }));

      setFormData((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...newGalleryImages],
      }));
    } catch (error: any) {
      alert(`Error uploading gallery images: ${error.message}`);
    } finally {
      setUploadingImages((prev) => prev.filter((id) => !id.startsWith("gallery-")));
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => {
      const gallery = [...(prev.gallery || [])];
      gallery.splice(index, 1);
      return { ...prev, gallery };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.slug || !formData.category) {
        alert("Please fill in all required fields: Name, Slug, and Category");
        setIsSubmitting(false);
        return;
      }

      // Filter out empty pricing, features, and FAQs
      const cleanedData = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        short_description: formData.short_description,
        long_description: formData.long_description,
        subcategory: formData.subcategory,
        service_type: formData.service_type,
        thumbnail_image: formData.thumbnail_image,
        image_url: formData.image_url,
        status: formData.status,
        duration_label: formData.duration_label,
        best_for: formData.best_for,
        cleaning_type: formData.cleaning_type,
        equipment_used: formData.equipment_used,
        warranty_info: formData.warranty_info,
        pricing: formData.pricing?.filter(
          (p) => p.title && p.price > 0
        ),
        features: formData.features?.filter(
          (f) => f.feature_title.trim() !== ""
        ),
        faqs: formData.faqs?.filter(
          (f) => f.question.trim() !== "" && f.answer.trim() !== ""
        ),
        gallery: formData.gallery,
        seo: formData.seo,
      };

      if (service?.id) {
        await updateComprehensiveService(service.id, cleanedData);
      } else {
        await createComprehensiveService(cleanedData);
      }

      setIsOpen(false);
      window.location.reload();
    } catch (error: any) {
      console.error("Error saving service:", error);
      alert(error.message || "Failed to save service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={service ? "ghost" : "default"}
        size={service ? "sm" : "md"}
      >
        {service ? "Edit" : "Add Service"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {service ? "Edit Service" : "Create New Service"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Service Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          required
                          placeholder="e.g., Bathroom Cleaning"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Slug *
                        </label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => handleInputChange("slug", e.target.value)}
                          required
                          placeholder="bathroom-cleaning"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Short Description *
                      </label>
                      <Textarea
                        value={formData.short_description}
                        onChange={(e) =>
                          handleInputChange("short_description", e.target.value)
                        }
                        required
                        rows={2}
                        placeholder="Brief description for service cards"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Long Description
                      </label>
                      <Textarea
                        value={formData.long_description}
                        onChange={(e) =>
                          handleInputChange("long_description", e.target.value)
                        }
                        rows={5}
                        placeholder="Detailed description (supports rich text)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Category *
                        </label>
                        <Input
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange("category", e.target.value)
                          }
                          required
                          placeholder="e.g., Bathroom, Kitchen"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Subcategory
                        </label>
                        <Input
                          value={formData.subcategory || ""}
                          onChange={(e) =>
                            handleInputChange("subcategory", e.target.value)
                          }
                          placeholder="Optional subcategory"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Service Type *
                        </label>
                        <select
                          value={formData.service_type}
                          onChange={(e) =>
                            handleInputChange(
                              "service_type",
                              e.target.value as "normal" | "intense" | "deep"
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="normal">Normal</option>
                          <option value="intense">Intense</option>
                          <option value="deep">Deep</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Status *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            handleInputChange(
                              "status",
                              e.target.value as "active" | "inactive" | "suspended"
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Thumbnail Image *
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => thumbnailInputRef.current?.click()}
                          disabled={uploadingImages.includes("thumbnail")}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingImages.includes("thumbnail")
                            ? "Uploading..."
                            : "Upload Thumbnail"}
                        </Button>
                        {formData.thumbnail_image && (
                          <div className="flex items-center gap-2">
                            <img
                              src={formData.thumbnail_image}
                              alt="Thumbnail"
                              className="h-16 w-16 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInputChange("thumbnail_image", "")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Gallery Images
                      </label>
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={uploadingImages.some((id) =>
                          id.startsWith("gallery-")
                        )}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {uploadingImages.some((id) => id.startsWith("gallery-"))
                          ? "Uploading..."
                          : "Add Gallery Images"}
                      </Button>
                      {formData.gallery && formData.gallery.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {formData.gallery.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img.image_url}
                                alt={img.alt_text || `Gallery ${idx + 1}`}
                                className="h-24 w-full object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600"
                                onClick={() => removeGalleryImage(idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Duration Label
                        </label>
                        <Input
                          value={formData.duration_label || ""}
                          onChange={(e) =>
                            handleInputChange("duration_label", e.target.value)
                          }
                          placeholder="e.g., 60 minutes"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Best For
                        </label>
                        <Input
                          value={formData.best_for || ""}
                          onChange={(e) =>
                            handleInputChange("best_for", e.target.value)
                          }
                          placeholder="e.g., Regular maintenance"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Cleaning Type
                        </label>
                        <Input
                          value={formData.cleaning_type || ""}
                          onChange={(e) =>
                            handleInputChange("cleaning_type", e.target.value)
                          }
                          placeholder="e.g., Deep cleaning"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Equipment Used
                        </label>
                        <Input
                          value={formData.equipment_used || ""}
                          onChange={(e) =>
                            handleInputChange("equipment_used", e.target.value)
                          }
                          placeholder="e.g., Professional tools"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Warranty Info
                      </label>
                      <Textarea
                        value={formData.warranty_info || ""}
                        onChange={(e) =>
                          handleInputChange("warranty_info", e.target.value)
                        }
                        rows={2}
                        placeholder="Warranty or guarantee information"
                      />
                    </div>
                  </TabsContent>

                  {/* Pricing Tab */}
                  <TabsContent value="pricing" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Pricing Variants</h3>
                      <Button type="button" onClick={addPricing} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Pricing
                      </Button>
                    </div>

                    {formData.pricing && formData.pricing.length > 0 ? (
                      <div className="space-y-4">
                        {formData.pricing.map((price, index) => (
                          <Card key={index} className="p-4">
                            <div className="grid grid-cols-12 gap-4 items-end">
                              <div className="col-span-3">
                                <label className="block text-sm font-medium mb-1">
                                  Title *
                                </label>
                                <Input
                                  value={price.title}
                                  onChange={(e) =>
                                    updatePricing(index, "title", e.target.value)
                                  }
                                  placeholder="e.g., 1 x Bathroom"
                                  required
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                  Price (₹) *
                                </label>
                                <Input
                                  type="number"
                                  value={price.price}
                                  onChange={(e) =>
                                    updatePricing(
                                      index,
                                      "price",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                  Discount (₹)
                                </label>
                                <Input
                                  type="number"
                                  value={price.discount_price || ""}
                                  onChange={(e) =>
                                    updatePricing(
                                      index,
                                      "discount_price",
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined
                                    )
                                  }
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                  Duration (min) *
                                </label>
                                <Input
                                  type="number"
                                  value={price.duration_minutes}
                                  onChange={(e) =>
                                    updatePricing(
                                      index,
                                      "duration_minutes",
                                      parseInt(e.target.value) || 60
                                    )
                                  }
                                  min="1"
                                  required
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={price.is_popular}
                                    onChange={(e) =>
                                      updatePricing(
                                        index,
                                        "is_popular",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  Popular
                                </label>
                              </div>
                              <div className="col-span-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePricing(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No pricing variants added. Click "Add Pricing" to add one.
                      </p>
                    )}
                  </TabsContent>

                  {/* Features Tab */}
                  <TabsContent value="features" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Service Features</h3>
                      <Button type="button" onClick={addFeature} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>

                    {formData.features && formData.features.length > 0 ? (
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={feature.feature_title}
                              onChange={(e) =>
                                updateFeature(index, e.target.value)
                              }
                              placeholder="e.g., Wall cleaning"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFeature(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No features added. Click "Add Feature" to add one.
                      </p>
                    )}
                  </TabsContent>

                  {/* FAQ Tab */}
                  <TabsContent value="faq" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                      <Button type="button" onClick={addFAQ} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add FAQ
                      </Button>
                    </div>

                    {formData.faqs && formData.faqs.length > 0 ? (
                      <div className="space-y-4">
                        {formData.faqs.map((faq, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Question *
                                </label>
                                <Input
                                  value={faq.question}
                                  onChange={(e) =>
                                    updateFAQ(index, "question", e.target.value)
                                  }
                                  placeholder="Enter question"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Answer *
                                </label>
                                <Textarea
                                  value={faq.answer}
                                  onChange={(e) =>
                                    updateFAQ(index, "answer", e.target.value)
                                  }
                                  placeholder="Enter answer"
                                  rows={3}
                                  required
                                />
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFAQ(index)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No FAQs added. Click "Add FAQ" to add one.
                      </p>
                    )}
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Meta Title
                      </label>
                      <Input
                        value={formData.seo?.meta_title || ""}
                        onChange={(e) =>
                          handleSEOChange("meta_title", e.target.value)
                        }
                        placeholder="SEO title for search engines"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Meta Description
                      </label>
                      <Textarea
                        value={formData.seo?.meta_description || ""}
                        onChange={(e) =>
                          handleSEOChange("meta_description", e.target.value)
                        }
                        rows={3}
                        placeholder="SEO description for search engines"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Meta Keywords
                      </label>
                      <Input
                        value={formData.seo?.meta_keywords || ""}
                        onChange={(e) =>
                          handleSEOChange("meta_keywords", e.target.value)
                        }
                        placeholder="Comma-separated keywords"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : service
                      ? "Update Service"
                      : "Create Service"}
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
