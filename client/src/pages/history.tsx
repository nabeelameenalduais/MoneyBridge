import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currencyFrom: string;
  currencyTo: string;
  createdAt: string;
  receiverId?: string;
  exchangeRate?: string;
  message?: string;
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  SAR: "ر.س",
  YER: "﷼",
};

export default function HistoryPage() {
  const [filters, setFilters] = useState({
    type: "all",
    currency: "all",
    dateFrom: "",
    dateTo: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions", appliedFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (appliedFilters.type !== "all") params.append("type", appliedFilters.type);
      if (appliedFilters.currency !== "all") params.append("currency", appliedFilters.currency);
      if (appliedFilters.dateFrom) params.append("dateFrom", appliedFilters.dateFrom);
      if (appliedFilters.dateTo) params.append("dateTo", appliedFilters.dateTo);
      params.append("limit", "100");

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.json();
    },
  });

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const emptyFilters = {
      type: "all",
      currency: "all",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return `${currencySymbols[currency]}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'exchange':
        return 'Exchange';
      case 'transfer':
        return 'Transfer';
      case 'received':
        return 'Received';
      default:
        return type;
    }
  };

  const getStatusBadge = () => (
    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
      Completed
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h2>
        <p className="text-secondary">View and filter all your transactions</p>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="px-4 py-3 border-gray-200 rounded-xl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="px-4 py-3 border-gray-200 rounded-xl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger className="px-4 py-3 border-gray-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="exchange">Exchange</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <Select value={filters.currency} onValueChange={(value) => setFilters({ ...filters, currency: value })}>
                <SelectTrigger className="px-4 py-3 border-gray-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="YER">YER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={clearFilters}
              variant="ghost"
              className="text-secondary hover:text-gray-900 text-sm font-medium"
            >
              Clear Filters
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary">
                Showing {transactions.length} transactions
              </span>
              <Button variant="ghost" className="text-primary hover:text-blue-700 text-sm font-medium">
                <i className="fas fa-download mr-2"></i>
                Export
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-history text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">Try adjusting your filters or make your first transaction</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction: Transaction) => {
                  const { date, time } = formatDate(transaction.createdAt);
                  return (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{date}</div>
                        <div className="text-sm text-secondary">{time}</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <i className={`${getTransactionIcon(transaction.type)} text-sm`}></i>
                          </div>
                          <span className="text-sm font-medium">{getTransactionType(transaction.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${transaction.type === 'received' ? 'text-success' : 'text-error'}`}>
                          {transaction.type === 'received' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currencyFrom)}
                        </div>
                        {transaction.type === 'exchange' && transaction.currencyTo && (
                          <div className="text-sm text-success">
                            +{formatAmount((parseFloat(transaction.amount) * parseFloat(transaction.exchangeRate || '1')).toString(), transaction.currencyTo)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {transaction.type === 'exchange' 
                            ? `${transaction.currencyFrom} → ${transaction.currencyTo}`
                            : transaction.currencyFrom
                          }
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-secondary">
                          {transaction.type === 'exchange' && transaction.exchangeRate
                            ? `Rate: ${parseFloat(transaction.exchangeRate).toFixed(4)}`
                            : transaction.message || '-'
                          }
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
