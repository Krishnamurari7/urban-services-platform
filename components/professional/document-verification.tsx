"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ProfessionalDocument {
  id: string;
  professional_id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

const DOCUMENT_TYPES = [
  { value: "id_proof", label: "ID Proof", required: true },
  { value: "certificate", label: "Professional Certificate", required: false },
  { value: "license", label: "License", required: false },
  { value: "background_check", label: "Background Check", required: false },
];

export function DocumentVerification() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ProfessionalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "",
    document_name: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("professional_documents")
        .select("*")
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setFormData({
        ...formData,
        file,
        document_name: file.name,
      });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.file || !formData.document_type) return;

    setUploading(true);
    try {
      const supabase = createClient();

      // Upload file to Supabase Storage
      const fileExt = formData.file.name.split(".").pop();
      const fileName = `${user.id}/${formData.document_type}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("professional-documents")
        .upload(fileName, formData.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        
        // Check if bucket doesn't exist
        if (uploadError.message?.includes("Bucket") || uploadError.message?.includes("not found")) {
          alert(
            "Storage bucket 'professional-documents' not found.\n\n" +
            "Please create it in Supabase Dashboard:\n" +
            "1. Go to Storage in your Supabase project\n" +
            "2. Click 'New bucket'\n" +
            "3. Name: 'professional-documents'\n" +
            "4. Make it Public\n" +
            "5. Click 'Create bucket'\n\n" +
            "Then try uploading again."
          );
          throw new Error("Storage bucket not found");
        }
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("professional-documents")
        .getPublicUrl(fileName);

      // Save document record
      const { error: insertError } = await supabase
        .from("professional_documents")
        .insert({
          professional_id: user.id,
          document_type: formData.document_type,
          document_name: formData.document_name,
          file_url: urlData.publicUrl,
          file_size: formData.file.size,
          mime_type: formData.file.type,
          status: "pending",
        });

      if (insertError) throw insertError;

      // Reset form
      setFormData({
        document_type: "",
        document_name: "",
        file: null,
      });
      setShowUploadForm(false);
      await fetchDocuments();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      // Error message is already shown in the uploadError check above
      if (!error.message?.includes("Storage bucket not found")) {
        alert("Failed to upload document. Please try again.\n\nError: " + (error.message || "Unknown error"));
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find((dt) => dt.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>
                Upload your verification documents to get verified
              </CardDescription>
            </div>
            <Button onClick={() => setShowUploadForm(!showUploadForm)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showUploadForm && (
            <form onSubmit={handleUpload} className="mb-6 p-4 border rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select document type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} {type.required && "(Required)"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.document_name}
                  onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Driver's License"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border rounded-md"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading || !formData.file}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents uploaded yet</p>
              <Button onClick={() => setShowUploadForm(true)} className="mt-4">
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <h3 className="font-semibold">{doc.document_name}</h3>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Type: {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      {doc.file_size && (
                        <p className="text-sm text-gray-600 mb-1">
                          Size: {(doc.file_size / 1024).toFixed(2)} KB
                        </p>
                      )}
                      {doc.status === "rejected" && doc.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 rounded">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {doc.rejection_reason}
                          </p>
                        </div>
                      )}
                      {doc.status === "approved" && doc.verified_at && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Verified on {new Date(doc.verified_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
