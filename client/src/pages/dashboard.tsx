import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Account {
  id: string;
  currency: string;
  balance: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currencyFrom: string;
  currencyTo: string;
  createdAt: string;
  receiverId?: string;
}

interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: string;
  updatedAt: string;
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  SAR: "ر.س",
  YER: "﷼",
};

const currencyColors: Record<string, string> = {
  USD: "bg-green-100 text-green-600",
  SAR: "bg-blue-100 text-blue-600", 
  YER: "bg-purple-100 text-purple-600",
};

interface User {
  id: string;
  username: string;
  name: string;
}

export default function DashboardPage() {
  const { user } = useAuth() as { user: User | undefined };

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: recentTransactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions?limit=5", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.json();
    },
  });

  const { data: exchangeRates = [], isLoading: ratesLoading } = useQuery<ExchangeRate[]>({
    queryKey: ["/api/exchange-rates"],
  });

  const formatBalance = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return `${currencySymbols[currency]}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'exchange':
        return 'fas fa-exchange-alt text-blue-600';
      case 'transfer':
        return 'fas fa-paper-plane text-red-600';
      case 'received':
        return 'fas fa-arrow-down text-green-600';
      default:
        return 'fas fa-circle text-gray-600';
    }
  };

  const getMainRates = () => {
    const pairs = ['USD-SAR', 'USD-YER', 'SAR-YER'];
    return pairs.map(pair => {
      const [base, target] = pair.split('-');
      const rate = exchangeRates.find((r: ExchangeRate) => 
        r.baseCurrency === base && r.targetCurrency === target
      );
      return { pair: `${base}/${target}`, rate: rate?.rate || '0', base, target };
    });
  };

  if (accountsLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-[#000000]">Here's your account overview for today</p>
      </div>
      {/* Currency Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {accounts.map((account: Account) => (
          <Card key={account.id} className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${currencyColors[account.currency]} rounded-xl flex items-center justify-center`}>
                    <span className="font-bold text-lg">{currencySymbols[account.currency]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {account.currency === 'USD' ? 'US Dollar' : 
                       account.currency === 'SAR' ? 'Saudi Riyal' : 'Yemeni Rial'}
                    </h3>
                    <p className="text-sm text-secondary">{account.currency}</p>
                  </div>
                </div>
                <i className={`fas ${
                  account.currency === 'USD' ? 'fa-dollar-sign text-green-600' :
                  account.currency === 'SAR' ? 'fa-coins text-blue-600' :
                  'fa-money-bill-wave text-purple-600'
                }`}></i>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {formatBalance(account.balance, account.currency)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Quick Actions and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Link href="/exchange">
                <div className="w-full flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <i className="fas fa-exchange-alt text-white"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Exchange Currency</p>
                      <p className="text-sm text-secondary">Convert between currencies</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </Link>
              
              <Link href="/transfer">
                <div className="w-full flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-xl hover:bg-success/10 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                      <i className="fas fa-paper-plane text-white"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Transfer Funds</p>
                      <p className="text-sm text-[#080800]">Send money to other clients</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
              <Link href="/history" className="text-primary hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-history text-gray-400 text-3xl mb-4"></i>
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction: Transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className={getTransactionIcon(transaction.type)}></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.type === 'exchange' ? 
                            `${transaction.currencyFrom} → ${transaction.currencyTo} Exchange` :
                            transaction.type === 'transfer' ? 'Transfer Sent' : 'Transfer Received'
                          }
                        </p>
                        <p className="text-sm text-secondary">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.type === 'received' ? 'text-success' : 'text-error'}`}>
                        {transaction.type === 'received' ? '+' : '-'}{formatBalance(transaction.amount, transaction.currencyFrom)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Exchange Rates Widget */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Live Exchange Rates</h3>
            <div className="flex items-center space-x-2 text-sm text-secondary">
              <i className="fas fa-clock"></i>
              <span>Updated recently</span>
            </div>
          </div>
          
          {ratesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getMainRates().map(({ pair, rate }) => (
                <div key={pair} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{pair}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {parseFloat(rate).toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
