import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transferSchema, type TransferRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Account {
  id: string;
  currency: string;
  balance: string;
}

interface RecipientInfo {
  username: string;
  name: string;
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

export default function TransferPage() {
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [recipientError, setRecipientError] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const form = useForm<TransferRequest>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientUsername: "",
      currency: "USD",
      amount: 0,
      message: "",
    },
  });

  const recipientUsername = form.watch("recipientUsername");
  const currency = form.watch("currency");
  const amount = form.watch("amount");

  // Verify recipient when username changes
  useEffect(() => {
    const verifyRecipient = async () => {
      if (recipientUsername && recipientUsername.length >= 3) {
        try {
          const response = await fetch(`/api/clients/verify/${recipientUsername}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setRecipientInfo(data);
            setRecipientError("");
          } else {
            setRecipientInfo(null);
            setRecipientError("Recipient not found");
          }
        } catch (error) {
          setRecipientInfo(null);
          setRecipientError("Failed to verify recipient");
        }
      } else {
        setRecipientInfo(null);
        setRecipientError("");
      }
    };

    const timeoutId = setTimeout(verifyRecipient, 500);
    return () => clearTimeout(timeoutId);
  }, [recipientUsername]);

  const transferMutation = useMutation({
    mutationFn: async (data: TransferRequest) => {
      const response = await apiRequest("POST", "/api/transfer", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transfer successful",
        description: "Your transfer has been completed",
      });
      form.reset({ recipientUsername: "", currency: "USD", amount: 0, message: "" });
      setRecipientInfo(null);
    },
    onError: (error: any) => {
      toast({
        title: "Transfer failed",
        description: error.message || "Failed to complete transfer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TransferRequest) => {
    if (!recipientInfo) {
      toast({
        title: "Invalid recipient",
        description: "Please enter a valid recipient username",
        variant: "destructive",
      });
      return;
    }
    transferMutation.mutate(data);
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
        <div className="max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-2 gap-6">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Funds</h2>
        <p className="text-secondary">Send money securely to other clients</p>
      </div>

      <div className="max-w-2xl">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Recipient */}
                <FormField
                  control={form.control}
                  name="recipientUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Recipient Username or ID
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="@username or client ID"
                            className="pl-12 px-4 py-3 border-gray-200 rounded-xl"
                          />
                          <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                      </FormControl>
                      <FormMessage />
                      
                      {/* Recipient validation feedback */}
                      {recipientInfo && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-success">
                            <i className="fas fa-check-circle mr-2"></i>
                            Recipient found: {recipientInfo.name}
                          </p>
                        </div>
                      )}
                      
                      {recipientError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-error">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {recipientError}
                          </p>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {/* Currency and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Currency</FormLabel>
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
                        <FormLabel className="text-sm font-medium text-gray-700">Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="px-4 py-3 border-gray-200 rounded-xl"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <p className="text-sm text-secondary mt-1">
                          Available: {formatBalance(getAccountBalance(currency), currency)}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Message (Optional) */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Message (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add a note for the recipient..."
                          rows={3}
                          className="px-4 py-3 border-gray-200 rounded-xl resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Transfer Summary */}
                {amount > 0 && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">Transfer Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-medium">{formatBalance(amount, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transfer Fee</span>
                        <span className="font-medium text-success">Free</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Total</span>
                          <span className="font-medium text-gray-900">{formatBalance(amount, currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    transferMutation.isPending || 
                    !amount || 
                    !recipientInfo || 
                    getAccountBalance(currency) < amount
                  }
                  className="w-full bg-success text-white py-3 px-4 rounded-xl hover:bg-green-700 font-medium"
                >
                  {transferMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Send Transfer
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
