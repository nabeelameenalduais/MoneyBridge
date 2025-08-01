import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, hashPassword, verifyPassword, generateToken, type AuthenticatedRequest } from "./services/auth";
import { fetchLatestRates, getExchangeRate, initializeDefaultRates } from "./services/exchangeRates";
import { loginSchema, exchangeSchema, transferSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize exchange rates
  await initializeDefaultRates();
  
  // Update rates every hour
  setInterval(fetchLatestRates, 60 * 60 * 1000);
  fetchLatestRates(); // Initial fetch

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const client = await storage.getClientByUsername(username);
      if (!client) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const isValidPassword = await verifyPassword(password, client.hashedPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = generateToken(client.id);
      
      res.json({
        token,
        client: {
          id: client.id,
          username: client.username,
          name: client.name,
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const client = await storage.getClientById(req.clientId!);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      res.json({
        id: client.id,
        username: client.username,
        name: client.name,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Account routes
  app.get('/api/accounts', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const accounts = await storage.getClientAccounts(req.clientId!);
      
      // Ensure all currency accounts exist
      const currencies = ['USD', 'SAR', 'YER'];
      const existingCurrencies = accounts.map(acc => acc.currency);
      
      for (const currency of currencies) {
        if (!existingCurrencies.includes(currency)) {
          await storage.createAccount({
            clientId: req.clientId!,
            currency,
            balance: '0.00',
          });
        }
      }

      const allAccounts = await storage.getClientAccounts(req.clientId!);
      res.json(allAccounts);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Exchange routes
  app.post('/api/exchange', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { fromCurrency, toCurrency, amount } = exchangeSchema.parse(req.body);

      if (fromCurrency === toCurrency) {
        return res.status(400).json({ message: 'Cannot exchange same currency' });
      }

      // Get source account
      const sourceAccount = await storage.getClientAccount(req.clientId!, fromCurrency);
      if (!sourceAccount) {
        return res.status(404).json({ message: 'Source account not found' });
      }

      const sourceBalance = parseFloat(sourceAccount.balance);
      if (sourceBalance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Get exchange rate
      const rate = await getExchangeRate(fromCurrency, toCurrency);
      const convertedAmount = amount * rate;

      // Get or create target account
      let targetAccount = await storage.getClientAccount(req.clientId!, toCurrency);
      if (!targetAccount) {
        targetAccount = await storage.createAccount({
          clientId: req.clientId!,
          currency: toCurrency,
          balance: '0.00',
        });
      }

      // Update balances
      const newSourceBalance = (sourceBalance - amount).toFixed(2);
      const newTargetBalance = (parseFloat(targetAccount.balance) + convertedAmount).toFixed(2);

      await storage.updateAccountBalance(sourceAccount.id, newSourceBalance);
      await storage.updateAccountBalance(targetAccount.id, newTargetBalance);

      // Record transaction
      await storage.createTransaction({
        clientId: req.clientId!,
        type: 'exchange',
        amount: amount.toString(),
        currencyFrom: fromCurrency,
        currencyTo: toCurrency,
        exchangeRate: rate.toString(),
      });

      res.json({
        success: true,
        exchangeRate: rate,
        convertedAmount,
        newBalances: {
          [fromCurrency]: newSourceBalance,
          [toCurrency]: newTargetBalance,
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Transfer routes
  app.post('/api/transfer', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { recipientUsername, currency, amount, message } = transferSchema.parse(req.body);

      // Find recipient
      const recipient = await storage.getClientByUsername(recipientUsername);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      if (recipient.id === req.clientId) {
        return res.status(400).json({ message: 'Cannot transfer to yourself' });
      }

      // Get sender account
      const senderAccount = await storage.getClientAccount(req.clientId!, currency);
      if (!senderAccount) {
        return res.status(404).json({ message: 'Sender account not found' });
      }

      const senderBalance = parseFloat(senderAccount.balance);
      if (senderBalance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Get or create recipient account
      let recipientAccount = await storage.getClientAccount(recipient.id, currency);
      if (!recipientAccount) {
        recipientAccount = await storage.createAccount({
          clientId: recipient.id,
          currency,
          balance: '0.00',
        });
      }

      // Update balances
      const newSenderBalance = (senderBalance - amount).toFixed(2);
      const newRecipientBalance = (parseFloat(recipientAccount.balance) + amount).toFixed(2);

      await storage.updateAccountBalance(senderAccount.id, newSenderBalance);
      await storage.updateAccountBalance(recipientAccount.id, newRecipientBalance);

      // Record transactions
      await storage.createTransaction({
        clientId: req.clientId!,
        type: 'transfer',
        amount: amount.toString(),
        currencyFrom: currency,
        currencyTo: currency,
        receiverId: recipient.id,
        message,
      });

      await storage.createTransaction({
        clientId: recipient.id,
        type: 'received',
        amount: amount.toString(),
        currencyFrom: currency,
        currencyTo: currency,
        receiverId: req.clientId!,
        message,
      });

      res.json({
        success: true,
        recipient: {
          username: recipient.username,
          name: recipient.name,
        },
        newBalance: newSenderBalance,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Verify recipient route
  app.get('/api/clients/verify/:username', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { username } = req.params;
      const client = await storage.getClientByUsername(username);
      
      if (!client || client.id === req.clientId) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      res.json({
        username: client.username,
        name: client.name,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Transaction history routes
  app.get('/api/transactions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { type, currency, dateFrom, dateTo, limit = '50', offset = '0' } = req.query;
      
      const filters: any = {
        type: type as string,
        currency: currency as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      if (dateFrom) {
        filters.dateFrom = new Date(dateFrom as string);
      }
      if (dateTo) {
        filters.dateTo = new Date(dateTo as string);
      }

      const transactions = await storage.getClientTransactions(req.clientId!, filters);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Analytics routes
  app.get('/api/analytics', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const transactions = await storage.getClientTransactions(req.clientId!);
      
      if (!transactions || transactions.length === 0) {
        return res.json({
          totalTransactions: 0,
          totalExchangeVolume: 0,
          totalTransferVolume: 0,
          averageTransactionValue: 0,
          mostActiveMonth: 'No data',
          currencyDistribution: [],
          monthlyActivity: [],
          exchangeRateEfficiency: [],
          recentTrends: { transactionTrend: 0, volumeTrend: 0 }
        });
      }

      // Calculate analytics
      const exchanges = transactions.filter(t => t.type === 'exchange');
      const transfers = transactions.filter(t => t.type === 'transfer');
      
      const totalExchangeVolume = exchanges.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      const totalTransferVolume = transfers.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      res.json({
        totalTransactions: transactions.length,
        totalExchangeVolume,
        totalTransferVolume,
        averageTransactionValue: (totalExchangeVolume + totalTransferVolume) / transactions.length || 0,
        mostActiveMonth: 'Current',
        currencyDistribution: [
          { currency: 'USD', count: exchanges.filter(t => t.currencyFrom === 'USD' || t.currencyTo === 'USD').length, volume: 0 },
          { currency: 'SAR', count: exchanges.filter(t => t.currencyFrom === 'SAR' || t.currencyTo === 'SAR').length, volume: 0 },
          { currency: 'YER', count: exchanges.filter(t => t.currencyFrom === 'YER' || t.currencyTo === 'YER').length, volume: 0 }
        ],
        monthlyActivity: [
          { month: 'Jan', exchanges: 0, transfers: 0, volume: 0 },
          { month: 'Feb', exchanges: 0, transfers: 0, volume: 0 },
          { month: 'Mar', exchanges: 0, transfers: 0, volume: 0 },
          { month: 'Apr', exchanges: 0, transfers: 0, volume: 0 },
          { month: 'May', exchanges: 0, transfers: 0, volume: 0 },
          { month: 'Jun', exchanges: exchanges.length, transfers: transfers.length, volume: totalExchangeVolume + totalTransferVolume }
        ],
        exchangeRateEfficiency: exchanges.map(t => ({
          pair: `${t.currencyFrom}/${t.currencyTo}`,
          avgRate: parseFloat(t.exchangeRate || '0'),
          count: 1
        })),
        recentTrends: { transactionTrend: transactions.length, volumeTrend: totalExchangeVolume + totalTransferVolume }
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Exchange rates routes
  app.get('/api/exchange-rates', async (req, res) => {
    try {
      const rates = await storage.getAllExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/exchange-rates/:from/:to', async (req, res) => {
    try {
      const { from, to } = req.params;
      const rate = await getExchangeRate(from.toUpperCase(), to.toUpperCase());
      res.json({ rate });
    } catch (error) {
      res.status(404).json({ message: 'Exchange rate not found' });
    }
  });

  // Public exchange rates (no authentication required)
  app.get('/api/exchange-rates/public', async (req, res) => {
    try {
      const rates = await storage.getAllExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get exchange rates' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
