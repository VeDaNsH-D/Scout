import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import workflowsService from '../services/workflowsService';
import { mockDashboardData } from '../utils/mockData';
import ExtensionImportBanner from '../components/ExtensionImportBanner';

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const num = typeof target === 'string' ? parseInt(target.replace(/[^0-9.-]/g, ''), 10) : target;
    if (isNaN(num) || num === 0) { setValue(0); return; }

    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * num));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

/* ─── Animated progress bar ─── */
function AnimatedBar({ percent, delay = 0 }) {
  return (
    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #ff7a18, #ffc371)' }}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

/* ─── Stat counter display ─── */
function AnimatedStat({ value, suffix = '' }) {
  const numericTarget = typeof value === 'string' ? parseInt(value.replace(/[^0-9.-]/g, ''), 10) : value;
  const animated = useCountUp(numericTarget);
  const isNumeric = !isNaN(numericTarget) && numericTarget !== 0;

  return (
    <motion.span
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-3xl font-bold text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.3)]"
    >
      {isNumeric ? animated.toLocaleString() + suffix : value}
    </motion.span>
  );
}

/* ─── Metric Card ─── */
const MetricCard = ({ metric, loading, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="bg-white/[0.04] backdrop-blur-lg border border-white/[0.08] rounded-2xl p-6
               shadow-[0_0_30px_rgba(255,120,0,0.08)] hover:shadow-[0_0_40px_rgba(255,120,0,0.18)]
               hover:scale-[1.02] hover:border-white/[0.15] transition-all duration-300 relative overflow-hidden group"
  >
    {/* Subtle corner glow */}
    <div className="absolute -top-8 -right-8 w-24 h-24 bg-orange-500/[0.06] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <p className="text-white/50 text-sm mb-3 tracking-wide uppercase text-[11px] font-medium">{metric.label}</p>
    <div className="flex items-end justify-between">
      {loading ? (
        <div className="h-9 w-20 bg-white/[0.06] animate-pulse rounded-lg" />
      ) : (
        <AnimatedStat value={metric.value} />
      )}
      {metric.change && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full
          ${metric.trend === 'up'
            ? 'text-emerald-400 bg-emerald-500/15'
            : 'text-red-400 bg-red-500/15'
          }`}>
          {metric.change}
        </span>
      )}
    </div>
  </motion.div>
);

/* ─── Workflow status icons ─── */
const statusConfig = {
  running: {
    color: 'text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(0,255,120,0.3)]',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  completed: {
    color: 'text-blue-400',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  failed: {
    color: 'text-red-400',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

/* ─── Workflow Row ─── */
const WorkflowRow = ({ workflow, index }) => {
  const rowStatusColors = {
    running: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_10px_rgba(0,255,120,0.15)]',
    completed: 'text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
    failed: 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
    draft: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between p-4 border-b border-white/[0.04] hover:bg-white/[0.03] transition-all duration-200"
    >
      <div className="flex-1">
        <h4 className="font-medium text-white/90">{workflow.name}</h4>
        <p className="text-white/30 text-sm">{workflow.nodes?.length || 0} nodes</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${rowStatusColors[workflow.status] || rowStatusColors.draft}`}>
        {(workflow.status || 'draft').charAt(0).toUpperCase() + (workflow.status || 'draft').slice(1)}
      </div>
    </motion.div>
  );
};

/* ─── Main Dashboard ─── */
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

  const metrics = analytics
    ? [
      { label: 'Total Leads', value: analytics.totalLeads?.toLocaleString() || '0' },
      { label: 'Emails Sent', value: analytics.emailsSent?.toLocaleString() || '0' },
      { label: 'Replies', value: analytics.replies?.toLocaleString() || '0' },
      { label: 'Conversions', value: analytics.conversions?.toLocaleString() || '0' },
    ]
    : mockDashboardData.metrics;

  const workflowStats = analytics?.workflowRuns || { running: 0, completed: 0, failed: 0 };
  const maxLeads = Math.max(...mockDashboardData.chartData.map((d) => d.leads), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Dashboard</h1>
        <p className="text-white/40">
          Welcome back{user?.name ? `, ${user.name}` : ''}. Here's your command center.
        </p>
        <ExtensionImportBanner />
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm backdrop-blur-lg"
        >
          {error}
          <button onClick={fetchDashboardData} className="ml-2 underline hover:text-red-200">
            Retry
          </button>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} loading={loading} index={idx} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 bg-white/[0.04] backdrop-blur-lg border border-white/[0.08] rounded-2xl p-6
                     shadow-[0_0_30px_rgba(255,120,0,0.08)] relative overflow-hidden"
        >
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-orange-500/[0.04] rounded-full blur-3xl" />

          <h2 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            Activity This Week
          </h2>
          <div className="space-y-5">
            {mockDashboardData.chartData.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/50 text-sm font-medium">{item.day}</span>
                  <span className="text-white/25 text-xs">{item.leads} leads &middot; {item.engaged} engaged</span>
                </div>
                <AnimatedBar percent={(item.leads / maxLeads) * 100} delay={0.3 + idx * 0.08} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Workflow Status Panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/[0.04] backdrop-blur-lg border border-white/[0.08] rounded-2xl p-6
                     shadow-[0_0_30px_rgba(255,120,0,0.08)] relative overflow-hidden"
        >
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/[0.04] rounded-full blur-3xl" />

          <h2 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,200,255,0.6)]" />
            Workflow Status
          </h2>
          <div className="space-y-3">
            {Object.entries(statusConfig).map(([key, config], idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                className={`p-4 rounded-xl ${config.bg} border ${config.border} ${config.glow} transition-all duration-300`}
              >
                <div className="flex items-center gap-3">
                  <span className={config.color}>{config.icon}</span>
                  <div className="flex-1">
                    <p className="text-white/40 text-xs uppercase tracking-wider font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                    <p className={`text-2xl font-bold ${config.color}`}>{workflowStats[key]}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.href = '/workflows'}
            className="w-full mt-5 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-400 text-black font-semibold rounded-xl
                       shadow-[0_0_20px_rgba(255,140,0,0.4)] hover:shadow-[0_0_30px_rgba(255,140,0,0.5)]
                       transition-shadow duration-300"
          >
            Create Workflow
          </motion.button>
        </motion.div>
      </div>

      {/* Recent Workflows */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white/[0.04] backdrop-blur-lg border border-white/[0.08] rounded-2xl overflow-hidden
                   shadow-[0_0_30px_rgba(255,120,0,0.08)]"
      >
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            Recent Workflows
          </h2>
          <button
            onClick={fetchDashboardData}
            className="text-orange-400/80 hover:text-orange-400 text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
        <div>
          {loading ? (
            <div className="p-8 text-center text-white/30">
              <div className="inline-block w-5 h-5 border-2 border-white/20 border-t-orange-400 rounded-full animate-spin" />
              <p className="mt-3 text-sm">Loading workflows...</p>
            </div>
          ) : workflows.length > 0 ? (
            workflows.slice(0, 5).map((workflow, idx) => (
              <WorkflowRow key={workflow._id || workflow.id} workflow={workflow} index={idx} />
            ))
          ) : (
            <div className="p-8 text-center text-white/30">
              No workflows yet.{' '}
              <a href="/workflows" className="text-orange-400 hover:text-orange-300 transition-colors">
                Create your first workflow
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
