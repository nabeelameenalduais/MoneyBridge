import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(data);
      setLocation("/dashboard");
      toast({
        title: "Login successful",
        description: "Welcome to Exchange Portal",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Navigation */}
      <nav className="nav-modern">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'var(--gradient-primary)'}}>
                <span className="text-white font-bold text-lg">EO</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Exchange Office
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="/public-exchange-rates"
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Exchange Rates
              </a>
              <a 
                href="/public-about"
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                About
              </a>
              <a 
                href="/public-contact"
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full animate-slide-up">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-in" 
                 style={{background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-strong)'}}>
              <span className="text-white font-bold text-3xl">EO</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Secure access to your currency accounts</p>
          </div>

          {/* Login Form */}
          <div className="card-modern animate-scale">
            <div className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Username Field */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="input-modern py-4 text-lg"
                            placeholder="Enter your username"
                          />
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="input-modern py-4 text-lg pr-16"
                              placeholder="Enter your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="btn-modern w-full py-4 text-lg font-semibold text-white"
                  >
                    {loginMutation.isPending ? (
                      <>
                        ⏳ Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-2">Demo Account:</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Username: <span className="font-mono">demo</span></p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Password: <span className="font-mono">password123</span></p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🔒 Secured with 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
