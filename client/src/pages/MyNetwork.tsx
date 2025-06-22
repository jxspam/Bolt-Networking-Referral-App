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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Users, 
  TrendingUp, 
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";

const networkStatsTemplate = [
  {
    title: "Total Network Size",
    icon: Users
  },
  {
    title: "Active Referrers",
    icon: TrendingUp
  },
  {
    title: "This Month Earnings",
    icon: TrendingUp
  }
];

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function MyNetwork() {
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: payouts = [], isLoading: payoutsLoading } = useQuery<any[]>({
    queryKey: ["payouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payouts").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const referrers = users.filter(user => user.role === "referrer");

  const isLoading = usersLoading || leadsLoading || payoutsLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const activeReferrers = new Set(leads.map(lead => lead.referrerId));
  const now = new Date();
  const thisMonthEarnings = payouts
    .filter(payout => new Date(payout.paidAt).getMonth() === now.getMonth() && new Date(payout.paidAt).getFullYear() === now.getFullYear())
    .reduce((sum, payout) => sum + parseFloat(payout.amount), 0);

  const networkStats = [
    {
      title: "Total Network Size",
      value: referrers.length.toString(),
      change: "",
      changeType: "positive",
      icon: Users
    },
    {
      title: "Active Referrers",
      value: activeReferrers.size.toString(),
      change: "",
      changeType: "positive", 
      icon: TrendingUp
    },
    {
      title: "This Month Earnings",
      value: `$${thisMonthEarnings.toLocaleString()}`,
      change: "",
      changeType: "positive",
      icon: TrendingUp
    }
  ];

  const networkData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleString('default', { month: 'short' });
    const monthLeads = leads.filter(lead => lead.createdAt && new Date(lead.createdAt).getMonth() === d.getMonth() && new Date(lead.createdAt).getFullYear() === d.getFullYear());
    const monthEarnings = payouts.filter(payout => new Date(payout.paidAt).getMonth() === d.getMonth() && new Date(payout.paidAt).getFullYear() === d.getFullYear()).reduce((sum, p) => sum + parseFloat(p.amount), 0);
    return { month, referrals: monthLeads.length, earnings: monthEarnings };
  }).reverse();


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Network</h1>
          <p className="text-gray-600">Manage your referral network and track performance</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Referrer
          </Button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {networkStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && (
                      <p className={`text-sm flex items-center mt-1 ${
                        stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Network Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                referrals: {
                  label: "Referrals",
                  color: "#3B82F6",
                },
                earnings: {
                  label: "Earnings",
                  color: "#10B981",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="referrals" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Newsletter
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite New Referrer
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance Report
              </Button>
              <Link href="/campaigns">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Members */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Network Members</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search members..."
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Total Referrals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.tier === 'Gold' ? 'default' : 'secondary'}>{user.tier || 'Standard'}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at ? user.created_at.toString() : null)}</TableCell>
                  <TableCell>
                    <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline">
                      View Details
                    </Link>
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
