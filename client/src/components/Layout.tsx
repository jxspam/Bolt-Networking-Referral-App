import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  Share, 
  History, 
  DollarSign, 
  BarChart3, 
  Megaphone, 
  Settings,
  Bell,
  Network,
  ChevronDown,
  Search,
  Plus,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { User as LucideUser } from "lucide-react";
import { getUserProfile, UserProfile } from "@/lib/user-profile";

interface LayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { path: "/", icon: Home, label: "Dashboard", badge: null },
  { path: "/network", icon: Users, label: "My Network", badge: null },
  { path: "/share-referral", icon: Share, label: "Share Referral", badge: null },
  { path: "/referral-history", icon: History, label: "Referral History", badge: null },
  { path: "/earnings", icon: DollarSign, label: "Earnings", badge: "new" },
  { path: "/analytics", icon: BarChart3, label: "Analytics", badge: null },
  { path: "/campaigns", icon: Megaphone, label: "Campaigns", badge: null },
  { path: "/settings", icon: Settings, label: "Settings", badge: null },
];

export default function Layout({ children }: LayoutProps) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [notificationCount] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setUser(userProfile);
      }
    };
    fetchUser();
  }, []);
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Force a page redirect to ensure we get to the login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="gradient-header text-white sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Network Earnings</h1>
                  <p className="text-xs text-white/80 hidden sm:block">Referral Management Platform</p>
                </div>
              </div>
            </div>

            {/* Center section - Search (hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search leads, campaigns, referrers..."
                  className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
                />
              </div>
            </div>
            
            {/* Right section */}
            <div className="flex items-center space-x-4">
              <Link href="/create-offer">
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-none shadow-none hidden sm:flex"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Referral
                </Button>
              </Link>
              
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors">                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold">{user ? `${user.first_name} ${user.last_name}` : 'Loading...'}</div>
                      <div className="text-xs text-white/80">{user ? user.tier : '...'} Referrer</div>
                    </div>
                    <Avatar className="w-8 h-8 border-2 border-white/20">
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback>{user ? `${user.first_name?.[0]}${user.last_name?.[0]}` : 'U'}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dropdown-enhanced">
                  <DropdownMenuItem className="dropdown-item">
                    <div className="flex flex-col">
                      <span className="font-medium">{user ? `${user.first_name} ${user.last_name}` : 'Loading...'}</span>
                      <span className="text-xs text-gray-500">{user ? user.email : ''}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Link href="/settings">
                    <DropdownMenuItem className="dropdown-item cursor-pointer">Profile Settings</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="dropdown-item">Account Preferences</DropdownMenuItem>
                  <DropdownMenuItem className="dropdown-item">Billing & Payments</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="dropdown-item text-red-600 cursor-pointer">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Enhanced Sidebar */}
        <aside className={`
          bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          fixed inset-y-0 left-0 w-72 lg:w-72
        `}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || (item.path === "/" && location === "/dashboard");
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div 
                      className={`sidebar-item ${isActive ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
            
            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-100">
              <Link href="/create-offer">
                <Button 
                  className="w-full button-primary"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Referral
                </Button>
              </Link>
              
              {/* Quick Stats */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-2">This Month</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">24</div>
                    <div className="text-xs text-gray-500">Referrals</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">$1,250</div>
                    <div className="text-xs text-gray-500">Earned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}