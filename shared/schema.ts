import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
}, (table) => [
  index("accounts_client_currency_idx").on(table.clientId, table.currency),
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'exchange', 'transfer', 'received'
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currencyFrom: varchar("currency_from", { length: 3 }),
  currencyTo: varchar("currency_to", { length: 3 }),
  receiverId: uuid("receiver_id").references(() => clients.id),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("transactions_client_date_idx").on(table.clientId, table.createdAt),
]);

export const exchangeRates = pgTable("exchange_rates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  baseCurrency: varchar("base_currency", { length: 3 }).notNull(),
  targetCurrency: varchar("target_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("exchange_rates_pair_idx").on(table.baseCurrency, table.targetCurrency),
]);

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  receivedTransactions: many(transactions, { relationName: "receivedTransactions" }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  client: one(clients, { fields: [accounts.clientId], references: [clients.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  client: one(clients, { fields: [transactions.clientId], references: [clients.id] }),
  receiver: one(clients, { 
    fields: [transactions.receiverId], 
    references: [clients.id],
    relationName: "receivedTransactions"
  }),
}));

// Schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const exchangeSchema = z.object({
  fromCurrency: z.enum(["USD", "SAR", "YER"]),
  toCurrency: z.enum(["USD", "SAR", "YER"]),
  amount: z.number().positive("Amount must be positive"),
});

export const transferSchema = z.object({
  recipientUsername: z.string().min(3, "Recipient username is required"),
  currency: z.enum(["USD", "SAR", "YER"]),
  amount: z.number().positive("Amount must be positive"),
  message: z.string().optional(),
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ExchangeRequest = z.infer<typeof exchangeSchema>;
export type TransferRequest = z.infer<typeof transferSchema>;
