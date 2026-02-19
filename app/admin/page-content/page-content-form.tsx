"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPageContent, updatePageContent, deletePageContent } from "./actions";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Edit } from "lucide-react";
import toast from "react-hot-toast";

interface PageContentFormProps {
  content?: any;
  pagePath?: string;
}

export function PageContentForm({ content, pagePath }: PageContentFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    page_path: content?.page_path || pagePath || "",
    content_key: content?.content_key || "",
    content_type: content?.content_type || "text",
    content_value: content?.content_value || "",
    display_order: content?.display_order?.toString() || "0",
    is_active: content?.is_active ?? true,
  });

  // Reset form data when dialog opens or content changes
  useEffect(() => {
    if (open) {
      setFormData({
        page_path: (content?.page_path || pagePath || "").trim(),
        content_key: (content?.content_key || "").trim(),
        content_type: content?.content_type || "text",
        content_value: content?.content_value || "",
        display_order: content?.display_order?.toString() || "0",
        is_active: content?.is_active ?? true,
      });
    }
  }, [open, content, pagePath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields
    if (!formData.page_path || !formData.content_key) {
      toast.error("Page path and content key are required");
      return;
    }

    setLoading(true);

    try {
      let result;
      const submitData: any = {
        page_path: formData.page_path.trim(),
        content_key: formData.content_key.trim(),
        content_type: formData.content_type || "text",
        display_order: parseInt(formData.display_order) || 0,
        is_active: formData.is_active,
      };

      // JSON format removed - only use text, html, or image_url
      submitData.content_value = formData.content_value || "";
      submitData.content_json = null; // Always clear JSON

      if (content?.id) {
        result = await updatePageContent(content.id, submitData);
      } else {
        result = await createPageContent(submitData);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(content?.id ? "Content updated successfully" : "Content created successfully");
        setOpen(false);
        // Reset form after successful submission
        setFormData({
          page_path: pagePath || "",
          content_key: "",
          content_type: "text",
          content_value: "",
          display_order: "0",
          is_active: true,
        });
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast.error(error.message || "Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!content?.id) return;
    if (!confirm("Are you sure you want to delete this content?")) return;

    setLoading(true);
    try {
      const result = await deletePageContent(content.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Content deleted successfully");
        setOpen(false);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error deleting content:", error);
      toast.error(error.message || "Failed to delete content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      // Reset form when dialog closes
      if (!newOpen) {
        setFormData({
          page_path: pagePath || "",
          content_key: "",
          content_type: "text",
          content_value: "",
          display_order: "0",
          is_active: true,
        });
      }
    }}>
      <DialogTrigger asChild>
        {content ? (
          <Button variant="outline" size="sm" className="min-w-[100px]">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button size="sm" className="min-w-[140px] bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" key={`${content?.id || 'new'}-${pagePath || ''}`}>
        <DialogHeader>
          <DialogTitle>
            {content ? "Edit Page Content" : "Add New Page Content"}
          </DialogTitle>
          <DialogDescription>
            Manage content that appears on pages. Content will be displayed on the specified page path.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="page_path">Page Path</Label>
            <Input
              id="page_path"
              value={formData.page_path}
              onChange={(e) => setFormData({ ...formData, page_path: e.target.value })}
              placeholder="/customer/dashboard"
              required
              disabled={!!content}
            />
            <p className="text-xs text-gray-500 mt-1">
              The URL path where this content will appear
            </p>
          </div>

          <div>
            <Label htmlFor="content_key">Content Key</Label>
            <Input
              id="content_key"
              value={formData.content_key}
              onChange={(e) => setFormData({ ...formData, content_key: e.target.value })}
              placeholder="welcome_message"
              required
              disabled={!!content}
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier for this content (e.g., hero_title, welcome_message)
            </p>
          </div>

          <div>
            <Label htmlFor="content_type">Content Type</Label>
            <Select
              value={formData.content_type}
              onValueChange={(value) => setFormData({ ...formData, content_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text (सामान्य text)</SelectItem>
                <SelectItem value="html">HTML (HTML code के लिए)</SelectItem>
                <SelectItem value="image_url">Image URL (Image link के लिए)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              JSON format remove कर दिया गया है - अब सिर्फ Text, HTML, या Image URL use करें
            </p>
          </div>

          <div>
            <Label htmlFor="content_value">
              {formData.content_type === "image_url" ? "Image URL" : "Content"}
            </Label>
            {formData.content_type === "html" ? (
              <Textarea
                id="content_value"
                value={formData.content_value}
                onChange={(e) => setFormData({ ...formData, content_value: e.target.value })}
                placeholder="Enter HTML content..."
                rows={8}
                className="font-mono text-sm"
              />
            ) : (
              <Textarea
                id="content_value"
                value={formData.content_value}
                onChange={(e) => setFormData({ ...formData, content_value: e.target.value })}
                placeholder={formData.content_type === "image_url" ? "https://example.com/image.jpg" : "Enter the content text..."}
                rows={6}
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.content_type === "image_url" 
                ? "Image का पूरा URL enter करें (जैसे: https://example.com/image.jpg)"
                : "यहाँ content type करें - यह page पर दिखाई देगा"}
            </p>
          </div>

          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex items-center justify-between pt-4">
            {content && (
              <Button
                type="button"
                variant="destructive"
                onClick={(e) => handleDelete(e)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {loading ? "Saving..." : content ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
