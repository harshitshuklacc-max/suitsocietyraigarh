-- Full category list from Suit Society spreadsheet dropdown
-- Run in Supabase SQL Editor

INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
  ('Readymade 3-pc Suits', 'readymade-3-pc-suits', 'Ready-to-wear three piece suit sets', 1, true),
  ('Korean Shirts/ Midis', 'korean-shirts-midis', 'Korean style shirts and midi dresses', 2, true),
  ('Wedding/Festive collection', 'wedding-festive-collection', 'Wedding and festive occasion wear', 3, true),
  ('Co-Ord Sets', 'co-ord-sets', 'Coordinated ethnic and casual wear sets', 4, true),
  ('Winter Wear', 'winter-wear', 'Warm winter clothing collection', 5, true),
  ('Night Suits', 'night-suits', 'Comfortable night suits and sleepwear', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO fabrics (name, slug, description, is_active) VALUES
  ('Cotton', 'cotton', 'Breathable cotton fabric', true),
  ('Imported Fabric', 'imported-fabric', 'Premium imported fabric', true),
  ('Silk', 'silk', 'Silk and silk-blend fabric', true),
  ('Mul Cotton', 'mul-cotton', 'Soft mul cotton fabric', true),
  ('Dola Silk', 'dola-silk', 'Dola silk fabric', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = true;
