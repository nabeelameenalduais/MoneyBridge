import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exchangeSchema, type ExchangeRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Account {
  id: string;
  currency: string;
  balance: string;
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  SAR: "ر.س",
  YER: "﷼",
};

const currencyNames: Record<string, string> = {
  USD: "USD - US Dollar",
  SAR: "SAR - Saudi Riyal", 
  YER: "YER - Yemeni Rial",
};

export default function ExchangePage() {
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const form = useForm<ExchangeRequest>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: {
      fromCurrency: "USD",
      toCurrency: "SAR",
      amount: undefined,
    },
  });

  const fromCurrency = form.watch("fromCurrency");
  const toCurrency = form.watch("toCurrency");
  const amount = form.watch("amount");

  // Fetch exchange rate when currencies change
  useEffect(() => {
    const fetchRate = async () => {
      if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
        try {
          const response = await fetch(`/api/exchange-rates/${fromCurrency}/${toCurrency}`);
          if (response.ok) {
            const data = await response.json();
            setExchangeRate(data.rate);
          }
        } catch (error) {
          console.error("Failed to fetch exchange rate:", error);
        }
      }
    };

    fetchRate();
  }, [fromCurrency, toCurrency]);

  // Calculate converted amount when rate or amount changes
  useEffect(() => {
    if (exchangeRate && amount && amount > 0) {
      setConvertedAmount(amount * exchangeRate);
    } else {
      setConvertedAmount(0);
    }
  }, [exchangeRate, amount]);

  const exchangeMutation = useMutation({
    mutationFn: async (data: ExchangeRequest) => {
      const response = await apiRequest("POST", "/api/exchange", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Exchange successful",
        description: "Your currency exchange has been completed",
      });
      form.reset({ fromCurrency, toCurrency, amount: undefined });
    },
    onError: (error: any) => {
      toast({
        title: "Exchange failed",
        description: error.message || "Failed to complete exchange",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ExchangeRequest) => {
    exchangeMutation.mutate(data);
  };

  const swapCurrencies = () => {
    const currentFrom = form.getValues("fromCurrency");
    const currentTo = form.getValues("toCurrency");
    form.setValue("fromCurrency", currentTo);
    form.setValue("toCurrency", currentFrom);
  };

  const getAccountBalance = (currency: string) => {
    const account = accounts.find((acc: Account) => acc.currency === currency);
    return account ? parseFloat(account.balance) : 0;
  };

  const formatBalance = (amount: number, currency: string) => {
    return `${currencySymbols[currency]}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (accountsLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-6" />
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-12 mx-auto" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Currency Exchange</h2>
        <p className="text-[#080000]">Convert your currencies at live market rates</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Exchange Form */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Exchange Currencies</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* From Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fromCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="px-4 py-3 border-gray-200 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">{currencyNames.USD}</SelectItem>
                              <SelectItem value="SAR">{currencyNames.SAR}</SelectItem>
                              <SelectItem value="YER">{currencyNames.YER}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="px-4 py-3 border-gray-200 rounded-xl"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-sm mt-2 text-[#1c1c00]">
                    Available: {formatBalance(getAccountBalance(fromCurrency), fromCurrency)}
                  </p>
                  <FormMessage />
                </div>

                {/* Exchange Icon */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={swapCurrencies}
                    className="w-12 h-12 bg-primary rounded-full p-0 hover:bg-blue-700"
                  >
                    <i className="fas fa-exchange-alt text-white"></i>
                  </Button>
                </div>

                {/* To Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="toCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="px-4 py-3 border-gray-200 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">{currencyNames.USD}</SelectItem>
                              <SelectItem value="SAR">{currencyNames.SAR}</SelectItem>
                              <SelectItem value="YER">{currencyNames.YER}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Input
                      type="text"
                      value={convertedAmount > 0 ? convertedAmount.toFixed(2) : ""}
                      readOnly
                      placeholder="0.00"
                      className="px-4 py-3 border-gray-200 rounded-xl bg-gray-50"
                    />
                  </div>
                </div>

                {/* Exchange Rate Info */}
                {exchangeRate > 0 && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exchange Rate</span>
                      <span className="font-medium">
                        1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Fee</span>
                      <span className="font-medium text-success">Free</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={exchangeMutation.isPending || !amount || fromCurrency === toCurrency || getAccountBalance(fromCurrency) < amount}
                  className="w-full bg-primary text-white py-3 px-4 rounded-xl hover:bg-blue-700 font-medium"
                >
                  {exchangeMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    "Complete Exchange"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Exchange Summary */}
        <div className="space-y-6">
          {/* Current Balances */}
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Current Balances</h4>
              <div className="space-y-3">
                {accounts.map((account: Account) => (
                  <div key={account.id} className="flex justify-between">
                    <span className="text-gray-600">{account.currency}</span>
                    <span className="font-medium">
                      {formatBalance(parseFloat(account.balance), account.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Exchange Rates */}
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Current Exchange Rates</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">USD/SAR</span>
                  <span className="font-medium">3.7500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">USD/YER</span>
                  <span className="font-medium">250.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SAR/YER</span>
                  <span className="font-medium">66.67</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
