import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, AlertTriangle, Activity, DollarSign, Users, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const performanceData = [
    { month: 'Jan', referrals: 6200, payouts: 85000, conversions: 22.5 },
    { month: 'Feb', referrals: 6800, payouts: 92000, conversions: 24.2 },
    { month: 'Mar', referrals: 7200, payouts: 98000, conversions: 23.8 },
    { month: 'Apr', referrals: 7800, payouts: 105000, conversions: 25.1 },
    { month: 'May', referrals: 8200, payouts: 115000, conversions: 26.3 },
    { month: 'Jun', referrals: 8742, payouts: 127845, conversions: 24.7 }
  ];

  const conversionData = [
    { month: 'Jan', rate: 22.5 },
    { month: 'Feb', rate: 24.2 },
    { month: 'Mar', rate: 23.8 },
    { month: 'Apr', rate: 25.1 },
    { month: 'May', rate: 26.3 },
    { month: 'Jun', rate: 24.7 }
  ];

  const recentSearches = [
    { name: 'Sarah Johnson', id: 'REF-78945' },
    { name: 'Michael Chen', id: 'REF-65432' },
    { name: 'Priya Patel', id: 'REF-54321' }
  ];

  const flaggedReferrals = [
    { id: 'REF-78945', referrer: 'James Wilson', date: 'Oct 12, 2023', amount: 649.00, status: 'Fraud Alert' },
    { id: 'REF-65432', referrer: 'Lisa Rodriguez', date: 'Oct 15, 2023', amount: 275.90, status: 'Dispute' },
    { id: 'REF-52171', referrer: 'David Kim', date: 'Oct 8, 2023', amount: 1200.00, status: 'Fraud Alert' },
    { id: 'REF-45321', referrer: 'Sophia Martinez', date: 'Oct 5, 2023', amount: 325.75, status: 'Dispute' }
  ];

  const topReferrers = [
    { name: 'Thomas Anderson', referrals: 142, earnings: 3775 },
    { name: 'Lisa Wong', referrals: 98, earnings: 3262 },
    { name: 'Robert Johnson', referrals: 87, earnings: 2677 },
    { name: 'Maria Garcia', referrals: 76, earnings: 2295 }
  ];

  const recentActivity = [
    { type: 'user', message: 'New referrer joined the network', time: '2 minutes ago' },
    { type: 'payout', message: 'Payout processed for October earnings', time: '15 minutes ago' },
    { type: 'alert', message: 'Flagged for REF-78945', time: '1 hour ago' },
    { type: 'milestone', message: 'Campaign milestone reached', time: '2 hours ago' },
    { type: 'dispute', message: 'Dispute filed for referral REF-65432', time: '3 hours ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-blue-600" />;
      case 'payout': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'milestone': return <Target className="h-4 w-4 text-purple-600" />;
      case 'dispute': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="mt-1 text-gray-500">Monitor network performance and manage referrals</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">8,742</p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5%
              </div>
            </div>
            <div className="h-16 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.slice(-6)}>
                  <Line type="monotone" dataKey="referrals" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">24.7%</p>
              <div className="flex items-center text-sm text-red-600 mt-1">
                <TrendingDown className="h-4 w-4 mr-1" />
                -2.3%
              </div>
            </div>
            <div className="h-16 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData.slice(-6)}>
                  <Bar dataKey="rate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Payouts</p>
              <p className="text-2xl font-bold text-gray-900">$127,845</p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8.7%
              </div>
            </div>
            <div className="h-16 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.slice(-6)}>
                  <Line type="monotone" dataKey="payouts" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Lookup */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Lookup</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Email or Username
              </label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter email or username"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h4>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{search.name}</div>
                      <div className="text-sm text-gray-500">{search.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Advanced User Search
            </button>
          </div>
        </div>

        {/* Flagged Referrals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Flagged Referrals</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Disputes
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider border-b pb-2">
              <div>Referral ID</div>
              <div>Actions</div>
              <div>Referrer</div>
              <div>Date</div>
              <div>Amount</div>
              <div>Status</div>
            </div>
            {flaggedReferrals.slice(0, 4).map((referral, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 py-2 text-sm">
                <div className="font-medium text-gray-900">{referral.id}</div>
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div className="text-gray-900">{referral.referrer}</div>
                <div className="text-gray-500">{referral.date}</div>
                <div className="font-medium">${referral.amount}</div>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    referral.status === 'Fraud Alert' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {referral.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Referrers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Referrers</h3>
          <div className="space-y-4">
            {topReferrers.map((referrer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {referrer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{referrer.name}</div>
                    <div className="text-sm text-gray-500">{referrer.referrals} referrals • ${referrer.earnings} per month</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">${referrer.earnings.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Earnings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;