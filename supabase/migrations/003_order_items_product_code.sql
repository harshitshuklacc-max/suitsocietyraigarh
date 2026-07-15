-- Add product code (barcode) snapshot to order items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_code TEXT;

-- One review per user per product
DO $$ BEGIN
  ALTER TABLE reviews ADD CONSTRAINT reviews_product_user_unique UNIQUE (product_id, user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
