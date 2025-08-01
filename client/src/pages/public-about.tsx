import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Globe, Clock, Award, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function PublicAboutPage() {
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
                <a className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Exchange Rates
                </a>
              </Link>
              <Link href="/public-about">
                <a className="text-blue-600 dark:text-blue-400 font-medium">
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            About Exchange Office
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Your trusted partner for secure, fast, and reliable currency exchange services
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100 text-xl">
                <Shield className="h-7 w-7 text-blue-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                We provide secure, transparent, and efficient currency exchange services to individuals and businesses. 
                Our platform ensures competitive rates and seamless transactions across multiple currencies, making 
                international finance accessible to everyone.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100 text-xl">
                <TrendingUp className="h-7 w-7 text-green-600" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                To become the leading digital currency exchange platform in the region, 
                making international transactions accessible and affordable for everyone while maintaining 
                the highest standards of security and customer service.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100 text-2xl">
              <Award className="h-8 w-8 text-yellow-600" />
              Our Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">Competitive Rates</h4>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  We offer some of the best exchange rates in the market, updated in real-time 
                  to ensure you always get the most value for your money.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">Bank-Level Security</h4>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  All transactions are encrypted and protected with the latest security measures, 
                  ensuring your funds and data are always safe.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">Instant Processing</h4>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  Experience instant currency exchanges and quick transfer processing, 
                  so your money moves as fast as you do.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">Expert Support</h4>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  Our dedicated customer support team is available around the clock 
                  to assist you with any questions or concerns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}