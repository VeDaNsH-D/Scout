import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import workflowsService from '../services/workflowsService';
import { mockDashboardData } from '../utils/mockData';

const MetricCard = ({ metric, loading }) => (
  <div className="bg-bg-card border border-border-card hover:border-border-strong hover:bg-bg-card-hover rounded-xl p-6 transition-all duration-300">
    <p className="text-text-secondary text-sm mb-2">{metric.label}</p>
    <div className="flex items-end justify-between">
      {loading ? (
        <div className="h-9 w-20 bg-bg-card-hover animate-pulse rounded" />
      ) : (
        <h3 className="text-3xl font-bold text-text-primary">{metric.value}</h3>
      )}
      {metric.change && (
        <div className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {metric.change}
        </div>
      )}
    </div>
  </div>
);

const WorkflowRow = ({ workflow }) => {
  const statusColors = {
    running: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border-subtle hover:bg-bg-card/50 transition">
      <div className="flex-1">
        <h4 className="font-semibold text-text-primary">{workflow.name}</h4>
        <p className="text-text-muted text-sm">
          {workflow.nodes?.length || 0} nodes
        </p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[workflow.status] || statusColors.draft}`}>
        {(workflow.status || 'draft').charAt(0).toUpperCase() + (workflow.status || 'draft').slice(1)}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [analyticsData, workflowsData] = await Promise.all([
        analyticsService.getCampaignAnalytics().catch(() => null),
        workflowsService.getAll().catch(() => []),
      ]);

      setAnalytics(analyticsData);
      setWorkflows(Array.isArray(workflowsData) ? workflowsData : workflowsData?.workflows || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Build metrics from analytics data or fallback to mock
  const metrics = analytics
    ? [
        { label: 'Total Leads', value: analytics.totalLeads?.toLocaleString() || '0' },
        { label: 'Emails Sent', value: analytics.emailsSent?.toLocaleString() || '0' },
        { label: 'Replies', value: analytics.replies?.toLocaleString() || '0' },
        { label: 'Conversions', value: analytics.conversions?.toLocaleString() || '0' },
      ]
    : mockDashboardData.metrics;

  const workflowStats = analytics?.workflowRuns || { running: 0, completed: 0, failed: 0 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">
          Welcome back{user?.name ? `, ${user.name}` : ''}! Here's your campaign overview.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
          <button onClick={fetchDashboardData} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} loading={loading} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart or Mock */}
        <div className="lg:col-span-2 bg-bg-card border border-border-card rounded-xl p-6">
          <h2 className="text-lg font-bold text-text-primary mb-6">Activity This Week</h2>
          <div className="space-y-4">
            {mockDashboardData.chartData.map((item, idx) => (
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
          <h2 className="text-lg font-bold text-text-primary mb-6">Workflow Status</h2>
          <div className="space-y-4">
            <div className="p-3 bg-bg-card-hover rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Running</p>
              <p className="text-2xl font-bold text-green-400">{workflowStats.running}</p>
            </div>
            <div className="p-3 bg-bg-card-hover rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-blue-400">{workflowStats.completed}</p>
            </div>
            <div className="p-3 bg-bg-card-hover rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{workflowStats.failed}</p>
            </div>
            <button
              onClick={() => window.location.href = '/workflows'}
              className="w-full mt-2 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition"
            >
              Create Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Recent Workflows */}
      <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Recent Workflows</h2>
          <button onClick={fetchDashboardData} className="text-accent hover:text-accent-hover text-sm font-semibold">
            Refresh
          </button>
        </div>
        <div>
          {loading ? (
            <div className="p-6 text-center text-text-muted">Loading workflows...</div>
          ) : workflows.length > 0 ? (
            workflows.slice(0, 5).map((workflow) => (
              <WorkflowRow key={workflow._id || workflow.id} workflow={workflow} />
            ))
          ) : (
            <div className="p-6 text-center text-text-muted">
              No workflows yet.{' '}
              <a href="/workflows" className="text-accent hover:text-accent-hover">
                Create your first workflow
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
