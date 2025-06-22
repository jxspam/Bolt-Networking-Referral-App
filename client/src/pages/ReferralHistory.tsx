import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Bar, BarChart } from "recharts";
import { Search, Filter, Download, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Lead, User } from "../../../shared/schema";

// Data will be fetched from Supabase

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

export default function ReferralHistory() {
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Fetch history data
  const { data: historyData = [], isLoading: historyLoading } = useQuery<Array<{
    month: string; 
    referrals: number; 
    approved: number; 
    earnings: number;
  }>>({
    queryKey: ["referral-history"], 
    queryFn: async () => {
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
      const monthlyData: Record<string, {
        month: string;
        referrals: number;
        approved: number;
        earnings: number;
      }> = {};
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Process leads for referrals and approved
      leadsData.forEach(lead => {
        const date = new Date(lead.created_at);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        
        if (!monthlyData[key]) {
          monthlyData[key] = { month, referrals: 0, approved: 0, earnings: 0 };
        }
        
        monthlyData[key].referrals += 1;
        if (lead.status === 'completed' || lead.status === 'approved') {
          monthlyData[key].approved += 1;
        }
      });
      
      // Process earnings
      earningsData.forEach(earning => {
        const date = new Date(earning.created_at);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        
        if (!monthlyData[key]) {
          monthlyData[key] = { month, referrals: 0, approved: 0, earnings: 0 };
        }
        
        monthlyData[key].earnings += parseFloat(earning.amount);
      });
      
      // Convert to array and sort by date
      return Object.values(monthlyData)
        .sort((a, b) => {
          const monthA = monthNames.indexOf(a.month);
          const monthB = monthNames.indexOf(b.month);
          return monthA - monthB;
        })
        .slice(-6); // Get last 6 months
    }
  });
  
  // Fetch status data
  const { data: statusData = [], isLoading: statusLoading } = useQuery<Array<{
    status: string;
    count: number;
    color: string;
  }>>({
    queryKey: ["status-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('status');
        
      if (error) throw error;
      
      const statusCounts: Record<string, number> = {
        "approved": 0,
        "pending": 0, 
        "rejected": 0,
        "completed": 0
      };
      
      (data || []).forEach(lead => {
        const status = lead.status || "pending";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
        const statusColors: Record<string, string> = {
        "approved": "#10B981",
        "pending": "#F59E0B",
        "rejected": "#EF4444",
        "completed": "#3B82F6"
      };
      
      return Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        color: statusColors[status as keyof typeof statusColors] || "#6B7280"
      }));
    }
  });

  const getUserById = (id: string | null) => {
    if (!id) return null;
    return users.find(user => user.id === id);
  };

  if (leadsLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const totalReferrals = leads.length;
  const approvedReferrals = leads.filter(lead => lead.status === "approved").length;
  const pendingReferrals = leads.filter(lead => lead.status === "pending").length;
  const totalEarnings = leads
    .filter(lead => lead.status === "approved" || lead.status === "completed")
    .reduce((sum, lead) => sum + parseFloat(lead.value), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Referral History</h1>
          <p className="text-gray-600">Track your referral performance and earnings over time</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold">{totalReferrals}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedReferrals}</p>
              </div>
              <div className="text-sm text-green-600">
                {totalReferrals > 0 ? ((approvedReferrals / totalReferrals) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingReferrals}</p>
              </div>
              <div className="text-sm text-yellow-600">
                {totalReferrals > 0 ? ((pendingReferrals / totalReferrals) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalEarnings.toString())}
                </p>
              </div>
              <div className="text-sm text-green-600">+15.3%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Referral Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Referral Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                referrals: {
                  label: "Referrals",
                  color: "#3B82F6",
                },
                approved: {
                  label: "Approved",
                  color: "#10B981",
                },
                earnings: {
                  label: "Earnings",
                  color: "#F59E0B",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="referrals" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="earnings" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="status" type="category" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" layout="vertical" radius={5} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Referral History Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detailed History</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input placeholder="Search by name or service..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Referred By</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const referrer = getUserById(lead.referrerId);
                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-medium">{lead.customerName}</div>
                      {lead.businessName && <div className="text-sm text-gray-500">{lead.businessName}</div>}
                    </TableCell>
                    <TableCell>
                      {referrer ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">                            <AvatarImage src={referrer.avatar || undefined} />
                            <AvatarFallback>{referrer.firstName ? referrer.firstName[0] : ''}{referrer.lastName ? referrer.lastName[0] : ''}</AvatarFallback>
                          </Avatar>
                          <span>{referrer.firstName} {referrer.lastName}</span>
                        </div>
                      ) : (
                        <span>Direct</span>
                      )}
                    </TableCell>
                    <TableCell>{lead.service}</TableCell>
                    <TableCell>{formatCurrency(lead.value)}</TableCell>
                    <TableCell>{formatDate(lead.createdAt ? lead.createdAt.toString() : null)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(lead.status)}>{lead.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
