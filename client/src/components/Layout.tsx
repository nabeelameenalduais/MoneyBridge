import { useAuth, useLogout } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  username: string;
  name: string;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth() as { user: User | undefined };
  const { logout } = useLogout();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "fas fa-tachometer-alt" },
    { name: "Exchange", href: "/exchange", icon: "fas fa-exchange-alt" },
    { name: "Transfer", href: "/transfer", icon: "fas fa-paper-plane" },
    { name: "History", href: "/history", icon: "fas fa-history" },
    { name: "Analytics", href: "/analytics", icon: "fas fa-chart-line" },
  ];

  const isActive = (href: string) => location === href;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-16">
        {/* Header */}
        <header className="bg-surface border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center">
                <i className="fas fa-exchange-alt text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Exchange Portal</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-secondary">@{user?.username}</p>
              </div>
              <button 
                onClick={logout}
                className="flex items-center space-x-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          {children}
        </main>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-50">
          <div className="grid grid-cols-5 h-16">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center ${
                  isActive(item.href) ? "text-primary" : "text-gray-400"
                }`}
              >
                <i className={`${item.icon} text-lg mb-1`}></i>
                <span className="text-xs">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center">
                <i className="fas fa-exchange-alt text-white"></i>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Exchange Portal</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <i className="fas fa-bell"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-[#050500]">@{user?.username}</p>
              </div>
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-gray-600"></i>
              </div>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:flex w-64 bg-surface border-r border-gray-200 min-h-[calc(100vh-73px)]`}>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary bg-blue-50"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                <i className={`${item.icon} w-5`}></i>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
