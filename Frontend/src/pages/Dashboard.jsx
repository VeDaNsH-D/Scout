import React from 'react';
import { mockDashboardData } from '../utils/mockData';

const MetricCard = ({ metric }) => (
  <div className="bg-bg-card border border-border-card hover:border-border-strong hover:bg-bg-card-hover rounded-xl p-6 transition-all duration-300">
    <p className="text-text-secondary text-sm mb-2">{metric.label}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-bold text-text-primary">{metric.value}</h3>
      <div className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {metric.change}
      </div>
    </div>
  </div>
);

const CampaignRow = ({ campaign }) => {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border-subtle hover:bg-bg-card/50 transition">
      <div className="flex-1">
        <h4 className="font-semibold text-text-primary">{campaign.name}</h4>
        <p className="text-text-muted text-sm">{campaign.leads} leads</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[campaign.status]}`}>
        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
      </div>
      <div className="w-24 text-right">
        <p className="text-text-primary font-medium">{campaign.engaged}</p>
        <p className="text-text-muted text-xs">{campaign.rate} engaged</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const data = mockDashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back! Here's your campaign overview.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Chart */}
        <div className="lg:col-span-2 bg-bg-card border border-border-card rounded-xl p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6">Activity This Week</h2>
          <div className="space-y-4">
            {data.chartData.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary text-sm">{item.day}</span>
                  <span className="text-text-muted text-xs">{item.leads} leads, {item.engaged} engaged</span>
                </div>
                <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-accent to-accent-hover h-full rounded-full"
                    style={{ width: `${(item.leads / 52) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-bg-card border border-border-card rounded-xl p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="p-3 bg-bg-card-hover rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Total Contacts</p>
              <p className="text-2xl font-bold text-accent">3,124</p>
            </div>
            <div className="p-3 bg-bg-card-hover rounded-lg">
              <p className="text-text-secondary text-sm mb-1">This Month</p>
              <p className="text-2xl font-bold text-text-primary">847</p>
            </div>
            <div className="p-3 bg-bg-card-hover rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-400">12.3%</p>
            </div>
            <button className="w-full mt-2 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition">
              Create Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-lg font-bold text-text-primary">Recent Campaigns</h2>
        </div>
        <div>
          {data.recentCampaigns.map((campaign) => (
            <CampaignRow key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );
}
