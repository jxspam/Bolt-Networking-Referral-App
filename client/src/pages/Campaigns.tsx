import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Download, Filter, Tag, Laptop, GraduationCap, Heart, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Campaign } from "../../../shared/schema";

const campaignIcons: { [key: string]: any } = {
  "Summer Sale": Tag,
  "Tech Product": Laptop,
  "Education": GraduationCap,
  "Wellness": Heart,
};

const campaignColors: { [key: string]: string } = {
  "Summer Sale": "blue",
  "Tech Product": "purple",
  "Education": "green",
  "Wellness": "teal",
};

// Chart data will be fetched from Supabase

function formatCurrency(value: string | number) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(numValue);
}

function getCampaignIcon(name: string) {
  const key = Object.keys(campaignIcons).find(k => name.includes(k));
  return key ? campaignIcons[key] : Tag;
}

function getCampaignColor(name: string) {
  const key = Object.keys(campaignColors).find(k => name.includes(k));
  return key ? campaignColors[key] : "blue";
}

export default function Campaigns() {
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({ 
    queryKey: ["campaigns"], 
    queryFn: async () => {
      const { data, error } = await supabase.from('campaigns').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Fetch chart data
  const { data: chartData = [], isLoading: chartLoading } = useQuery<Array<{
    week: string;
    leads: number;
    conversions: number;
    budget: number;
  }>>({
    queryKey: ["campaign-chart-data"], 
    queryFn: async () => {
      const { data: campaignData, error } = await supabase
        .from('campaigns')
        .select('*');
        
      if (error) throw new Error(error.message);
      
      // Since we don't have weekly data, we'll simulate weekly data
      // based on the campaign's overall stats and budget
      return (campaignData || []).slice(0, 1).flatMap(campaign => {
        const totalLeads = campaign.leads || 0;
        const totalConversions = campaign.conversions || 0;
        const totalBudget = parseFloat(campaign.max_budget) || 2000;
        const budgetUsed = parseFloat(campaign.budget_used) || 0;
        
        // Create 4 weeks of data with a progressive pattern
        return [
          {
            week: "Week 1",
            leads: Math.round(totalLeads * 0.2),
            conversions: Math.round(totalConversions * 0.15),
            budget: Math.round(budgetUsed * 0.2)
          },
          {
            week: "Week 2",
            leads: Math.round(totalLeads * 0.25),
            conversions: Math.round(totalConversions * 0.25),
            budget: Math.round(budgetUsed * 0.25)
          },
          {
            week: "Week 3",
            leads: Math.round(totalLeads * 0.3),
            conversions: Math.round(totalConversions * 0.3),
            budget: Math.round(budgetUsed * 0.3)
          },
          {
            week: "Week 4",
            leads: Math.round(totalLeads * 0.25),
            conversions: Math.round(totalConversions * 0.3),
            budget: Math.round(budgetUsed * 0.25)
          }
        ];
      });
    }
  });

  if (isLoading || chartLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Referral Campaigns</h1>
        </div>
        
        <div className="flex space-x-3">
          <Link href="/create-offer">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create New Offer
            </Button>
          </Link>
        </div>
      </div>

      {/* Campaign Performance */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CardTitle>Campaign Performance</CardTitle>
              <span className="text-sm text-gray-600">Last 30 days</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Information</TableHead>
                <TableHead>Reward per Conversion</TableHead>
                <TableHead>Budget Left</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const Icon = getCampaignIcon(campaign.name);
                const color = getCampaignColor(campaign.name);
                const budgetPercentage = (parseFloat(campaign.budgetUsed || '0') / parseFloat(campaign.maxBudget)) * 100;
                
                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${color}-500`} />
                        </div>
                        <div>
                          <div className="font-semibold">{campaign.name}</div>
                          <div className="text-sm text-gray-600">Active until {new Date(campaign.endDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{formatCurrency(campaign.rewardPerConversion)}</div>
                      <div className="text-sm text-gray-600">Per qualified lead</div>
                    </TableCell>
                    <TableCell>
                      <Progress value={budgetPercentage} className="w-full mb-1" />
                      <div className="text-sm text-gray-600">
                        {formatCurrency(campaign.budgetUsed || '0')} / {formatCurrency(campaign.maxBudget)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{campaign.leads}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{campaign.conversions}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Leads
                        </Button>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                leads: {
                  label: "Leads",
                  color: "#3B82F6",
                },
                conversions: {
                  label: "Conversions",
                  color: "#10B981",
                },
                budget: {
                  label: "Budget Used",
                  color: "#6B7280",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="rgba(59, 130, 246, 0.1)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    fill="rgba(16, 185, 129, 0.1)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Leads</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Conversions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Budget Used</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.slice(0, 4).map((campaign, index) => {
                const Icon = getCampaignIcon(campaign.name);
                const color = getCampaignColor(campaign.name);                const leads = campaign.leads || 0;
                const conversions = campaign.conversions || 0;
                const conversionRate = leads > 0 ? (conversions / leads) * 100 : 0;
                const earnings = conversions * parseFloat(campaign.rewardPerConversion);

                return (
                  <div key={index} className={`flex items-center justify-between p-3 bg-${color}-50 rounded-lg`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-500`} />
                      </div>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-600">{conversionRate.toFixed(1)}% conversion rate</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">{formatCurrency(earnings)}</div>
                      <div className="text-sm text-gray-600">{campaign.conversions} conversions</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              View All Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
