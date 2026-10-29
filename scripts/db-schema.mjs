// Creates every table the app expects (mirrors lib/db/schema.ts). Safe to re-run.
// Usage: node --env-file-if-exists=/vercel/share/.env.project scripts/db-schema.mjs
import { Pool } from "pg"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}
const pool = new Pool({ connectionString: url.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full"), max: 1 })

const statements = [
  `CREATE TABLE IF NOT EXISTS "user" (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    "emailVerified" boolean NOT NULL DEFAULT false,
    image text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "session" (
    id text PRIMARY KEY,
    "expiresAt" timestamp NOT NULL,
    token text NOT NULL UNIQUE,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "account" (
    id text PRIMARY KEY,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp,
    "refreshTokenExpiresAt" timestamp,
    scope text,
    password text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "verification" (
    id text PRIMARY KEY,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id text PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    category text NOT NULL,
    data jsonb NOT NULL,
    archived boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id text PRIMARY KEY,
    order_number text NOT NULL UNIQUE,
    market text NOT NULL,
    lang text NOT NULL,
    user_id text,
    email text NOT NULL,
    phone text,
    status text NOT NULL DEFAULT 'pending',
    subtotal_cents integer NOT NULL,
    shipping_cents integer NOT NULL DEFAULT 0,
    total_cents integer NOT NULL,
    currency text NOT NULL,
    shipping_name text,
    shipping_address1 text,
    shipping_city text,
    shipping_region text,
    shipping_postal_code text,
    shipping_country text,
    tracking_number text UNIQUE,
    tracking_url text,
    carrier text,
    notes text,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id text PRIMARY KEY,
    order_id text NOT NULL,
    product_slug text NOT NULL,
    product_name text NOT NULL,
    brand_name text,
    image text,
    unit_price_cents integer NOT NULL,
    quantity integer NOT NULL,
    line_total_cents integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS shipment_events (
    id text PRIMARY KEY,
    order_id text NOT NULL,
    status text NOT NULL,
    location text,
    comment text,
    carrier text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id text PRIMARY KEY,
    market text NOT NULL,
    lang text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    order_number text,
    subject text,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'new',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS chat_conversations (
    id text PRIMARY KEY,
    visitor_id text NOT NULL UNIQUE,
    market text NOT NULL,
    lang text NOT NULL,
    name text,
    email text,
    unread_by_admin boolean NOT NULL DEFAULT false,
    last_message_at timestamp NOT NULL DEFAULT now(),
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id text PRIMARY KEY,
    conversation_id text NOT NULL,
    role text NOT NULL,
    body text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS saved_vehicles (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    market text NOT NULL,
    kind text NOT NULL,
    label text NOT NULL,
    make text,
    model text,
    year integer,
    vehicle_id text,
    width integer NOT NULL,
    aspect integer NOT NULL,
    rim integer NOT NULL,
    is_active boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS products_category_idx ON products (category)`,
  `CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (email)`,
  `CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id)`,
  `CREATE INDEX IF NOT EXISTS saved_vehicles_user_idx ON saved_vehicles (user_id, market)`,
]

for (const sql of statements) await pool.query(sql)
const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`)
console.log(tables.rows.map((r) => r.table_name).join(", "))
await pool.end()
