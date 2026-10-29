import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import type { Product } from "@/lib/catalog/types"

// Better Auth tables — camelCase columns are Better Auth's defaults.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// The whole product record lives in `data`; slug/category/archived are copied out for querying.
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  data: jsonb("data").$type<Product>().notNull(),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  market: text("market").notNull(),
  lang: text("lang").notNull(),
  userId: text("user_id"),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("pending"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull(),
  shippingName: text("shipping_name"),
  shippingAddress1: text("shipping_address1"),
  shippingCity: text("shipping_city"),
  shippingRegion: text("shipping_region"),
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountry: text("shipping_country"),
  trackingNumber: text("tracking_number").unique(),
  trackingUrl: text("tracking_url"),
  carrier: text("carrier"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  brandName: text("brand_name"),
  image: text("image"),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
})

export const shipmentEvents = pgTable("shipment_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  status: text("status").notNull(),
  location: text("location"),
  comment: text("comment"),
  carrier: text("carrier"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// A user's garage: vehicles or bare tire sizes they've looked up, kept across
// visits so the fitment bar in the header can offer them again.
export const savedVehicles = pgTable("saved_vehicles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  market: text("market").notNull(),
  kind: text("kind").notNull(), // "vehicle" | "size"
  label: text("label").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  vehicleId: text("vehicle_id"),
  width: integer("width").notNull(),
  aspect: integer("aspect").notNull(),
  rim: integer("rim").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  market: text("market").notNull(),
  lang: text("lang").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  orderNumber: text("order_number"),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const chatConversations = pgTable("chat_conversations", {
  id: text("id").primaryKey(),
  visitorId: text("visitor_id").notNull().unique(),
  market: text("market").notNull(),
  lang: text("lang").notNull(),
  name: text("name"),
  email: text("email"),
  unreadByAdmin: boolean("unread_by_admin").notNull().default(false),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type OrderRow = typeof orders.$inferSelect
export type OrderItemRow = typeof orderItems.$inferSelect
export type SavedVehicleRow = typeof savedVehicles.$inferSelect
export type ShipmentEventRow = typeof shipmentEvents.$inferSelect
export type ContactMessageRow = typeof contactMessages.$inferSelect
export type ChatConversationRow = typeof chatConversations.$inferSelect
export type ChatMessageRow = typeof chatMessages.$inferSelect
