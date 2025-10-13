// Reference: javascript_database blueprint integration
import { sql } from "drizzle-orm";
import { pgTable, varchar, doublePrecision, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coordinates table - stores all admin-added coordinates
export const coordinates = pgTable("coordinates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Active coordinates configuration - stores current admin settings
export const activeConfig = pgTable("active_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  k: integer("k").notNull(), // number of random coordinates to display
  radius: doublePrecision("radius").notNull(), // radius in meters
  timeInterval: integer("time_interval").notNull(), // interval in seconds
  activeCoordinateIds: varchar("active_coordinate_ids").array().notNull().default(sql`ARRAY[]::varchar[]`),
  lastRotated: timestamp("last_rotated").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertCoordinateSchema = createInsertSchema(coordinates).omit({
  id: true,
  createdAt: true,
});

export const insertActiveConfigSchema = createInsertSchema(activeConfig).omit({
  id: true,
  lastRotated: true,
});

export const updateActiveConfigSchema = insertActiveConfigSchema.partial();

// TypeScript types
export type Coordinate = typeof coordinates.$inferSelect;
export type InsertCoordinate = z.infer<typeof insertCoordinateSchema>;
export type ActiveConfig = typeof activeConfig.$inferSelect;
export type InsertActiveConfig = z.infer<typeof insertActiveConfigSchema>;
export type UpdateActiveConfig = z.infer<typeof updateActiveConfigSchema>;

// WebSocket message types
export type WSMessage = 
  | { type: 'location_update', data: { latitude: number, longitude: number, mode: 'admin' | 'user' } }
  | { type: 'config_update', data: ActiveConfig }
  | { type: 'coordinates_update', data: Coordinate[] }
  | { type: 'active_coordinates_update', data: Coordinate[] };
