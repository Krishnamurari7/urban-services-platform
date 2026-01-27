-- ============================================
-- Allow Customers to Insert Payments for Own Bookings
-- ============================================
-- This migration adds an RLS policy to allow customers to insert payment records
-- for their own bookings. This is necessary for the payment verification flow.

-- Allow customers to insert payments for their own bookings
CREATE POLICY "Customers can insert payments for own bookings"
  ON payments FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() 
    AND is_customer(auth.uid())
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id
      AND customer_id = auth.uid()
    )
  );

-- Allow customers to update their own payment records
CREATE POLICY "Customers can update own payments"
  ON payments FOR UPDATE
  USING (
    customer_id = auth.uid() 
    AND is_customer(auth.uid())
  )
  WITH CHECK (
    customer_id = auth.uid() 
    AND is_customer(auth.uid())
  );
