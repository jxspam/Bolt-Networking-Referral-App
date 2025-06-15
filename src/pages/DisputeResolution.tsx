import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Filter, AlertTriangle, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';

const DisputeResolution = () => {
  const [sortBy, setSortBy] = useState('date-newest');

  const pendingCases = [
    {
      id: 'DR-7829',
      date: 'Oct 12, 2023',
      business: 'TechSolutions Inc.',
      businessClaim: 'Client was already in our database before referral',
      referrer: 'Initial contact was made through my referral link',
      referrerResponse: 'Any evidence',
      status: 'pending'
    },
    {
      id: 'DR-7831',
      date: 'Oct 13, 2023',
      business: 'Global Marketing Partners',
      businessClaim: 'Referral code used after direct contact was established',
      referrer: 'Client confirmed they found us through my social media campaign',
      referrerResponse: 'Any evidence',
      status: 'pending'
    },
    {
      id: 'DR-7834',
      date: 'Oct 14, 2023',
      business: 'Nexus Healthcare',
      businessClaim: 'Referral was made after contract negotiations began',
      referrer: 'I introduced the client before any negotiations started',
      referrerResponse: 'Any evidence',
      status: 'pending'
    },
    {
      id: 'DR-7836',
      date: 'Oct 15, 2023',
      business: 'Evergreen Retail Solutions',
      businessClaim: 'Multiple referrers claiming the same lead',
      referrer: 'My referral link was used first and can be verified in system logs',
      referrerResponse: 'View evidence',
      status: 'pending'
    },
    {
      id: 'DR-7840',
      date: 'Oct 16, 2023',
      business: 'Quantum Financial Services',
      businessClaim: 'Referral disputed',
      referrer: 'Premium tier referral should apply based on client\'s contract value',
      referrerResponse: 'View evidence',
      status: 'pending'
    }
  ];

  const resolvedCases = [
    {
      id: 'DR-7820',
      date: 'Oct 10, 2023',
      business: 'Bright Ideas Co.',
      referrer: 'Sarah Johnson',
      decision: 'Approved',
      admin: 'Alex Morgan'
    },
    {
      id: 'DR-7822',
      date: 'Oct 11, 2023',
      business: 'Pinnacle Systems',
      referrer: 'Michael Chen',
      decision: 'Rejected',
      admin: 'Alex Morgan'
    },
    {
      id: 'DR-7825',
      date: 'Oct 12, 2023',
      business: 'Velocity Partners',
      referrer: 'Emma Rodriguez',
      decision: 'Escalated',
      admin: 'Taylor Wilson'
    }
  ];

  const getDecisionColor = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution</h1>
            <p className="mt-1 text-gray-500">Review and resolve cases requiring administrative attention</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <Link
            to="/admin"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Overview
          </Link>
        </div>
      </div>

      {/* Cases Requiring Attention */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Cases Requiring Attention</h2>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date-newest">Date (Newest)</option>
                <option value="date-oldest">Date (Oldest)</option>
                <option value="amount-high">Amount (High to Low)</option>
                <option value="amount-low">Amount (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Claim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrer Response
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingCases.map((disputeCase) => (
                <tr key={disputeCase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {disputeCase.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {disputeCase.date}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{disputeCase.business}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{disputeCase.businessClaim}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900 max-w-xs">{disputeCase.referrer}</div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-1">
                        <Eye className="h-3 w-3 mr-1" />
                        {disputeCase.referrerResponse}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select decision</option>
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                        <option value="escalate">Escalate</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recently Resolved Cases */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recently Resolved Cases</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resolvedCases.map((resolvedCase) => (
                <tr key={resolvedCase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {resolvedCase.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resolvedCase.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resolvedCase.business}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resolvedCase.referrer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDecisionColor(resolvedCase.decision)}`}>
                      {getDecisionIcon(resolvedCase.decision)}
                      <span className="ml-1">{resolvedCase.decision}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resolvedCase.admin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisputeResolution;