import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("client"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  status: jsonb("status").$type<{
    hvac: boolean;
    lighting: boolean;
    security: boolean;
  }>().notNull().default({
    hvac: true,
    lighting: true,
    security: true
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const buildingAccess = pgTable("building_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  buildingId: integer("building_id").references(() => buildings.id).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Building = typeof buildings.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
