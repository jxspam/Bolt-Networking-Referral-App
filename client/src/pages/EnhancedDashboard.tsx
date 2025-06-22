import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Area,
  AreaChart
} from "recharts";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Calendar,
  CreditCard
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lead, User, Payout, Campaign } from "../../../shared/schema";

// Define a more specific type for the lead data returned from Supabase
type LeadWithCampaign = Lead & { campaigns: Campaign | null };

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatDate(dateInput: string | null | Date) {
  if (!dateInput) return "N/A";
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric", 
    year: "numeric"
  });
}

function formatCurrency(value: string | number) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(numValue);
}

export default function EnhancedDashboard() {
  const [leads, setLeads] = useState<LeadWithCampaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch current user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (userError) console.error("Error fetching user:", userError);
      else setCurrentUser(userData);

      // Fetch leads referred by the user
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*, campaigns(*)')
        .eq('referred_by_user_id', session.user.id);
      if (leadsError) console.error("Error fetching leads:", leadsError);
      else setLeads((leadsData as LeadWithCampaign[]) || []);

      // Fetch all users to map names
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      if (usersError) console.error("Error fetching users:", usersError);
      else setUsers(usersData || []);

      // Fetch payouts for the user
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', session.user.id);
      if (payoutsError) console.error("Error fetching payouts:", payoutsError);
      else setPayouts(payoutsData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Calculate metrics from actual data
  const totalReferrals = leads.length;
  const approvedLeads = leads.filter(lead => lead.status === "successful");
  const pendingLeads = leads.filter(lead => lead.status === "pending");
  
  const totalEarnings = payouts.reduce((sum, payout) => sum + parseFloat(payout.amount), 0);
  const pendingEarnings = pendingLeads.reduce((sum, lead) => sum + parseFloat(lead.value) * (lead.campaigns?.commissionRate || 0.1), 0);
  const withdrawableBalance = totalEarnings;

  // Chart data for referral performance using actual data
  const monthlyData: { [key: string]: { completed: number, pending: number, earnings: number } } = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  leads.forEach(lead => {
    if (lead.createdAt) {
      const date = new Date(lead.createdAt);
      const month = monthNames[date.getMonth()];
      if (!monthlyData[month]) {
        monthlyData[month] = { completed: 0, pending: 0, earnings: 0 };
      }
      if (lead.status === 'successful') {
        monthlyData[month].completed++;
        monthlyData[month].earnings += parseFloat(lead.value) * (lead.campaigns?.commissionRate || 0.1);
      } else if (lead.status === 'pending') {
        monthlyData[month].pending++;
      }
    }
  });

  const referralPerformanceData = monthNames.map(month => ({
    month,
    completed: monthlyData[month]?.completed || 0,
    pending: monthlyData[month]?.pending || 0,
    earnings: monthlyData[month]?.earnings || 0,
  }));

  // Get recent referrals from leads data and map to users
  const recentReferrals = leads.slice(0, 4).map(lead => {
    return {
      id: lead.id,
      name: lead.customerName,
      email: `${lead.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      avatar: `https://avatar.vercel.sh/${lead.customerName}`,
      date: lead.createdAt ? formatDate(lead.createdAt) : "Recent",
      status: lead.status.charAt(0).toUpperCase() + lead.status.slice(1),
      earnings: lead.status === "successful" ? parseFloat(lead.value) * (lead.campaigns?.commissionRate || 0.1) : 0
    };
  });

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back, {currentUser?.firstName || 'User'}!</h1>
        <p className="text-gray-600">Here's an overview of your referral performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold">{totalReferrals}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  12% vs last month
                </p>
                <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">
                  View details
                </Button>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Earnings Pending</p>
                <p className="text-3xl font-bold">{formatCurrency(pendingEarnings)}</p>
                <p className="text-sm text-gray-600">Processing - Est. release: 7 days</p>
                <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">
                  View details
                </Button>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Withdrawable Balance</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(withdrawableBalance)}</p>
                <p className="text-sm text-gray-600">Available</p>
                <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm">
                  Withdraw Funds
                </Button>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Referral Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: {
                  label: "Completed Referrals",
                  color: "#3B82F6",
                },
                pending: {
                  label: "Pending Referrals",
                  color: "#94A3B8",
                },
                earnings: {
                  label: "Earnings ($)",
                  color: "#10B981",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={referralPerformanceData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="1"
                    stroke="#94A3B8" 
                    fill="#94A3B8"
                    fillOpacity={0.6}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center mt-4 space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Completed Referrals</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span>Pending Referrals</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Earnings ($)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Create New Referral
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Follow-up
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Referrals</CardTitle>
            <Button variant="link" className="text-blue-600">
              View all
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={referral.avatar} />
                        <AvatarFallback>
                          {referral.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{referral.name}</div>
                        <div className="text-sm text-gray-500">{referral.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{referral.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(referral.status)}>
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(referral.earnings)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}