-- ============================================================
-- Migration: create_orders
-- Creates the orders and order_items tables for Fiona.
--
-- Design principles:
--   * orders.user_id -> auth.users(id): every row is owned by
--     exactly one Supabase Auth user; RLS enforces this so users
--     can NEVER read or write each other's orders.
--   * order_items stores a price/name SNAPSHOT at purchase time,
--     NOT a foreign key to products. Product prices/names change;
--     order history must reflect what the user actually paid.
--   * Cascade deletes keep the DB clean if an order is purged.
-- ============================================================

-- ── orders ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT           NOT NULL DEFAULT 'Processing'
                CHECK (status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
  total       NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ── order_items ──────────────────────────────────────────────
-- Intentionally denormalized: name/image/price are snapshotted
-- so order history stays accurate even after product edits.
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT           NOT NULL,
  name        TEXT           NOT NULL,
  image       TEXT           NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity    INT            NOT NULL CHECK (quantity > 0)
);

-- ── Auto-update updated_at ────────────────────────────────────
-- Reuses the set_updated_at() function from the first migration.
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS orders_user_idx       ON orders(user_id);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

-- ── Row Level Security ────────────────────────────────────────
-- auth.uid() = user_id is enforced at the Postgres layer,
-- so users can NEVER access each other's orders even if
-- application code has a bug.

ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- orders: SELECT own rows only
CREATE POLICY "users_select_own_orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- orders: INSERT own rows only
CREATE POLICY "users_insert_own_orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- order_items: SELECT items belonging to own orders only
CREATE POLICY "users_select_own_order_items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- order_items: INSERT items into own orders only
CREATE POLICY "users_insert_own_order_items"
  ON order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );
