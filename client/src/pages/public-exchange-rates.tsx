import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, ArrowRightLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function PublicExchangeRatesPage() {
  const { data: rates, isLoading } = useQuery({
    queryKey: ["/api/exchange-rates/public"],
    staleTime: 60000, // 1 minute
  });

  const formatRate = (rate: string | number) => {
    return parseFloat(rate.toString()).toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EO</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Exchange Office
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/public-exchange-rates">
                <a className="text-blue-600 dark:text-blue-400 font-medium">
                  Exchange Rates
                </a>
              </Link>
              <Link href="/public-about">
                <a className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  About
                </a>
              </Link>
              <Link href="/public-contact">
                <a className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Contact
                </a>
              </Link>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Today's Exchange Rates
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Live currency exchange rates updated in real-time for USD, SAR, and YER
          </p>
        </div>

        {/* Rate Information Banner */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4 text-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-blue-900 dark:text-blue-100 font-semibold">
                  Rates updated every hour
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* USD Rates */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100 text-xl">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-green-700 dark:text-green-300 font-bold text-sm">$</span>
                  </div>
                  US Dollar (USD)
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Exchange rates from USD to other currencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ArrowRightLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">USD → SAR</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {rates?.find((r: any) => r.baseCurrency === 'USD' && r.targetCurrency === 'SAR')?.rate 
                        ? formatRate(rates.find((r: any) => r.baseCurrency === 'USD' && r.targetCurrency === 'SAR').rate)
                        : '3.7500'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ArrowRightLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">USD → YER</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {rates?.find((r: any) => r.baseCurrency === 'USD' && r.targetCurrency === 'YER')?.rate 
                        ? formatRate(rates.find((r: any) => r.baseCurrency === 'USD' && r.targetCurrency === 'YER').rate)
                        : '250.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SAR Rates */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100 text-xl">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">ر.س</span>
                  </div>
                  Saudi Riyal (SAR)
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Exchange rates from SAR to other currencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ArrowRightLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">SAR → USD</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {rates?.find((r: any) => r.baseCurrency === 'SAR' && r.targetCurrency === 'USD')?.rate 
                        ? formatRate(rates.find((r: any) => r.baseCurrency === 'SAR' && r.targetCurrency === 'USD').rate)
                        : '0.2667'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ArrowRightLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">SAR → YER</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {rates?.find((r: any) => r.baseCurrency === 'SAR' && r.targetCurrency === 'YER')?.rate 
                        ? formatRate(rates.find((r: any) => r.baseCurrency === 'SAR' && r.targetCurrency === 'YER').rate)
                        : '66.67'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* YER Rates */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100 text-xl">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <span className="text-yellow-700 dark:text-yellow-300 font-bold text-sm">﷼</span>
                  </div>
                  Yemeni Rial (YER)
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Exchange rates from YER to other currencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ArrowRightLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">YER → USD</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {rates?.find((r: any) => r.baseCurrency === 'YER' && r.targetCurrency === 'USD')?.rate 
                        ? formatRate(rates.find((r: any) => r.baseCurrency === 'YER' && r.targetCurrency === 'USD').rate)
                        : '0.0040'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ArrowRightLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">YER → SAR</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {rates?.find((r: any) => r.baseCurrency === 'YER' && r.targetCurrency === 'SAR')?.rate 
                        ? formatRate(rates.find((r: any) => r.baseCurrency === 'YER' && r.targetCurrency === 'SAR').rate)
                        : '0.0150'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Ready to Exchange?</h3>
                <p className="mb-6 text-blue-100">
                  Join thousands of satisfied customers and start exchanging currencies today
                </p>
                <Link href="/login">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3">
                    Get Started Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}