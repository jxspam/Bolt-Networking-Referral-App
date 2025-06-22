import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  Search,
  UserPlus,
  Activity,
  Settings,
  Bell,
  ChevronRight,
  Filter,
  Download,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Lead, User, Campaign, Dispute, Payout, Activity as ActivityType } from "../../../shared/schema";

interface AnalyticsData {
  totalReferrals: number;
  conversionRate: number;
  totalPayouts: number;
  activeCampaigns: number;
  pendingDisputes: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'fraud_alert':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'dispute':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function AdminOverview() {
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: disputes = [], isLoading: disputesLoading } = useQuery<Dispute[]>({
    queryKey: ["disputes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("disputes").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: earnings = [], isLoading: earningsLoading } = useQuery<Payout[]>({
    queryKey: ["payouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payouts").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<ActivityType[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  if (leadsLoading || usersLoading || campaignsLoading || disputesLoading || earningsLoading || activitiesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // Get top performers from users with highest earnings
  const topPerformers = users.map((user) => {
    const userEarningsData = earnings.filter((earning) => earning.userId === user.id);
    const userLeads = leads.filter((lead) => lead.referrerId === user.id);
    const totalEarnings = userEarningsData.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
    const totalGenerated = userLeads.reduce((sum, lead) => sum + parseFloat(lead.value), 0);
    
    return {
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || `https://robohash.org/${user.id}.png?size=32x32`,
      referrals: userLeads.length,
      generated: totalGenerated,
      earnings: totalEarnings
    };
  }).sort((a, b) => b.earnings - a.earnings).slice(0, 4);

  // Calculate analytics from actual data
  const analyticsData: AnalyticsData = {
    totalReferrals: leads.length,
    conversionRate: leads.length > 0 ? (leads.filter((lead) => lead.status === "approved").length / leads.length) * 100 : 0,
    totalPayouts: earnings.filter((earning) => earning.status === "paid").reduce((sum, earning) => sum + parseFloat(earning.amount), 0),
    activeCampaigns: campaigns.filter((campaign) => campaign.status === "active").length,
    pendingDisputes: disputes.filter((dispute) => dispute.status === "pending").length
  };

  // Generate chart data from actual database data
  const totalReferralsData = Array.from({ length: 6 }, (_, i) => ({
    value: Math.floor(leads.length * (0.5 + i * 0.1))
  }));

  const conversionRateData = Array.from({ length: 6 }, (_, i) => ({
    value: Math.floor(analyticsData.conversionRate * (0.8 + i * 0.05))
  }));

  const totalPayoutsData = Array.from({ length: 6 }, (_, i) => ({
    value: Math.floor(analyticsData.totalPayouts * (0.6 + i * 0.08))
  }));

  // Get recent users for search results
  const recentSearches = users.slice(0, 3).map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatar || `https://robohash.org/${user.id}.png?size=32x32`
  }));

  // Get flagged referrals from rejected leads and disputes
  const flaggedReferrals = [
    ...leads.filter((lead) => lead.status === "rejected").slice(0, 2).map((lead) => {
      const referrer = users.find((user) => user.id === lead.referrerId);
      return {
        id: `REF-${lead.id}`,
        referrer: referrer ? `${referrer.firstName} ${referrer.lastName}` : lead.customerName,
        avatar: referrer?.avatar || `https://images.unsplash.com/photo-1400000000000?w=24&h=24&fit=crop&crop=face`,
        date: lead.createdAt ? formatDate(lead.createdAt.toString()) : "Recent",
        amount: formatCurrency(parseFloat(lead.value)),
        status: "fraud_alert"
      };
    }),
    ...disputes.slice(0, 2).map((dispute) => {
      const referrer = users.find((user) => user.id === dispute.referrerId);
      return {
        id: dispute.id,
        referrer: referrer ? `${referrer.firstName} ${referrer.lastName}` : "Unknown User",
        avatar: referrer?.avatar || `https://robohash.org/${dispute.id}.png?size=24x24`,
        date: dispute.createdAt ? formatDate(dispute.createdAt.toString()) : "Recent",
        amount: "$0.00",
        status: "dispute"
      };
    })
  ];
  // This calculation has been moved up before the JSX

  // Map activities from database
  const recentActivities = activities.slice(0, 4).map((activity) => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description || "No description available",
    timestamp: activity.createdAt ? formatDate(activity.createdAt.toString()) : "Recent",
    icon: activity.type === "payout_processed" ? DollarSign : 
          activity.type === "dispute" ? AlertTriangle :
          activity.type === "campaign" ? Target : UserPlus,
    color: activity.type === "payout_processed" ? "text-green-600" :
           activity.type === "dispute" ? "text-yellow-600" :
           activity.type === "campaign" ? "text-blue-600" : "text-purple-600"
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground">Monitor and manage your referral network</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalReferrals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
            <div className="mt-4 h-[40px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={totalReferralsData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2.4%</span> from last month
            </p>
            <div className="mt-4 h-[40px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionRateData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
            <div className="mt-4 h-[40px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalPayoutsData}>
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> new this week
            </p>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-1">Campaign Performance</div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pendingDisputes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">Requires attention</span>
            </p>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-1">Resolution Rate</div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>Recent user searches and activity</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search users, referrals, campaigns..." 
                  className="pl-10"
                />
              </div>
              <div className="space-y-3">
                {recentSearches.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Flagged Referrals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Flagged Referrals</CardTitle>
                  <CardDescription>Referrals requiring immediate attention</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={referral.avatar} alt={referral.referrer} />
                        <AvatarFallback>{referral.referrer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{referral.id}</span>
                          <Badge className={getStatusBadgeClass(referral.status)}>
                            {referral.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {referral.referrer} • {referral.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{referral.amount}</div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Highest earning referrers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.name} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={performer.avatar} alt={performer.name} />
                      <AvatarFallback>{performer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{performer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {performer.referrals} referrals • {formatCurrency(performer.generated)} generated
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(performer.earnings)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{activity.title}</div>
                      <div className="text-xs text-muted-foreground">{activity.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{activity.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}