-- ============================================
-- Document Verification Table
-- ============================================
-- Stores verification documents for professionals

CREATE TABLE IF NOT EXISTS professional_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- e.g., 'id_proof', 'certificate', 'license', 'background_check'
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_professional_documents_professional_id ON professional_documents(professional_id);
CREATE INDEX idx_professional_documents_status ON professional_documents(status);

-- RLS Policies
ALTER TABLE professional_documents ENABLE ROW LEVEL SECURITY;

-- Professionals can view their own documents
CREATE POLICY "Professionals can view own documents"
  ON professional_documents FOR SELECT
  USING (professional_id = auth.uid());

-- Professionals can insert their own documents
CREATE POLICY "Professionals can insert own documents"
  ON professional_documents FOR INSERT
  WITH CHECK (professional_id = auth.uid());

-- Professionals can update their own documents (only pending ones)
CREATE POLICY "Professionals can update own pending documents"
  ON professional_documents FOR UPDATE
  USING (professional_id = auth.uid() AND status = 'pending');

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON professional_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update document status
CREATE POLICY "Admins can update document status"
  ON professional_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_professional_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_professional_documents_updated_at_trigger
  BEFORE UPDATE ON professional_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_documents_updated_at();
