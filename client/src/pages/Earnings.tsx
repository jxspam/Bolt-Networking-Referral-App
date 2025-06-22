import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar,
  Wallet,
  CreditCard,
  Target,
  Clock,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Banknote
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { earnings, payouts } from "../../../shared/schema";
import { useMemo } from "react";

type EarningWithCampaign = typeof earnings.$inferSelect & {
  campaigns: { category: string } | null;
};
type Payout = typeof payouts.$inferSelect;

function formatCurrency(value: number | string) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(numValue);
}

function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function Earnings() {
  const { data: earningsResult, isLoading: isLoadingEarnings } = useQuery<EarningWithCampaign[]>({
    queryKey: ["earnings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("earnings").select(`
        *,
        campaigns (
          category
        )
      `);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: payoutHistory = [], isLoading: isLoadingPayouts } = useQuery<Payout[]>({
    queryKey: ["payouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payouts").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const isLoading = isLoadingEarnings || isLoadingPayouts;

  const {
    availableBalance,
    pendingEarnings,
    totalEarned,
    thisMonthEarnings,
    monthlyChartData,
    earningsBySource,
  } = useMemo(() => {
    if (!earningsResult) {
      return {
        availableBalance: 0,
        pendingEarnings: 0,
        totalEarned: 0,
        thisMonthEarnings: 0,
        monthlyChartData: [],
        earningsBySource: [],
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let availableBalance = 0;
    let pendingEarnings = 0;
    let totalEarned = 0;
    let thisMonthEarnings = 0;

    const monthlyMap = new Map<string, { month: string; earnings: number; payouts: number; pending: number }>();
    const sourceMap = new Map<string, { source: string; amount: number }>();

    earningsResult.forEach((earning) => {
      const amount = parseFloat(earning.amount);
      totalEarned += amount;

      if (earning.status === 'pending') {
        pendingEarnings += amount;
      } else if (earning.status === 'paid') {
        availableBalance += amount;
      }

      if (earning.createdAt) {
        const createdAt = new Date(earning.createdAt);
        if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
          thisMonthEarnings += amount;
        }

        const month = createdAt.toLocaleString("default", { month: "short" });
        const year = createdAt.getFullYear();
        const monthKey = `${year}-${month}`;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { month, earnings: 0, payouts: 0, pending: 0 });
        }
        const monthData = monthlyMap.get(monthKey)!;
        monthData.earnings += amount;
        if (earning.status === 'pending') {
          monthData.pending += amount;
        }
      }

      const category = earning.campaigns?.category || "Other";
      if (!sourceMap.has(category)) {
        sourceMap.set(category, { source: category, amount: 0 });
      }
      sourceMap.get(category)!.amount += amount;
    });
    
    if (payoutHistory) {
        payoutHistory.forEach(payout => {
            if(payout.paidAt) {
                const paidAt = new Date(payout.paidAt);
                const month = paidAt.toLocaleString("default", { month: "short" });
                const year = paidAt.getFullYear();
                const monthKey = `${year}-${month}`;
                if (monthlyMap.has(monthKey)) {
                    monthlyMap.get(monthKey)!.payouts += parseFloat(payout.amount);
                }
            }
        });
    }

    const monthlyChartData = Array.from(monthlyMap.values()).sort((a, b) => new Date(`1 ${a.month} 2023`) - new Date(`1 ${b.month} 2023`));

    const totalSourceEarnings = Array.from(sourceMap.values()).reduce((sum, s) => sum + s.amount, 0);
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
    let colorIndex = 0;
    const earningsBySource = Array.from(sourceMap.values()).map(s => ({
      ...s,
      percentage: totalSourceEarnings > 0 ? (s.amount / totalSourceEarnings) * 100 : 0,
      color: colors[colorIndex++ % colors.length],
    }));

    return { availableBalance, pendingEarnings, totalEarned, thisMonthEarnings, monthlyChartData, earningsBySource };
  }, [earningsResult, payoutHistory]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and withdraw your referral earnings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="filter-button">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm" className="filter-button">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Enhanced Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label text-blue-700">Available Balance</div>
              <div className="metric-value text-blue-900">{formatCurrency(availableBalance)}</div>
              <div className="metric-change text-blue-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                Ready to withdraw
              </div>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl">
              <Wallet className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="metric-card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label text-yellow-700">Pending Earnings</div>
              <div className="metric-value text-yellow-900">{formatCurrency(pendingEarnings)}</div>
              <div className="metric-change text-yellow-600">
                <Clock className="w-4 h-4 mr-1" />
                Processing (7 days)
              </div>
            </div>
            <div className="p-3 bg-yellow-200 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="metric-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label text-green-700">This Month</div>
              <div className="metric-value text-green-900">{formatCurrency(thisMonthEarnings)}</div>
              <div className="metric-change positive text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +18% vs last month
              </div>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="metric-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label text-purple-700">Total Earned</div>
              <div className="metric-value text-purple-900">{formatCurrency(totalEarned)}</div>
              <div className="metric-change text-purple-600">
                <Target className="w-4 h-4 mr-1" />
                Lifetime earnings
              </div>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Funds and Payout Methods Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Banknote className="w-5 h-5 mr-2 text-blue-600" />
              Withdraw Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Amount to withdraw</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="input-enhanced pl-10"
                  defaultValue={availableBalance.toFixed(2)}
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Maximum available: {formatCurrency(availableBalance)}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Select payout method</label>
              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center p-4 border-2 border-blue-500 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">Stripe</span>
                  <span className="text-xs text-blue-600">Connected</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white text-sm font-bold">P</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">PayPal</span>
                  <span className="text-xs text-gray-500">Connected</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white text-sm font-bold">B</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Bank</span>
                  <span className="text-xs text-gray-500">Connect</span>
                </button>
              </div>
            </div>
            
            <Button className="w-full button-primary">
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw {formatCurrency(availableBalance)}
            </Button>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Fast Processing</p>
                  <p className="text-xs text-blue-700">Withdrawals are typically processed within 1-3 business days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Payout Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border-2 border-green-200 rounded-xl bg-green-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Stripe Account</p>
                  <p className="text-sm text-gray-600">Connected on May 15, 2023</p>
                  <p className="text-xs text-green-600 font-medium">✓ Verified & Active</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">Default</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">PayPal Account</p>
                  <p className="text-sm text-gray-600">alex@networkearnings.com</p>
                  <p className="text-xs text-blue-600 font-medium">✓ Connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Set Default</Button>
            </div>
            
            <Button variant="outline" className="w-full border-dashed border-2 border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Add New Payout Method
            </Button>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">Security & Compliance</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• All transactions are encrypted and secure</li>
                <li>• PCI DSS compliant payment processing</li>
                <li>• 24/7 fraud monitoring and protection</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Earnings Trend */}
        <Card className="lg:col-span-2 card-enhanced">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Earnings Trend</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Monthly earnings and payout history</p>
              </div>
              <Select defaultValue="6months">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 months</SelectItem>
                  <SelectItem value="6months">6 months</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                earnings: { label: "Earnings", color: "#3B82F6" },
                payouts: { label: "Payouts", color: "#10B981" },
                pending: { label: "Pending", color: "#F59E0B" },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="payouts" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#F59E0B", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Earnings by Source */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-xl">Earnings by Source</CardTitle>
            <p className="text-sm text-gray-600">Revenue breakdown by category</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsBySource.map((source, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">{source.source}</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(source.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${source.percentage}%`, 
                        backgroundColor: source.color 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">{source.percentage.toFixed(1)}% of total</span>
                    <span className="font-medium" style={{ color: source.color }}>
                      {source.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Payout History */}
      <Card className="card-enhanced">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Payout History</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Recent withdrawal transactions</p>
            </div>
            <Button variant="outline" size="sm" className="filter-button">
              View All Transactions
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="table-enhanced">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="table-cell font-semibold">Date</TableHead>
                  <TableHead className="table-cell font-semibold">Reference</TableHead>
                  <TableHead className="table-cell font-semibold">Method</TableHead>
                  <TableHead className="table-cell font-semibold">Amount</TableHead>
                  <TableHead className="table-cell font-semibold">Status</TableHead>
                  <TableHead className="table-cell font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutHistory.map((payout) => (
                  <TableRow key={payout.id} className="table-row">
                    <TableCell className="table-cell text-gray-600">
                      {formatDate(payout.paidAt)}
                    </TableCell>
                    <TableCell className="table-cell">
                      <span className="font-mono text-sm text-gray-900">{payout.transactionId}</span>
                    </TableCell>
                    <TableCell className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">{payout.payoutMethod?.charAt(0)}</span>
                        </div>
                        <span className="text-gray-900">{payout.payoutMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell className="table-cell">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(payout.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="table-cell">
                      <Badge className={`status-badge ${getStatusBadgeClass(payout.status)}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="table-cell">
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="card-enhanced bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Need help with your earnings?</h3>
                <p className="text-gray-600">Our support team is available 24/7 to assist you with any questions about payouts, earnings, or account issues.</p>
              </div>
            </div>
            <Button className="button-primary">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}