-- ============================================
-- Professional Bank Accounts Table
-- ============================================
-- Stores bank account details for professional payments

CREATE TABLE IF NOT EXISTS professional_bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch_name TEXT,
  account_type TEXT DEFAULT 'savings' CHECK (account_type IN ('savings', 'current')),
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_professional_bank_accounts_professional_id ON professional_bank_accounts(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_bank_accounts_is_primary ON professional_bank_accounts(professional_id, is_primary) WHERE is_primary = true;

-- Partial unique index to ensure only one primary account per professional
CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_bank_accounts_single_primary 
  ON professional_bank_accounts(professional_id) 
  WHERE is_primary = true;

-- RLS Policies
ALTER TABLE professional_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Professionals can view own bank accounts" ON professional_bank_accounts;
DROP POLICY IF EXISTS "Professionals can insert own bank accounts" ON professional_bank_accounts;
DROP POLICY IF EXISTS "Professionals can update own bank accounts" ON professional_bank_accounts;
DROP POLICY IF EXISTS "Professionals can delete own bank accounts" ON professional_bank_accounts;
DROP POLICY IF EXISTS "Admins can view all bank accounts" ON professional_bank_accounts;
DROP POLICY IF EXISTS "Admins can update bank account verification" ON professional_bank_accounts;

-- Professionals can view their own bank accounts
CREATE POLICY "Professionals can view own bank accounts"
  ON professional_bank_accounts FOR SELECT
  USING (professional_id = auth.uid());

-- Professionals can insert their own bank accounts
CREATE POLICY "Professionals can insert own bank accounts"
  ON professional_bank_accounts FOR INSERT
  WITH CHECK (professional_id = auth.uid());

-- Professionals can update their own bank accounts
CREATE POLICY "Professionals can update own bank accounts"
  ON professional_bank_accounts FOR UPDATE
  USING (professional_id = auth.uid());

-- Professionals can delete their own bank accounts
CREATE POLICY "Professionals can delete own bank accounts"
  ON professional_bank_accounts FOR DELETE
  USING (professional_id = auth.uid());

-- Admins can view all bank accounts
CREATE POLICY "Admins can view all bank accounts"
  ON professional_bank_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update bank account verification status
CREATE POLICY "Admins can update bank account verification"
  ON professional_bank_accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to ensure only one primary account
CREATE OR REPLACE FUNCTION ensure_single_primary_bank_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE professional_bank_accounts
    SET is_primary = false
    WHERE professional_id = NEW.professional_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_single_primary_bank_account_trigger ON professional_bank_accounts;

-- Trigger to ensure single primary account
CREATE TRIGGER ensure_single_primary_bank_account_trigger
  BEFORE INSERT OR UPDATE ON professional_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_bank_account();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_professional_bank_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_professional_bank_accounts_updated_at_trigger ON professional_bank_accounts;

-- Trigger to update updated_at
CREATE TRIGGER update_professional_bank_accounts_updated_at_trigger
  BEFORE UPDATE ON professional_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_bank_accounts_updated_at();
