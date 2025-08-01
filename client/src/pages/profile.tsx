import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";
import { removeAuthToken } from "@/lib/auth";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    removeAuthToken();
    setLocation("/login");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Loading Profile...
            </h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your account information and settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Your account details and personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-gray-100">{user.name}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-gray-100">{user.username}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User ID
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">{user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Shield className="h-5 w-5 text-green-600" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">Account Status</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your account is active and verified</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Summary */}
        {accounts && accounts.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Mail className="h-5 w-5 text-purple-600" />
                Account Balances
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Overview of your currency balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {accounts.map((account: any) => (
                  <div key={account.id} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {account.currency}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {parseFloat(account.balance).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Security Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Your profile information is read-only for security purposes</p>
              <p>• To update your personal information, please contact our support team</p>
              <p>• Always keep your login credentials secure and never share them</p>
              <p>• Log out when using shared or public computers</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />

        {/* Logout Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="flex items-center gap-2 px-8 py-3"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}