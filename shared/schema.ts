import { pgTable, text, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Simple cache table for market data
export const marketSnapshots = pgTable("market_snapshots", {
  id: serial("id").primaryKey(),
  data: text("data").notNull(),
  fetchedAt: text("fetched_at").notNull(),
});

export const insertMarketSnapshotSchema = createInsertSchema(marketSnapshots).omit({ id: true });
export type InsertMarketSnapshot = z.infer<typeof insertMarketSnapshotSchema>;
export type MarketSnapshot = typeof marketSnapshots.$inferSelect;
