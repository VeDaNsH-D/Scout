import React, { useState } from 'react';
import { mockCampaigns } from '../utils/mockData';

export default function CampaignMonitor() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]);

  const handleStatusChange = (id, newStatus) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const getChartData = (campaign) => {
    const openRate = (campaign.opened / campaign.sent) * 100;
    const sentRate = (campaign.sent / campaign.leads) * 100;
    return { openRate: openRate.toFixed(1), sentRate: sentRate.toFixed(1) };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Campaign Monitor</h1>
          <p className="text-text-secondary">Track and manage your outreach campaigns</p>
        </div>
        <button className="px-6 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition">
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign List */}
        <div className="lg:col-span-1 bg-bg-card border border-border-card rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border-subtle">
            <h3 className="font-semibold text-text-primary">All Campaigns</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                className={`w-full text-left p-4 border-b border-border-subtle transition ${
                  selectedCampaign?.id === campaign.id
                    ? 'bg-accent-soft border-l-4 border-l-accent'
                    : 'hover:bg-bg-card-hover'
                }`}
              >
                <p className="font-semibold text-text-primary text-sm">{campaign.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold border ${statusColors[campaign.status]}`}
                  >
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  <span className="text-text-muted text-xs">{campaign.leads} leads</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCampaign && (
            <>
              {/* Overview Card */}
              <div className="bg-bg-card border border-border-card rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{selectedCampaign.name}</h2>
                    <p className="text-text-secondary text-sm mt-1">Created on {selectedCampaign.created}</p>
                  </div>
                  <select
                    value={selectedCampaign.status}
                    onChange={(e) => handleStatusChange(selectedCampaign.id, e.target.value)}
                    className="px-3 py-1 bg-bg-card-hover border border-border-card rounded text-text-primary text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-bg-card-hover rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Total Leads</p>
                    <p className="text-2xl font-bold text-text-primary">{selectedCampaign.leads}</p>
                  </div>
                  <div className="p-3 bg-bg-card-hover rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Emails Sent</p>
                    <p className="text-2xl font-bold text-accent">{selectedCampaign.sent}</p>
                  </div>
                  <div className="p-3 bg-bg-card-hover rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Opened</p>
                    <p className="text-2xl font-bold text-green-400">{selectedCampaign.opened}</p>
                  </div>
                  <div className="p-3 bg-bg-card-hover rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Open Rate</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedCampaign.rate}</p>
                  </div>
                </div>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-2 gap-4">
                {/* Sent vs Opened */}
                <div className="bg-bg-card border border-border-card rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-text-secondary mb-4">Email Delivery</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-text-muted mb-1">
                        <span>Sent</span>
                        <span>{getChartData(selectedCampaign).sentRate}%</span>
                      </div>
                      <div className="w-full bg-border-subtle rounded-full h-2">
                        <div
                          className="bg-accent h-full rounded-full"
                          style={{ width: `${getChartData(selectedCampaign).sentRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-text-muted mb-1">
                        <span>Opened</span>
                        <span>{getChartData(selectedCampaign).openRate}%</span>
                      </div>
                      <div className="w-full bg-border-subtle rounded-full h-2">
                        <div
                          className="bg-green-400 h-full rounded-full"
                          style={{ width: `${getChartData(selectedCampaign).openRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funnel */}
                <div className="bg-bg-card border border-border-card rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-text-secondary mb-4">Conversion Funnel</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-bg-card-hover rounded text-xs text-text-secondary">
                      📧 Sent: {selectedCampaign.sent}
                    </div>
                    <div className="px-4 py-2 bg-bg-card-hover rounded text-xs text-text-secondary">
                      👁 Opened: {selectedCampaign.opened}
                    </div>
                    <div className="px-8 py-2 bg-bg-card-hover rounded text-xs text-text-secondary">
                      ✅ Clicked: {Math.floor(selectedCampaign.opened * 0.4)}
                    </div>
                    <div className="px-12 py-2 bg-bg-card-hover rounded text-xs text-text-secondary">
                      🤝 Replied: {Math.floor(selectedCampaign.opened * 0.15)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-bg-card-hover hover:bg-border-strong text-text-primary font-semibold rounded-lg transition border border-border-card">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-bg-card-hover hover:bg-border-strong text-text-primary font-semibold rounded-lg transition border border-border-card">
                  Download Report
                </button>
                <button className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition">
                  Duplicate
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
