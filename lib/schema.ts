/**
 * Manna Restaurant — database schema.
 *
 * Every statement is written to be idempotent and additive:
 *  - CREATE TABLE IF NOT EXISTS
 *  - ALTER TABLE ... ADD COLUMN IF NOT EXISTS
 *  - CREATE INDEX IF NOT EXISTS
 *
 * Nothing here drops, truncates or rewrites existing data. The original
 * `reservations` table created by the first version of this site is preserved
 * and extended in place.
 */

export const SCHEMA_STATEMENTS: string[] = [
  // ---------------------------------------------------------------- identity
  `CREATE TABLE IF NOT EXISTS users (
     id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email          TEXT NOT NULL,
     email_lower    TEXT GENERATED ALWAYS AS (lower(email)) STORED,
     name           TEXT NOT NULL DEFAULT '',
     phone          TEXT,
     image_url      TEXT,
     password_hash  TEXT,
     role           TEXT NOT NULL DEFAULT 'CUSTOMER',
     email_verified BOOLEAN NOT NULL DEFAULT FALSE,
     is_active      BOOLEAN NOT NULL DEFAULT TRUE,
     birthday       DATE,
     anniversary    DATE,
     last_login_at  TIMESTAMPTZ,
     created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  // Existing Manna deployments may already have `users` without this column.
  // Add it before creating the case-insensitive uniqueness index.
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_lower TEXT GENERATED ALWAYS AS (lower(email)) STORED`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'CUSTOMER'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday DATE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS anniversary DATE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uidx ON users (email_lower)`,
  `CREATE INDEX IF NOT EXISTS users_role_idx ON users (role)`,

  `CREATE TABLE IF NOT EXISTS oauth_accounts (
     id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     provider            TEXT NOT NULL,
     provider_account_id TEXT NOT NULL,
     created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE oauth_accounts ADD COLUMN IF NOT EXISTS user_id UUID`,
  `ALTER TABLE oauth_accounts ADD COLUMN IF NOT EXISTS provider TEXT`,
  `ALTER TABLE oauth_accounts ADD COLUMN IF NOT EXISTS provider_account_id TEXT`,
  `ALTER TABLE oauth_accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `CREATE UNIQUE INDEX IF NOT EXISTS oauth_accounts_provider_uidx
     ON oauth_accounts (provider, provider_account_id)`,

  `CREATE TABLE IF NOT EXISTS sessions (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     token_hash  TEXT NOT NULL,
     user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     user_agent  TEXT,
     ip          TEXT,
     expires_at  TIMESTAMPTZ NOT NULL,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  // Legacy Manna installs used bigint user IDs and plaintext `token` values.
  // Preserve those columns/data under explicit legacy names before adding the
  // UUID/hash columns used by the current authentication implementation.
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'sessions'
          AND column_name = 'user_id'
          AND data_type <> 'uuid'
     ) AND NOT EXISTS (
       SELECT 1
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'sessions'
          AND column_name = 'legacy_user_id'
     ) THEN
       ALTER TABLE sessions RENAME COLUMN user_id TO legacy_user_id;
     END IF;
   END $$`,
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'token'
     ) AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'legacy_token'
     ) THEN
       ALTER TABLE sessions RENAME COLUMN token TO legacy_token;
     END IF;
   END $$`,
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'legacy_token'
     ) THEN
       ALTER TABLE sessions ALTER COLUMN legacy_token SET DEFAULT gen_random_uuid()::text;
     END IF;
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'legacy_user_id'
     ) THEN
       ALTER TABLE sessions ALTER COLUMN legacy_user_id DROP NOT NULL;
     END IF;
   END $$`,
  `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS token_hash TEXT`,
  `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id UUID`,
  `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent TEXT`,
  `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip TEXT`,
  `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ`,
  `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_uidx ON sessions (token_hash)`,
  `CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id)`,

  // One-time codes: email verification OTP + password reset tokens.
  `CREATE TABLE IF NOT EXISTS verification_codes (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
     email       TEXT NOT NULL,
     purpose     TEXT NOT NULL,
     code_hash   TEXT NOT NULL,
     attempts    INTEGER NOT NULL DEFAULT 0,
     expires_at  TIMESTAMPTZ NOT NULL,
     consumed_at TIMESTAMPTZ,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMPTZ`,
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS user_id UUID`,
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS email TEXT`,
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS purpose TEXT`,
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS code_hash TEXT`,
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ`,
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  // Legacy installs used a plaintext `code` column. OTPs now store only hashes;
  // make the legacy column optional so new verification rows remain secure.
  `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS code TEXT`,
  `ALTER TABLE verification_codes ALTER COLUMN code DROP NOT NULL`,
  `CREATE INDEX IF NOT EXISTS verification_codes_lookup_idx
     ON verification_codes (lower(email), purpose, consumed_at)`,

  // Generic sliding-window rate limiter (OTP sends, login attempts, etc).
  `CREATE TABLE IF NOT EXISTS rate_limits (
     bucket     TEXT NOT NULL,
     event_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS rate_limits_bucket_idx ON rate_limits (bucket, event_at)`,

  // ------------------------------------------------------------------- menu
  `CREATE TABLE IF NOT EXISTS menu_categories (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     slug        TEXT NOT NULL UNIQUE,
     label       TEXT NOT NULL,
     description TEXT,
     image_url   TEXT,
     position    INTEGER NOT NULL DEFAULT 0,
     is_active   BOOLEAN NOT NULL DEFAULT TRUE,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  `ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS slug TEXT`,
  `ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS label TEXT`,
  `ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS description TEXT`,
  `ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS image_url TEXT`,
  `ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`,
  `CREATE UNIQUE INDEX IF NOT EXISTS menu_categories_slug_uidx ON menu_categories (slug)`,

  `CREATE TABLE IF NOT EXISTS menu_items (
     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     category_id  UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
     slug         TEXT NOT NULL UNIQUE,
     name         TEXT NOT NULL,
     description  TEXT,
     price        NUMERIC(10,2) NOT NULL DEFAULT 0,
     image_url    TEXT,
     tag          TEXT,
     is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
     is_available BOOLEAN NOT NULL DEFAULT TRUE,
     is_active    BOOLEAN NOT NULL DEFAULT TRUE,
     position     INTEGER NOT NULL DEFAULT 0,
     available_from DATE,
     available_to   DATE,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS slug TEXT`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tag TEXT`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ`,
  `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS available_to TIMESTAMPTZ`,
  `CREATE UNIQUE INDEX IF NOT EXISTS menu_items_slug_uidx ON menu_items (slug)`,
  `CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items (category_id, position)`,

  // -------------------------------------------------------------- addresses
  `CREATE TABLE IF NOT EXISTS addresses (
     id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     label          TEXT NOT NULL DEFAULT 'Home',
     recipient_name TEXT,
     phone          TEXT,
     line1          TEXT NOT NULL,
     line2          TEXT,
     city           TEXT,
     landmark       TEXT,
     notes          TEXT,
     is_default     BOOLEAN NOT NULL DEFAULT FALSE,
     created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS addresses_user_idx ON addresses (user_id)`,

  // ----------------------------------------------------------------- orders
  `CREATE TABLE IF NOT EXISTS orders (
     id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     reference        TEXT NOT NULL UNIQUE,
     user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
     customer_name    TEXT NOT NULL,
     customer_phone   TEXT NOT NULL,
     customer_email   TEXT,
     order_type       TEXT NOT NULL DEFAULT 'PICKUP',
     address_snapshot JSONB,
     subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0,
     discount         NUMERIC(10,2) NOT NULL DEFAULT 0,
     delivery_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
     tax              NUMERIC(10,2) NOT NULL DEFAULT 0,
     total            NUMERIC(10,2) NOT NULL DEFAULT 0,
     coupon_code      TEXT,
     points_redeemed  INTEGER NOT NULL DEFAULT 0,
     points_earned    INTEGER NOT NULL DEFAULT 0,
     payment_status   TEXT NOT NULL DEFAULT 'UNPAID',
     payment_provider TEXT,
     payment_ref      TEXT,
     status           TEXT NOT NULL DEFAULT 'PENDING',
     special_requests TEXT,
     cancel_reason    TEXT,
     created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS order_items (
     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
     menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
     name         TEXT NOT NULL,
     unit_price   NUMERIC(10,2) NOT NULL,
     quantity     INTEGER NOT NULL,
     line_total   NUMERIC(10,2) NOT NULL,
     notes        TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id)`,

  `CREATE TABLE IF NOT EXISTS order_status_events (
     id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
     status     TEXT NOT NULL,
     note       TEXT,
     actor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS order_status_events_order_idx ON order_status_events (order_id, created_at)`,

  // -------------------------------------------------------------- favorites
  `CREATE TABLE IF NOT EXISTS favorites (
     user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     PRIMARY KEY (user_id, menu_item_id)
   )`,

  // ----------------------------------------------------- tables/reservations
  `CREATE TABLE IF NOT EXISTS restaurant_tables (
     id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name       TEXT NOT NULL UNIQUE,
     capacity   INTEGER NOT NULL DEFAULT 4,
     section    TEXT NOT NULL DEFAULT 'Main Hall',
     is_active  BOOLEAN NOT NULL DEFAULT TRUE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  // The original reservations table (SERIAL id) is kept and extended.
  `CREATE TABLE IF NOT EXISTS reservations (
     id            SERIAL PRIMARY KEY,
     name          TEXT        NOT NULL,
     phone         TEXT        NOT NULL,
     email         TEXT,
     reserved_date DATE        NOT NULL,
     reserved_time TEXT        NOT NULL,
     guests        INTEGER     NOT NULL,
     occasion      TEXT,
     requests      TEXT,
     status        TEXT        NOT NULL DEFAULT 'pending',
     created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL`,
  `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL`,
  `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reference TEXT`,
  `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 90`,
  `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL`,
  `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `CREATE INDEX IF NOT EXISTS reservations_date_idx ON reservations (reserved_date)`,
  `CREATE INDEX IF NOT EXISTS reservations_user_idx ON reservations (user_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS reservations_reference_uidx ON reservations (reference) WHERE reference IS NOT NULL`,
  // Hard guarantee against double-booking the same table at the same slot.
  `CREATE UNIQUE INDEX IF NOT EXISTS reservations_table_slot_uidx
     ON reservations (table_id, reserved_date, reserved_time)
     WHERE table_id IS NOT NULL AND status <> 'cancelled'`,

  // ---------------------------------------------------------------- loyalty
  `CREATE TABLE IF NOT EXISTS loyalty_accounts (
     user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     points_balance INTEGER NOT NULL DEFAULT 0,
     lifetime_points INTEGER NOT NULL DEFAULT 0,
     updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS loyalty_transactions (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     points      INTEGER NOT NULL,
     type        TEXT NOT NULL,
     description TEXT,
     order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS loyalty_tx_user_idx ON loyalty_transactions (user_id, created_at DESC)`,
  `ALTER TABLE loyalty_transactions ADD COLUMN IF NOT EXISTS order_id UUID`,
  `ALTER TABLE loyalty_transactions ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'ADJUSTMENT'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS loyalty_tx_order_earn_uidx
     ON loyalty_transactions (order_id, type) WHERE order_id IS NOT NULL`,

  `CREATE TABLE IF NOT EXISTS rewards (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name        TEXT NOT NULL,
     description TEXT,
     points_cost INTEGER NOT NULL,
     is_active   BOOLEAN NOT NULL DEFAULT TRUE,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS reward_redemptions (
     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     reward_id    UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
     points_spent INTEGER NOT NULL,
     code         TEXT NOT NULL UNIQUE,
     status       TEXT NOT NULL DEFAULT 'ISSUED',
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  // ---------------------------------------------------------------- coupons
  `CREATE TABLE IF NOT EXISTS coupons (
     id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     code           TEXT NOT NULL,
     code_lower     TEXT GENERATED ALWAYS AS (lower(code)) STORED,
     description    TEXT,
     discount_type  TEXT NOT NULL DEFAULT 'PERCENT',
     discount_value NUMERIC(10,2) NOT NULL,
     min_order      NUMERIC(10,2) NOT NULL DEFAULT 0,
     max_discount   NUMERIC(10,2),
     starts_at      TIMESTAMPTZ,
     ends_at        TIMESTAMPTZ,
     usage_limit    INTEGER,
     per_user_limit INTEGER NOT NULL DEFAULT 1,
     used_count     INTEGER NOT NULL DEFAULT 0,
     user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
     is_active      BOOLEAN NOT NULL DEFAULT TRUE,
     created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_uidx ON coupons (code_lower)`,

  `CREATE TABLE IF NOT EXISTS coupon_redemptions (
     id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     coupon_id  UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
     user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
     order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
     amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS coupon_redemptions_idx ON coupon_redemptions (coupon_id, user_id)`,

  // ---------------------------------------------------------------- reviews
  `CREATE TABLE IF NOT EXISTS reviews (
     id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     order_id   UUID REFERENCES orders(id) ON DELETE SET NULL,
     rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
     title      TEXT,
     body       TEXT NOT NULL,
     photo_url  TEXT,
     status     TEXT NOT NULL DEFAULT 'PENDING',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id UUID`,
  `CREATE UNIQUE INDEX IF NOT EXISTS reviews_order_uidx ON reviews (order_id) WHERE order_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews (status, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS review_responses (
     id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
     author_id  UUID REFERENCES users(id) ON DELETE SET NULL,
     body       TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  // ---------------------------------------------------------- notifications
  `CREATE TABLE IF NOT EXISTS notification_preferences (
     user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     email      BOOLEAN NOT NULL DEFAULT TRUE,
     sms        BOOLEAN NOT NULL DEFAULT FALSE,
     whatsapp   BOOLEAN NOT NULL DEFAULT FALSE,
     marketing  BOOLEAN NOT NULL DEFAULT FALSE,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS notifications (
     id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
     channel    TEXT NOT NULL,
     type       TEXT NOT NULL,
     recipient  TEXT,
     subject    TEXT,
     status     TEXT NOT NULL DEFAULT 'QUEUED',
     error      TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     sent_at    TIMESTAMPTZ
   )`,
  `CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications (created_at DESC)`,

  // -------------------------------------------------------------- referrals
  `CREATE TABLE IF NOT EXISTS referral_codes (
     user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     code       TEXT NOT NULL UNIQUE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS referrals (
     id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     referred_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
     status           TEXT NOT NULL DEFAULT 'PENDING',
     reward_points    INTEGER NOT NULL DEFAULT 0,
     completed_at     TIMESTAMPTZ,
     created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
     CHECK (referrer_user_id <> referred_user_id)
   )`,

  // -------------------------------------------------------- payment methods
  // Provider tokens only. Raw card data is never stored.
  `CREATE TABLE IF NOT EXISTS payment_methods (
     id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     provider             TEXT NOT NULL,
     provider_customer_id TEXT,
     provider_method_id   TEXT NOT NULL,
     brand                TEXT,
     last4                TEXT,
     exp_month            INTEGER,
     exp_year             INTEGER,
     is_default           BOOLEAN NOT NULL DEFAULT FALSE,
     created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  // -------------------------------------------------------------------- CMS
  `CREATE TABLE IF NOT EXISTS site_content (
     key        TEXT PRIMARY KEY,
     value      JSONB NOT NULL,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_by UUID REFERENCES users(id) ON DELETE SET NULL
   )`,

  `CREATE TABLE IF NOT EXISTS gallery_images (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     url         TEXT NOT NULL,
     caption     TEXT,
     category    TEXT NOT NULL DEFAULT 'restaurant',
     is_featured BOOLEAN NOT NULL DEFAULT FALSE,
     is_active   BOOLEAN NOT NULL DEFAULT TRUE,
     position    INTEGER NOT NULL DEFAULT 0,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS gallery_images_url_uidx ON gallery_images (url)`,

  // -------------------------------------------------------------- marketing
  `CREATE TABLE IF NOT EXISTS campaigns (
     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name         TEXT NOT NULL,
     subject      TEXT NOT NULL,
     body         TEXT NOT NULL,
     audience     TEXT NOT NULL DEFAULT 'ALL',
     status       TEXT NOT NULL DEFAULT 'DRAFT',
     recipients   INTEGER NOT NULL DEFAULT 0,
     sent_count   INTEGER NOT NULL DEFAULT 0,
     created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     sent_at      TIMESTAMPTZ
   )`,
]
