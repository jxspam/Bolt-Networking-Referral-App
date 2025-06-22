import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Line, LineChart, Area, AreaChart } from "recharts";
import { supabase } from "@/lib/supabase";

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "pending":
      return "status-badge status-pending";
    case "approved":
      return "status-badge status-approved";
    case "rejected":
      return "status-badge status-rejected";
    case "completed":
      return "status-badge status-completed";
    default:
      return "status-badge";
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(parseFloat(value));
}

// This data will be replaced by actual data from Supabase

export default function Dashboard() {
  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ["leads"], 
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["users"], 
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Fetch activity data
  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ["activities"], 
    queryFn: async () => {
      // Since activities table doesn't exist, we'll get recent leads and earnings as proxy for activities
      const recentLeadsPromise = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
        
      const recentEarningsPromise = supabase
        .from('earnings')
        .select('*, leads(*)')
        .order('created_at', { ascending: false })
        .limit(2);
        
      const [recentLeadsResponse, recentEarningsResponse] = await Promise.all([
        recentLeadsPromise,
        recentEarningsPromise
      ]);
      
      // Format into activity items
      const leadActivities = (recentLeadsResponse.data || []).map(lead => ({
        id: `lead-${lead.id}`,
        type: "lead",
        message: `New lead from ${lead.customer_name}`,
        time: formatTimeAgo(lead.created_at),
        icon: Users,
        data: lead
      }));
      
      const earningActivities = (recentEarningsResponse.data || []).map(earning => ({
        id: `earning-${earning.id}`,
        type: "approval",
        message: `Lead approved for ${formatCurrency(earning.amount)}`,
        time: formatTimeAgo(earning.created_at),
        icon: CheckCircle,
        data: earning
      }));
      
      return [...leadActivities, ...earningActivities].sort((a, b) => {
        // Sort by time (most recent first)
        const timeA = a.data.created_at;
        const timeB = b.data.created_at;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      }).slice(0, 5); // Limit to 5 activities
    }
  });
  // Generate performance data from leads and earnings
  const { data: performanceData = [] } = useQuery<Array<{month: string, leads: number, conversions: number, earnings: number}>>({
    queryKey: ["performance-data"],
    queryFn: async () => {
      // Get leads and earnings grouped by month
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const leadsPromise = supabase
        .from('leads')
        .select('*')
        .gte('created_at', sixMonthsAgo.toISOString())
        .lte('created_at', now.toISOString());
        
      const earningsPromise = supabase
        .from('earnings')
        .select('*')
        .gte('created_at', sixMonthsAgo.toISOString())
        .lte('created_at', now.toISOString());
        
      const [leadsResponse, earningsResponse] = await Promise.all([
        leadsPromise, earningsPromise
      ]);
      
      const leadsData = leadsResponse.data || [];
      const earningsData = earningsResponse.data || [];
      
      // Group by month
      const monthlyData: Record<string, {month: string, leads: number, conversions: number, earnings: number}> = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Process leads
      leadsData.forEach(lead => {
        const date = new Date(lead.created_at);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        
        if (!monthlyData[key]) {
          monthlyData[key] = { month, leads: 0, conversions: 0, earnings: 0 };
        }
        
        monthlyData[key].leads += 1;
        if (lead.status === 'completed' || lead.status === 'approved') {
          monthlyData[key].conversions += 1;
        }
      });
      
      // Process earnings
      earningsData.forEach(earning => {
        const date = new Date(earning.created_at);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        
        if (!monthlyData[key]) {
          monthlyData[key] = { month, leads: 0, conversions: 0, earnings: 0 };
        }
        
        monthlyData[key].earnings += parseFloat(earning.amount);
      });
      
      // Convert to array and sort by date
      return Object.values(monthlyData)
        .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month))
        .slice(-6); // Get last 6 months
    }
  });
  
  // Helper function for relative time formatting
  function formatTimeAgo(datetime: string): string {
    if (!datetime) return '';
    
    const now = new Date();
    const date = new Date(datetime);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return formatDate(datetime);
  }

  const getUserById = (id: string | null) => {
    if (!id) return null;
    return users.find(user => user.id === id);
  };

  if (leadsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalLeads = leads.length;
  const approvedLeads = leads.filter(lead => lead.status === "approved").length;
  const pendingLeads = leads.filter(lead => lead.status === "pending").length;
  const conversionRate = totalLeads > 0 ? ((approvedLeads / totalLeads) * 100).toFixed(1) : "0";
  const totalValue = leads.reduce((sum, lead) => sum + parseFloat(lead.value), 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your incoming leads and referrals</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leads..."
              className="search-input w-64"
            />
          </div>
          <Button variant="outline" size="sm" className="filter-button">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="filter-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="button-primary">
            <BarChart3 className="w-4 h-4 mr-2" />
            Business Dashboard
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label">Total Leads</div>
              <div className="metric-value">{totalLeads}</div>
              <div className="metric-change positive">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% vs last month
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label">Conversion Rate</div>
              <div className="metric-value">{conversionRate}%</div>
              <div className="metric-change positive">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.4% vs last month
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label">Pending Review</div>
              <div className="metric-value">{pendingLeads}</div>
              <div className="metric-change">
                <Clock className="w-4 h-4 mr-1 text-yellow-600" />
                Requires attention
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label">Total Value</div>
              <div className="metric-value">{formatCurrency(totalValue.toString())}</div>
              <div className="metric-change positive">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.2% vs last month
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Performance Chart */}
        <div className="lg:col-span-2">
          <Card className="card-enhanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Performance Overview</CardTitle>
                  <CardDescription>Lead generation and conversion trends</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Last 6 months
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  leads: { label: "Leads", color: "#3B82F6" },
                  conversions: { label: "Conversions", color: "#10B981" },
                  earnings: { label: "Earnings", color: "#F59E0B" },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="leads" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversions" 
                      stackId="2"
                      stroke="#10B981" 
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = Users; // Replace with a function to get icon based on activity type
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700">
              View all activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Leads Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Active Leads</CardTitle>
              <CardDescription>Manage and track your referral leads</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                All Status
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="table-enhanced">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="table-cell font-semibold">Date</TableHead>
                  <TableHead className="table-cell font-semibold">Referrer</TableHead>
                  <TableHead className="table-cell font-semibold">Customer</TableHead>
                  <TableHead className="table-cell font-semibold">Service</TableHead>
                  <TableHead className="table-cell font-semibold">Value</TableHead>
                  <TableHead className="table-cell font-semibold">Status</TableHead>
                  <TableHead className="table-cell font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.slice(0, 8).map((lead) => {
                  const referrer = getUserById(lead.referrer_id);
                  return (
                    <TableRow key={lead.id} className="table-row">
                      <TableCell className="table-cell text-gray-600">
                        {formatDate(lead.created_at)}
                      </TableCell>
                      <TableCell className="table-cell">
                        {referrer && (
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8 avatar-enhanced">
                              <AvatarImage src={referrer.avatar || ""} />
                              <AvatarFallback className="text-xs">
                                {referrer.first_name?.[0]}{referrer.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {referrer.first_name} {referrer.last_name}
                              </div>
                              <div className="text-xs text-gray-500">Referrer</div>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="table-cell">
                        <div>
                          <div className="font-medium text-gray-900">{lead.customer_name}</div>
                          <div className="text-xs text-gray-500">Customer</div>
                        </div>
                      </TableCell>
                      <TableCell className="table-cell">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          {lead.service}
                        </span>
                      </TableCell>
                      <TableCell className="table-cell">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(lead.value)}
                        </span>
                      </TableCell>
                      <TableCell className="table-cell">
                        <Badge className={getStatusBadgeClass(lead.status)}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="table-cell">
                        <div className="flex items-center space-x-2">
                          {lead.status === "pending" && (
                            <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700 text-white">
                              Approve
                            </Button>
                          )}
                          {lead.status === "approved" && (
                            <Button size="sm" variant="outline" className="text-xs">
                              Mark Complete
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Enhanced Pagination */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">1-8</span> of <span className="font-medium">{leads.length}</span> leads
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled className="text-xs">
                Previous
              </Button>
              <Button size="sm" className="text-xs bg-blue-600 text-white">1</Button>
              <Button variant="outline" size="sm" className="text-xs">2</Button>
              <Button variant="outline" size="sm" className="text-xs">3</Button>
              <Button variant="outline" size="sm" className="text-xs">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}