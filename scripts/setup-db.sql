-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist in reverse order of dependencies
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS schedule_deliveries CASCADE;
DROP TABLE IF EXISTS schedule_products CASCADE;
DROP TABLE IF EXISTS production_schedules CASCADE;
DROP TABLE IF EXISTS delivery_options CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create custom types (ENUMs) if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'paid', 'completed', 'waitlist', 'cancelled');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  phone_number TEXT CHECK (phone_number ~ '^\+[0-9]+$'),
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name JSONB NOT NULL, -- Format: {"en": "Meatball", "zh": "肉丸"}
  description JSONB,  -- Format: {"en": "...", "zh": "..."}
  price DECIMAL(10, 2) NOT NULL,
  tag JSONB, -- Format: {"en": "Signature", "zh": "招牌"}
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delivery options table
CREATE TABLE delivery_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT,
  description TEXT,
  map_url TEXT,
  delivery_method TEXT, -- 'pickup' or 'delivery'
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production schedules table
CREATE TABLE production_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'completed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedule products table (Many-to-Many for Products)
CREATE TABLE schedule_products (
  schedule_id UUID REFERENCES production_schedules(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  PRIMARY KEY (schedule_id, product_id)
);

-- Create schedule deliveries table (Many-to-Many for Delivery Options + Time)
CREATE TABLE schedule_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES production_schedules(id) ON DELETE CASCADE,
  delivery_option_id UUID REFERENCES delivery_options(id) ON DELETE CASCADE,
  delivery_time TIMESTAMP WITH TIME ZONE NOT NULL,
  cutoff_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  notes TEXT,
  reference_number TEXT UNIQUE,
  schedule_delivery_id UUID REFERENCES schedule_deliveries(id),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone_number ON orders(phone_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_schedule_products_schedule_id ON schedule_products(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_deliveries_schedule_id ON schedule_deliveries(schedule_id);
CREATE INDEX IF NOT EXISTS idx_available_deliveries ON schedule_deliveries(delivery_time);

-- Add comments to tables
COMMENT ON TABLE users IS 'Stores authenticated user accounts with role-based access';
COMMENT ON TABLE orders IS 'Stores customer orders for meatballs';
COMMENT ON TABLE order_items IS 'Stores individual items within an order for better analytics';
COMMENT ON TABLE products IS 'Stores product information with multi-language support (JSONB)';
COMMENT ON TABLE delivery_options IS 'Defines available delivery/pickup locations';
COMMENT ON TABLE production_schedules IS 'Groups batch production and delivery times';
COMMENT ON TABLE schedule_products IS 'Maps products to a specific production schedule';
COMMENT ON TABLE schedule_deliveries IS 'Links schedules to specific delivery options and times';
