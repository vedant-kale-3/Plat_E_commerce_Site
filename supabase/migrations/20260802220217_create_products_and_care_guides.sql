/*
# Create products and care_guides tables

## Overview
Adds two independent tables to back the e-commerce store:
1. `products` — the plant catalog shown across the shop, home, cart, and checkout pages.
2. `care_guides` — plant-type care guides shown in the infinite-scroll strip on the Care Guide page.

The two tables are independent. A product may exist without a care guide and vice versa. They share the `category` text column by convention only (e.g. a care guide with category 'Tropical' visually relates to products with category 'Tropical'), but there is no foreign-key constraint between them, so admins can manage either list freely.

## Tables

### products
- `id` uuid, primary key, auto-generated
- `name` text, not null — plant name
- `price` numeric(10,2), not null — price in rupees
- `image` text, not null — local path or any image URL
- `category` text, not null — free text, e.g. 'Tropical', 'Succulent'
- `light` text, not null, CHECK limited to 'Low Light', 'Bright Indirect', 'Full Sun'
- `size` text, not null, CHECK limited to 'Small', 'Medium', 'Large'
- `rating` numeric(2,1), default 0.0 — e.g. 4.8
- `review_count` integer, default 0 — e.g. 142
- `description` text, not null
- `tag` text, nullable — optional badge e.g. 'Best Seller'
- `is_active` boolean, default true — soft-delete / hide without losing data
- `sort_order` integer, default 0 — admin-controlled display order
- `created_at` timestamptz, default now()
- `updated_at` timestamptz, default now()

### care_guides
- `id` uuid, primary key, auto-generated
- `category` text, not null — plant type label, e.g. 'Tropical'
- `image` text, not null — representative photo for the category card
- `light` text, not null — care-specific light guidance (free text, richer than product light)
- `water` text, not null — watering frequency, e.g. 'Weekly'
- `difficulty` text, not null, CHECK limited to 'Easy', 'Moderate', 'Expert'
- `summary` text, not null — short care description shown on the scroll card
- `tips` text[], not null — array of care tip strings
- `is_active` boolean, default true — hide a guide without deleting it
- `sort_order` integer, default 0 — controls card order in the scroller
- `created_at` timestamptz, default now()
- `updated_at` timestamptz, default now()

## Security
- RLS enabled on both tables.
- Public read access (anon + authenticated) — the shop and care guide content are public.
- Write access (insert / update / delete) restricted to authenticated users only, so only a signed-in admin can add, edit, or remove products and care guides. The admin UI will be built later; the policies are in place now so the tables are ready for it.

## Seed data
- 10 products matching the current static product list exactly.
- 7 care guides matching the current static care guide list exactly.

## Notes
1. `updated_at` is auto-maintained by a trigger on both tables.
2. `tips` is a native Postgres text[] array — the frontend maps over it directly.
3. There is intentionally NO foreign key between products.category and care_guides.category. The tables are independent by design.
*/

-- ---------- products table ----------
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  image text NOT NULL,
  category text NOT NULL,
  light text NOT NULL CHECK (light IN ('Low Light', 'Bright Indirect', 'Full Sun')),
  size text NOT NULL CHECK (size IN ('Small', 'Medium', 'Large')),
  rating numeric(2,1) NOT NULL DEFAULT 0.0,
  review_count integer NOT NULL DEFAULT 0,
  description text NOT NULL,
  tag text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ---------- care_guides table ----------
CREATE TABLE IF NOT EXISTS care_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  image text NOT NULL,
  light text NOT NULL,
  water text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Expert')),
  summary text NOT NULL,
  tips text[] NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE care_guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_care_guides" ON care_guides;
CREATE POLICY "public_read_care_guides" ON care_guides FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_care_guides" ON care_guides;
CREATE POLICY "auth_insert_care_guides" ON care_guides FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_care_guides" ON care_guides;
CREATE POLICY "auth_update_care_guides" ON care_guides FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_care_guides" ON care_guides;
CREATE POLICY "auth_delete_care_guides" ON care_guides FOR DELETE
  TO authenticated USING (true);

-- ---------- updated_at trigger ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS care_guides_set_updated_at ON care_guides;
CREATE TRIGGER care_guides_set_updated_at
  BEFORE UPDATE ON care_guides
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- index for active filtering ----------
CREATE INDEX IF NOT EXISTS products_active_idx ON products (is_active);
CREATE INDEX IF NOT EXISTS care_guides_active_idx ON care_guides (is_active);

-- ---------- seed products ----------
INSERT INTO products (name, price, image, category, light, size, rating, review_count, description, tag, sort_order) VALUES
  ('Monstera Deliciosa', 49.99, '/1_da069a19-bb37-40a4-b196-7d0610a89582.jpg', 'Tropical', 'Bright Indirect', 'Large', 4.8, 142, 'The iconic split-leaf philodendron. A bold statement plant that thrives in bright indirect light and brings lush tropical vibes to any room.', 'Best Seller', 1),
  ('Swiss Cheese Vine', 24.99, '/A_image_12_75a15381-4701-4eca-a435-ce855c9437cb.jpg', 'Tropical', 'Bright Indirect', 'Small', 4.6, 89, 'A compact and charming Monstera adansonii. Perfect for shelves and tabletops with its delicate fenestrated leaves.', NULL, 2),
  ('Peperomia Hanging', 19.99, '/1_69c03517-6f5a-4f05-baa1-06df9db2c9d2.jpg', 'Hanging', 'Low Light', 'Small', 4.7, 63, 'A trailing peperomia that cascades beautifully from hanging baskets. Incredibly low-maintenance and drought-tolerant.', 'New Arrival', 3),
  ('Netted Ficus Tree', 89.99, '/netted-ficus-tree-32169816686724.jpg', 'Trees', 'Bright Indirect', 'Large', 4.9, 47, 'A stunning braided ficus bonsai with a sculptural latticed trunk. An artistic centerpiece that commands attention in any space.', 'Premium', 4),
  ('Golden Pothos', 15.99, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', 'Trailing', 'Low Light', 'Small', 4.9, 218, 'The ultimate beginner plant. Golden heart-shaped leaves on trailing vines that purify air and grow in almost any condition.', 'Best Seller', 5),
  ('Bird of Paradise', 74.99, '/A_image_10_06ce6eee-f675-41b8-b461-efb57f8c42a2.webp', 'Tropical', 'Bright Indirect', 'Large', 4.7, 95, 'Dramatic paddle-shaped leaves bring a resort-like atmosphere to living spaces. A floor plant that makes a grand statement.', NULL, 6),
  ('Aloe Vera', 18.99, 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80', 'Succulent', 'Bright Indirect', 'Small', 4.5, 176, 'The timeless healing succulent. Thrives on neglect, loves sunshine, and offers natural soothing gel for skin care.', NULL, 7),
  ('ZZ Plant', 32.99, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80', 'Foliage', 'Low Light', 'Medium', 4.8, 134, 'Glossy dark-green leaves on graceful arching stems. An architectural plant that tolerates low light and irregular watering.', NULL, 8),
  ('Peace Lily', 28.99, '/DSC_0263.jpg', 'Flowering', 'Low Light', 'Medium', 4.6, 108, 'Elegant white blooms emerge from deep green foliage. One of the best air-purifying plants and thrives in low light.', NULL, 9),
  ('Rubber Plant', 42.99, 'https://images.unsplash.com/photo-1598880940078-47f12e5a2e28?auto=format&fit=crop&w=600&q=80', 'Foliage', 'Bright Indirect', 'Medium', 4.7, 82, 'Bold burgundy and dark-green leaves on an upright stem. Adds a sculptural, modern feel to any interior space.', 'New Arrival', 10)
ON CONFLICT DO NOTHING;

-- ---------- seed care_guides ----------
INSERT INTO care_guides (category, image, light, water, difficulty, summary, tips, sort_order) VALUES
  ('Tropical', '/A_image_10_06ce6eee-f675-41b8-b461-efb57f8c42a2.webp', 'Bright Indirect', 'Weekly', 'Moderate', 'Jungle natives like Monstera, Bird of Paradise, and Swiss Cheese Vine love warmth and humidity.', ARRAY['Mimic the forest floor — bright but filtered light, never harsh direct sun.','Keep humidity above 50% for lush, unfurling leaves.','Let the top inch of soil dry between waterings to prevent root rot.','Wipe leaves monthly to keep pores clear and glossy.'], 1),
  ('Succulent', 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80', 'Bright Direct', 'Every 2–3 weeks', 'Easy', 'Aloe, Echeveria, and Haworthia store water in their leaves and thrive on a little neglect.', ARRAY['Give them the sunniest spot you have — a south-facing window is ideal.','Let the soil dry out completely before watering again.','Use a cactus/succulent mix with excellent drainage.','Water the soil, not the rosette — trapped water causes rot.'], 2),
  ('Trailing', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', 'Low to Bright Indirect', 'Weekly', 'Easy', 'Pothos and Philodendron trail beautifully and forgive the occasional missed watering.', ARRAY['Tolerates lower light, but growth is fuller and faster in bright indirect light.','Prune regularly to encourage bushy, branching vines.','Propagate cuttings in water for easy new plants.','Yellow leaves usually mean overwatering — let it dry out more.'], 3),
  ('Foliage', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80', 'Low to Bright Indirect', 'Every 10 days', 'Easy', 'Statement foliage plants like ZZ and Rubber Plant bring sculptural structure to any room.', ARRAY['Extremely forgiving of low light and irregular watering.','Dust the broad leaves regularly for a polished look.','Allow the soil to dry almost completely between waterings.','Fertilise monthly in spring and summer for strong new growth.'], 4),
  ('Flowering', '/DSC_0263.jpg', 'Low to Bright Indirect', 'Weekly', 'Moderate', 'Peace Lilies and Anthurium reward good care with elegant blooms and air-purifying foliage.', ARRAY['Keep soil lightly moist but never waterlogged.','Remove spent blooms to encourage new flowers.','Bright indirect light promotes blooming; deep shade keeps it leafy.','Slightly higher humidity helps flowers last longer.'], 5),
  ('Trees', '/netted-ficus-tree-32169816686724.jpg', 'Bright Indirect', 'Weekly', 'Expert', 'Ficus trees and braided specimens are striking floor plants that need consistent conditions.', ARRAY['Hates being moved — pick a spot and keep it there to avoid leaf drop.','Keep humidity moderate and away from cold draughts.','Water when the top 2 inches of soil are dry.','Prune in spring to control shape and encourage branching.'], 6),
  ('Hanging', '/1_69c03517-6f5a-4f05-baa1-06df9db2c9d2.jpg', 'Low Light', 'Every 7–10 days', 'Easy', 'Trailing peperomia and ferns cascade from baskets and shelves, softening any corner.', ARRAY['Check soil moisture by lifting the pot — light pots mean it is time to water.','Pinch back growing tips to keep the plant full and rounded.','Keep away from drying air vents that crisp the delicate foliage.','Rotate the hanger occasionally so all sides get light.'], 7)
ON CONFLICT DO NOTHING;
