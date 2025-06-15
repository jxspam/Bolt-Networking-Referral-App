import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, TrendingUp, TrendingDown } from 'lucide-react';

const Campaigns = () => {
  const campaigns = [
    {
      id: 1,
      name: 'Summer Sale Referrals',
      reward: 25.00,
      budget: 5000,
      spent: 3750,
      leads: 124,
      conversions: 50,
      conversionRate: 40.3,
      trend: 'up',
      status: 'active'
    },
    {
      id: 2,
      name: 'Tech Product Launch',
      reward: 40.00,
      budget: 10000,
      spent: 6200,
      leads: 95,
      conversions: 38,
      conversionRate: 40.0,
      trend: 'up',
      status: 'active'
    },
    {
      id: 3,
      name: 'Education Program',
      reward: 30.00,
      budget: 15000,
      spent: 8100,
      leads: 230,
      conversions: 63,
      conversionRate: 27.4,
      trend: 'down',
      status: 'active'
    },
    {
      id: 4,
      name: 'Wellness Program',
      reward: 35.00,
      budget: 7500,
      spent: 2450,
      leads: 145,
      conversions: 70,
      conversionRate: 48.3,
      trend: 'up',
      status: 'active'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-1 text-gray-500">Manage your referral campaigns</p>
        </div>
        <Link
          to="/campaigns/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Campaign
        </Link>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-500">Active campaign</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {campaign.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Reward per conversion</span>
                <span className="text-sm font-medium text-gray-900">${campaign.reward.toFixed(2)}</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Budget used</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{campaign.leads}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    Leads
                    {campaign.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 ml-1 text-red-500" />
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{campaign.conversions}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    Conversions
                    {campaign.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 ml-1 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Conversion rate</span>
                  <span className="text-sm font-medium text-gray-900">{campaign.conversionRate}%</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Link
                  to="/leads"
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium text-center hover:bg-blue-700 transition-colors"
                >
                  View Leads
                </Link>
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Edit Campaign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;