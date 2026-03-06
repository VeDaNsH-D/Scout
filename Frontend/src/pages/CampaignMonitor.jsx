import React, { useState, useEffect } from 'react';
import workflowsService from '../services/workflowsService';
import analyticsService from '../services/analyticsService';
import { mockCampaigns } from '../utils/mockData';

export default function CampaignMonitor() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      fetchAnalytics(selectedWorkflow._id);
    }
  }, [selectedWorkflow]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await workflowsService.getAll();
      const workflowList = Array.isArray(data) ? data : data?.workflows || [];
      setWorkflows(workflowList);
      if (workflowList.length > 0) {
        setSelectedWorkflow(workflowList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      // Fallback to mock data for demo
      setWorkflows(mockCampaigns.map(c => ({ ...c, _id: c.id })));
      setSelectedWorkflow(mockCampaigns[0]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (workflowId) => {
    try {
      const data = await analyticsService.getCampaignAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setAnalytics(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await workflowsService.update(id, { status: newStatus });
      setWorkflows(workflows.map(w => 
        (w._id || w.id) === id ? { ...w, status: newStatus } : w
      ));
      if (selectedWorkflow && (selectedWorkflow._id || selectedWorkflow.id) === id) {
        setSelectedWorkflow({ ...selectedWorkflow, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update workflow status');
    }
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    running: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const getMetrics = () => {
    if (analytics) {
      return {
        leads: analytics.totalLeads || 0,
        sent: analytics.emailsSent || 0,
        opened: analytics.replies || 0,
        rate: analytics.totalLeads > 0 
          ? `${((analytics.replies / analytics.totalLeads) * 100).toFixed(1)}%` 
          : '0%',
      };
    }
    // Fallback metrics for selected workflow
    return {
      leads: selectedWorkflow?.leads || 0,
      sent: selectedWorkflow?.sent || 0,
      opened: selectedWorkflow?.opened || 0,
      rate: selectedWorkflow?.rate || '0%',
    };
  };

  const metrics = selectedWorkflow ? getMetrics() : { leads: 0, sent: 0, opened: 0, rate: '0%' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Campaign Monitor</h1>
          <p className="text-text-secondary">Track and manage your outreach campaigns</p>
        </div>
        <button 
          onClick={() => window.location.href = '/workflows'}
          className="px-6 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition"
        >
          Create Campaign
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="lg:col-span-1 bg-bg-card border border-border-card rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">All Campaigns</h3>
            <button onClick={fetchWorkflows} className="text-accent hover:text-accent-hover text-xs">
              Refresh
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-4 text-center text-text-muted">Loading...</div>
            ) : workflows.length > 0 ? (
              workflows.map((workflow) => (
                <button
                  key={workflow._id || workflow.id}
                  onClick={() => setSelectedWorkflow(workflow)}
                  className={`w-full text-left p-4 border-b border-border-subtle transition ${
                    selectedWorkflow && (selectedWorkflow._id || selectedWorkflow.id) === (workflow._id || workflow.id)
                      ? 'bg-accent-soft border-l-4 border-l-accent'
                      : 'hover:bg-bg-card-hover'
                  }`}
                >
                  <p className="font-semibold text-text-primary text-sm">{workflow.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold border ${statusColors[workflow.status] || statusColors.draft}`}
                    >
                      {(workflow.status || 'draft').charAt(0).toUpperCase() + (workflow.status || 'draft').slice(1)}
                    </span>
                    <span className="text-text-muted text-xs">{workflow.nodes?.length || 0} nodes</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-text-muted">
                No campaigns found.{' '}
                <a href="/workflows" className="text-accent">Create one</a>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedWorkflow ? (
            <>
              {/* Overview Card */}
              <div className="bg-bg-card border border-border-card rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{selectedWorkflow.name}</h2>
                    <p className="text-text-secondary text-sm mt-1">
                      Created: {selectedWorkflow.createdAt 
                        ? new Date(selectedWorkflow.createdAt).toLocaleDateString() 
                        : selectedWorkflow.created || 'N/A'}
                    </p>
                  </div>
                  <select
                    value={selectedWorkflow.status || 'draft'}
                    onChange={(e) => handleStatusChange(selectedWorkflow._id || selectedWorkflow.id, e.target.value)}
                    className="px-3 py-1 bg-bg-card-hover border border-border-card rounded text-text-primary text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-bg-card-hover rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Total Leads</p>
                    <p className="text-2xl font-bold text-text-primary">{metrics.leads}</p>
                  </div>
                  <div className="p-3 bg-bg-card-hover rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Emails Sent</p>
                    <p className="text-2xl font-bold text-accent">{metrics.sent}</p>
                  </div>
                  <div className="p-3 bg-bg-card-hover rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Replies</p>
                    <p className="text-2xl font-bold text-green-400">{metrics.opened}</p>
                  </div>
                  <div className="p-3 bg-bg-card-hover rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Response Rate</p>
                    <p className="text-2xl font-bold text-blue-400">{metrics.rate}</p>
                  </div>
                </div>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-2 gap-4">
                {/* Email Delivery */}
                <div className="bg-bg-card border border-border-card rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-text-secondary mb-4">Email Delivery</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-text-muted mb-1">
                        <span>Sent</span>
                        <span>{metrics.leads > 0 ? ((metrics.sent / metrics.leads) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="w-full bg-border-subtle rounded-full h-2">
                        <div
                          className="bg-accent h-full rounded-full transition-all"
                          style={{ width: `${metrics.leads > 0 ? (metrics.sent / metrics.leads) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-text-muted mb-1">
                        <span>Replied</span>
                        <span>{metrics.sent > 0 ? ((metrics.opened / metrics.sent) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="w-full bg-border-subtle rounded-full h-2">
                        <div
                          className="bg-green-400 h-full rounded-full transition-all"
                          style={{ width: `${metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0}%` }}
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
                      Sent: {metrics.sent}
                    </div>
                    <div className="px-4 py-2 bg-bg-card-hover rounded text-xs text-text-secondary">
                      Replied: {metrics.opened}
                    </div>
                    <div className="px-8 py-2 bg-bg-card-hover rounded text-xs text-text-secondary">
                      Converted: {analytics?.conversions || Math.floor(metrics.opened * 0.3)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => window.location.href = `/workflows?id=${selectedWorkflow._id || selectedWorkflow.id}`}
                  className="flex-1 px-4 py-2 bg-bg-card-hover hover:bg-border-strong text-text-primary font-semibold rounded-lg transition border border-border-card"
                >
                  Edit Workflow
                </button>
                <button className="flex-1 px-4 py-2 bg-bg-card-hover hover:bg-border-strong text-text-primary font-semibold rounded-lg transition border border-border-card">
                  Download Report
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const newWorkflow = await workflowsService.create({
                        name: `${selectedWorkflow.name} (Copy)`,
                        nodes: selectedWorkflow.nodes,
                        edges: selectedWorkflow.edges,
                      });
                      fetchWorkflows();
                    } catch (err) {
                      setError('Failed to duplicate workflow');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition"
                >
                  Duplicate
                </button>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border-card rounded-xl p-12 text-center">
              <p className="text-text-muted">Select a campaign to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
