-- Migration to add reference_number column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_orders_reference_number ON orders(reference_number);

COMMENT ON COLUMN orders.reference_number IS 'Unique 6-character reference code for E-transfer verification';
