-- ============================================
-- OTP Storage Table for MSG91 Integration
-- ============================================
-- This table stores OTPs temporarily for phone-based authentication

CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Index for quick lookups
  CONSTRAINT unique_active_otp UNIQUE NULLS NOT DISTINCT (phone, verified)
);

-- Index for faster lookups by phone and expiration
CREATE INDEX IF NOT EXISTS idx_otp_phone_expires ON otp_verifications(phone, expires_at) WHERE verified = false;

-- Index for cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);

-- Function to clean up expired OTPs (older than 10 minutes)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications
  WHERE expires_at < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (only server-side access, no client access)
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Deny all client access - this table should only be accessed server-side
CREATE POLICY "Deny all client access to otp_verifications"
  ON otp_verifications
  FOR ALL
  USING (false);

COMMENT ON TABLE otp_verifications IS 'Stores temporary OTPs for phone-based authentication via MSG91';
COMMENT ON COLUMN otp_verifications.phone IS 'Phone number (10 digits, without country code)';
COMMENT ON COLUMN otp_verifications.otp IS '6-digit OTP code';
COMMENT ON COLUMN otp_verifications.expires_at IS 'OTP expiration timestamp (5 minutes from creation)';
COMMENT ON COLUMN otp_verifications.verified IS 'Whether this OTP has been successfully verified';
COMMENT ON COLUMN otp_verifications.attempts IS 'Number of verification attempts made';
