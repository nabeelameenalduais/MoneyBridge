import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Target, Calendar } from "lucide-react";
import { formatDistanceToNow, format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

interface AnalyticsData {
  totalTransactions: number;
  totalExchangeVolume: number;
  totalTransferVolume: number;
  averageTransactionValue: number;
  mostActiveMonth: string;
  currencyDistribution: Array<{ currency: string; count: number; volume: number }>;
  monthlyActivity: Array<{ month: string; exchanges: number; transfers: number; volume: number }>;
  exchangeRateEfficiency: Array<{ pair: string; avgRate: number; count: number }>;
  recentTrends: {
    transactionTrend: number;
    volumeTrend: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api", "accounts"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api", "transactions"],
  });

  const isLoading = accountsLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate analytics data from transactions
  const calculateAnalytics = (): AnalyticsData => {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalExchangeVolume: 0,
        totalTransferVolume: 0,
        averageTransactionValue: 0,
        mostActiveMonth: 'No data',
        currencyDistribution: [],
        monthlyActivity: [],
        exchangeRateEfficiency: [],
        recentTrends: { transactionTrend: 0, volumeTrend: 0 }
      };
    }

    const exchanges = transactions.filter(t => t.type === 'exchange');
    const transfers = transactions.filter(t => t.type === 'transfer');
    
    const totalExchangeVolume = exchanges.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalTransferVolume = transfers.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Currency distribution
    const currencyMap = new Map();
    transactions.forEach(t => {
      const currency = t.currencyFrom || t.currencyTo;
      if (currency) {
        const existing = currencyMap.get(currency) || { count: 0, volume: 0 };
        currencyMap.set(currency, {
          count: existing.count + 1,
          volume: existing.volume + parseFloat(t.amount)
        });
      }
    });
    
    const currencyDistribution = Array.from(currencyMap.entries()).map(([currency, data]) => ({
      currency,
      count: data.count,
      volume: data.volume
    }));

    // Monthly activity for last 6 months
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      
      const monthTransactions = transactions.filter(t => 
        isWithinInterval(new Date(t.createdAt), { start: monthStart, end: monthEnd })
      );
      
      const monthExchanges = monthTransactions.filter(t => t.type === 'exchange').length;
      const monthTransfers = monthTransactions.filter(t => t.type === 'transfer').length;
      const monthVolume = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      monthlyActivity.push({
        month: format(monthStart, 'MMM'),
        exchanges: monthExchanges,
        transfers: monthTransfers,
        volume: monthVolume
      });
    }

    // Exchange rate efficiency
    const rateMap = new Map();
    exchanges.forEach(t => {
      if (t.exchangeRate && t.currencyFrom && t.currencyTo) {
        const pair = `${t.currencyFrom}/${t.currencyTo}`;
        const existing = rateMap.get(pair) || { rates: [], count: 0 };
        existing.rates.push(parseFloat(t.exchangeRate));
        existing.count += 1;
        rateMap.set(pair, existing);
      }
    });
    
    const exchangeRateEfficiency = Array.from(rateMap.entries()).map(([pair, data]) => ({
      pair,
      avgRate: data.rates.reduce((sum: number, rate: number) => sum + rate, 0) / data.rates.length,
      count: data.count
    }));

    return {
      totalTransactions: transactions.length,
      totalExchangeVolume,
      totalTransferVolume,
      averageTransactionValue: (totalExchangeVolume + totalTransferVolume) / transactions.length || 0,
      mostActiveMonth: monthlyActivity.reduce((max, current) => 
        (current.exchanges + current.transfers) > (max.exchanges + max.transfers) ? current : max
      )?.month || 'No data',
      currencyDistribution,
      monthlyActivity,
      exchangeRateEfficiency,
      recentTrends: {
        transactionTrend: monthlyActivity.length >= 2 ? 
          ((monthlyActivity[monthlyActivity.length - 1].exchanges + monthlyActivity[monthlyActivity.length - 1].transfers) - 
           (monthlyActivity[monthlyActivity.length - 2].exchanges + monthlyActivity[monthlyActivity.length - 2].transfers)) : 0,
        volumeTrend: monthlyActivity.length >= 2 ? 
          (monthlyActivity[monthlyActivity.length - 1].volume - monthlyActivity[monthlyActivity.length - 2].volume) : 0
      }
    };
  };

  const analyticsData = calculateAnalytics();

  const totalPortfolioValue = Array.isArray(accounts) ? accounts.reduce((sum: number, account: any) => {
    // Convert all to USD for total calculation (simplified)
    const multiplier = account.currency === 'USD' ? 1 : 
                     account.currency === 'SAR' ? 0.27 : 
                     account.currency === 'YER' ? 0.004 : 1;
    return sum + (parseFloat(account.balance) * multiplier);
  }, 0) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your exchange office activity
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all currencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalTransactions}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {analyticsData.recentTrends.transactionTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(analyticsData.recentTrends.transactionTrend)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exchange Volume</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalExchangeVolume.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total amount exchanged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.mostActiveMonth}</div>
            <p className="text-xs text-muted-foreground">
              Highest transaction count
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="currencies">Currency Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Balances</CardTitle>
                <CardDescription>Current balance distribution by currency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(accounts) && accounts.map((account: any, index: number) => (
                    <div key={account.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{account.currency}</Badge>
                        <span className="text-sm font-medium">
                          {account.currency === 'USD' ? '$' : 
                           account.currency === 'SAR' ? '﷼' : 
                           account.currency === 'YER' ? '﷼' : ''}
                          {parseFloat(account.balance).toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(parseFloat(account.balance) / Math.max(...(Array.isArray(accounts) ? accounts.map((a: any) => parseFloat(a.balance)) : [1]))) * 100} 
                        className="w-20"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
                <CardDescription>Distribution of your activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Exchanges', value: analyticsData.totalExchangeVolume },
                        { name: 'Transfers', value: analyticsData.totalTransferVolume }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Volume']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity Trends</CardTitle>
              <CardDescription>Transaction volume and count over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="exchanges" fill="#8884d8" name="Exchanges" />
                  <Bar dataKey="transfers" fill="#82ca9d" name="Transfers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currencies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Currency Usage</CardTitle>
                <CardDescription>How often you use each currency</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData.currencyDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ currency, percent }) => `${currency} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.currencyDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Transactions']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Currency Volume</CardTitle>
                <CardDescription>Total volume traded per currency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.currencyDistribution.map((item: any, index: number) => (
                    <div key={item.currency} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <Badge variant="outline">{item.currency}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.volume.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{item.count} transactions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rate Performance</CardTitle>
              <CardDescription>Average exchange rates for your transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.exchangeRateEfficiency.map((item: any, index: number) => (
                  <div key={item.pair} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.pair}</div>
                      <div className="text-sm text-muted-foreground">{item.count} exchanges</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.avgRate.toFixed(6)}</div>
                      <div className="text-xs text-muted-foreground">Average rate</div>
                    </div>
                  </div>
                ))}
                {analyticsData.exchangeRateEfficiency.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No exchange transactions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}