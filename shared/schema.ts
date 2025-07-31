
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core Tables
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
  index("transactions_receiver_idx").on(table.receiverId),
  index("transactions_type_idx").on(table.type),
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

// New tables for enhanced functionality
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'transaction', 'exchange_rate_alert', 'system'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: varchar("is_read", { length: 10 }).default("false").notNull(),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("notifications_client_idx").on(table.clientId),
  index("notifications_read_idx").on(table.isRead),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id),
  action: varchar("action", { length: 100 }).notNull(), // 'login', 'exchange', 'transfer', 'account_create'
  details: text("details"), // JSON string with action details
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("audit_logs_client_idx").on(table.clientId),
  index("audit_logs_action_idx").on(table.action),
  index("audit_logs_date_idx").on(table.createdAt),
]);

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  receivedTransactions: many(transactions, { relationName: "receivedTransactions" }),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
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

export const notificationsRelations = relations(notifications, ({ one }) => ({
  client: one(clients, { fields: [notifications.clientId], references: [clients.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  client: one(clients, { fields: [auditLogs.clientId], references: [clients.id] }),
}));

// Validation Schemas
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

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Input validation schemas
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

export const notificationSchema = z.object({
  type: z.string().min(1, "Notification type is required"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  metadata: z.string().optional(),
});

export const systemSettingSchema = z.object({
  key: z.string().min(1, "Setting key is required"),
  value: z.string().min(1, "Setting value is required"),
  description: z.string().optional(),
});

// Type exports
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

// Request/Response types
export type LoginRequest = z.infer<typeof loginSchema>;
export type ExchangeRequest = z.infer<typeof exchangeSchema>;
export type TransferRequest = z.infer<typeof transferSchema>;
export type NotificationRequest = z.infer<typeof notificationSchema>;
export type SystemSettingRequest = z.infer<typeof systemSettingSchema>;

// Utility types
export type Currency = "USD" | "SAR" | "YER";
export type TransactionType = "exchange" | "transfer" | "received";
export type NotificationType = "transaction" | "exchange_rate_alert" | "system";
export type AuditAction = "login" | "exchange" | "transfer" | "account_create" | "logout" | "password_change";
