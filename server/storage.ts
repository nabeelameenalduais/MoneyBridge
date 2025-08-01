import {
  clients,
  accounts,
  transactions,
  exchangeRates,
  type Client,
  type InsertClient,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type ExchangeRate,
  type InsertExchangeRate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, or, asc } from "drizzle-orm";

export interface IStorage {
  // Client operations
  getClientById(id: string): Promise<Client | undefined>;
  getClientByUsername(username: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Account operations
  getClientAccounts(clientId: string): Promise<Account[]>;
  getClientAccount(clientId: string, currency: string): Promise<Account | undefined>;
  updateAccountBalance(accountId: string, newBalance: string): Promise<Account>;
  createAccount(account: InsertAccount): Promise<Account>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getClientTransactions(clientId: string, filters?: {
    type?: string;
    currency?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]>;
  
  // Exchange rate operations
  getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | undefined>;
  upsertExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate>;
  getAllExchangeRates(): Promise<ExchangeRate[]>;
}

export class DatabaseStorage implements IStorage {
  async getClientById(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByUsername(username: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.username, username));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async getClientAccounts(clientId: string): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.clientId, clientId));
  }

  async getClientAccount(clientId: string, currency: string): Promise<Account | undefined> {
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.clientId, clientId), eq(accounts.currency, currency)));
    return account;
  }

  async updateAccountBalance(accountId: string, newBalance: string): Promise<Account> {
    const [account] = await db
      .update(accounts)
      .set({ balance: newBalance })
      .where(eq(accounts.id, accountId))
      .returning();
    return account;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    return account;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getClientTransactions(clientId: string, filters?: {
    type?: string;
    currency?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    const conditions = [eq(transactions.clientId, clientId)];

    if (filters?.type && filters.type !== 'all') {
      conditions.push(eq(transactions.type, filters.type));
    }

    if (filters?.currency && filters.currency !== 'all') {
      conditions.push(
        or(
          eq(transactions.currencyFrom, filters.currency),
          eq(transactions.currencyTo, filters.currency)
        )!
      );
    }

    if (filters?.dateFrom) {
      conditions.push(gte(transactions.createdAt, filters.dateFrom));
    }

    if (filters?.dateTo) {
      conditions.push(lte(transactions.createdAt, filters.dateTo));
    }

    let query = db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query.execute();
  }

  async getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | undefined> {
    const [rate] = await db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.baseCurrency, baseCurrency),
          eq(exchangeRates.targetCurrency, targetCurrency)
        )
      );
    return rate;
  }

  async upsertExchangeRate(insertRate: InsertExchangeRate): Promise<ExchangeRate> {
    const [rate] = await db
      .insert(exchangeRates)
      .values(insertRate)
      .onConflictDoUpdate({
        target: [exchangeRates.baseCurrency, exchangeRates.targetCurrency],
        set: {
          rate: insertRate.rate,
          updatedAt: new Date(),
        },
      })
      .returning();
    return rate;
  }

  async getAllExchangeRates(): Promise<ExchangeRate[]> {
    return await db.select().from(exchangeRates).orderBy(asc(exchangeRates.baseCurrency));
  }
}

export const storage = new DatabaseStorage();
