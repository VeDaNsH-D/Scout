import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Mail, MessageSquare, Plus, Play, Users, UserPlus, Send, Reply, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import workflowsService from '../services/workflowsService';
import ExtensionImportBanner from '../components/ExtensionImportBanner';

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const numericTarget =
      typeof target === 'string' ? parseInt(target.replace(/[^0-9.-]/g, ''), 10) : target;
    if (Number.isNaN(numericTarget)) {
      setValue(0);
      return undefined;
    }

    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(numericTarget * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => frameRef.current && cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

function MetricModule({ metric, index }) {
  const count = useCountUp(metric.value);
  const suffix = metric.suffix || '';
  const displayValue = Number.isNaN(Number(metric.value)) ? metric.value : `${count}${suffix}`;
  const Icon = metric.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="relative overflow-hidden glass-panel glass-panel-hover rounded-2xl p-6"
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-orange-500/20 blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">{metric.label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${metric.badgeClass}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <div className="mt-3 text-[36px] font-bold text-[#ffb66f]">{displayValue}</div>
      <p className={`mt-2 text-xs font-medium ${metric.trendUp ? 'text-emerald-300' : 'text-red-300'}`}>
        {metric.trend}
      </p>
    </motion.div>
  );
}

function StatusRing({ label, value, total, color, icon: Icon, index }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const ring = `conic-gradient(${color} ${pct}%, rgba(255,255,255,0.08) ${pct}% 100%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 + index * 0.1 }}
      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
    >
      <div className="relative h-10 w-10 shrink-0 rounded-full p-[4px]" style={{ background: ring }}>
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#090909] text-[9px] font-semibold text-white/70">
          {pct}%
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/45">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
      <Icon className="h-3.5 w-3.5 shrink-0 text-white/30" />
    </motion.div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0b0bcc] px-3 py-2 text-xs backdrop-blur-lg">
      <p className="mb-1 text-white/70">{label}</p>
      <p className="text-[#ffb66f]">Leads: {payload[0]?.value}</p>
      <p className="text-[#4cc9f0]">Engaged: {payload[1]?.value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [analyticsData, workflowsData, chartRes] = await Promise.all([
          analyticsService.getCampaignAnalytics().catch(() => null),
          workflowsService.getAll().catch(() => []),
          analyticsService.getChartData().catch(() => []),
        ]);
        setAnalytics(analyticsData);
        setWorkflows(Array.isArray(workflowsData) ? workflowsData : workflowsData?.workflows || []);
        setChartData(Array.isArray(chartRes) ? chartRes : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const trendLabel = (trend) => {
    if (!trend) return { text: 'No change', up: true };
    const sign = trend.pct >= 0 ? '+' : '';
    return { text: `${sign}${trend.pct}% today`, up: trend.up };
  };

  const metrics = useMemo(() => {
    const metricMeta = {
      totalLeads: { icon: Users, badgeClass: 'border-cyan-300/30 bg-cyan-400/15 text-cyan-200' },
      emailsSent: { icon: Mail, badgeClass: 'border-amber-300/35 bg-amber-400/15 text-amber-200' },
      replies: { icon: MessageSquare, badgeClass: 'border-emerald-300/35 bg-emerald-400/15 text-emerald-200' },
      leadScore: { icon: Activity, badgeClass: 'border-violet-300/35 bg-violet-400/15 text-violet-200' },
    };

    if (!analytics) {
      return [
        { label: 'Total Leads', value: 0, trend: 'No data yet', trendUp: true, ...metricMeta.totalLeads },
        { label: 'Emails Sent', value: 0, trend: 'No data yet', trendUp: true, ...metricMeta.emailsSent },
        { label: 'Replies', value: 0, trend: 'No data yet', trendUp: true, ...metricMeta.replies },
        { label: 'Lead Score %', value: 0, suffix: '%', trend: 'No data yet', trendUp: true, ...metricMeta.leadScore },
      ];
    }

    const t = analytics.trends || {};
    const leadsTrend = trendLabel(t.leads);
    const emailsTrend = trendLabel(t.emails);
    const repliesTrend = trendLabel(t.replies);

    return [
      { label: 'Total Leads', value: analytics.totalLeads || 0, trend: leadsTrend.text, trendUp: leadsTrend.up, ...metricMeta.totalLeads },
      { label: 'Emails Sent', value: analytics.emailsSent || 0, trend: emailsTrend.text, trendUp: emailsTrend.up, ...metricMeta.emailsSent },
      { label: 'Replies', value: analytics.replies || 0, trend: repliesTrend.text, trendUp: repliesTrend.up, ...metricMeta.replies },
      {
        label: 'Lead Score %',
        value: Math.round(analytics.averageLeadScorePct || 0),
        suffix: '%',
        trend: analytics.replies > 0 ? 'Reply feedback applied' : 'No reply feedback yet',
        trendUp: analytics.replies > 0,
        ...metricMeta.leadScore,
      },
    ];
  }, [analytics]);

  const workflowStats = useMemo(() => {
    if (analytics?.workflowRuns) return analytics.workflowRuns;
    return { running: 0, completed: 0, failed: 0 };
  }, [analytics]);

  const totalRuns = Math.max(
    workflowStats.running + workflowStats.completed + workflowStats.failed,
    1,
  );

  const leadPipeline = useMemo(() => {
    if (analytics?.leadPipeline) return analytics.leadPipeline;
    return { new: 0, contacted: 0, replied: 0, converted: 0 };
  }, [analytics]);

  const totalPipelineLeads = Math.max(
    leadPipeline.new + leadPipeline.contacted + leadPipeline.replied + leadPipeline.converted,
    1,
  );

  const pipelineItems = [
    { key: 'new', label: 'New', icon: UserPlus, color: '#a78bfa' },
    { key: 'contacted', label: 'Contacted', icon: Send, color: '#fbbf24' },
    { key: 'replied', label: 'Replied', icon: Reply, color: '#34d399' },
    { key: 'converted', label: 'Converted', icon: TrendingUp, color: '#4cc9f0' },
  ];

  const statusItems = [
    { key: 'running', label: 'Running', icon: Play, color: '#22c55e' },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, color: '#4cc9f0' },
    { key: 'failed', label: 'Failed', icon: AlertTriangle, color: '#ef4444' },
  ];
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="relative space-y-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:120px_120px]" />
      <div className="pointer-events-none absolute -left-28 top-10 -z-10 h-72 w-72 rounded-full bg-[#ff7a18]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-12 -z-10 h-72 w-72 rounded-full bg-[#4cc9f0]/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-3xl p-6"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Command Deck
          </span>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </span>
            <span>System Live</span>
            <span className="text-white/35">•</span>
            <span>{todayLabel}</span>
          </div>
        </div>
        <h1 className="text-[34px] font-semibold tracking-tight text-white">AI Command Center</h1>
        <p className="mt-2 text-white/50">
          Welcome back{user?.name ? `, ${user.name}` : ''}. Live outreach intelligence is online.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {metrics.slice(0, 3).map((metric) => (
            <div
              key={`headline-${metric.label}`}
              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/75"
            >
              <span className="text-white/50">{metric.label}:</span>{' '}
              <span className="font-semibold text-white">{metric.value}{metric.suffix || ''}</span>
            </div>
          ))}
        </div>
        <ExtensionImportBanner />
      </motion.div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricModule key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-8 glass-panel glass-panel-hover rounded-3xl p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-white">Campaign Activity Visualization</h2>
              <p className="mt-1 text-sm text-white/45">Daily engagement and lead activity trends</p>
            </div>
            <div className="hover-lift inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65">
              <Activity className="h-3.5 w-3.5 text-[#ffb66f]" />
              Live feed
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#ffb66f"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#ffb66f' }}
                  activeDot={{ r: 5 }}
                  animationDuration={1100}
                />
                <Line
                  type="monotone"
                  dataKey="engaged"
                  stroke="#4cc9f0"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4cc9f0' }}
                  activeDot={{ r: 5 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 glass-panel glass-panel-hover rounded-2xl p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/45">Live Campaign Queue</p>
            {loading ? (
              <p className="text-sm text-white/40">Loading workflows...</p>
            ) : workflows.length > 0 ? (
              <div className="space-y-2">
                {workflows.slice(0, 4).map((workflow) => (
                  <div
                    key={workflow._id || workflow.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.34)]"
                  >
                    <div>
                      <p className="text-sm text-white/90">{workflow.name}</p>
                      <p className="text-xs text-white/35">{workflow.nodes?.length || 0} nodes</p>
                    </div>
                    <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-2 py-1 text-[11px] uppercase tracking-wide text-orange-300">
                      {workflow.status || 'draft'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No workflows yet.</p>
            )}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="space-y-5 xl:col-span-4"
        >
          <div className="glass-panel glass-panel-hover rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-white">Response Rate</h3>
              <Zap className="h-4 w-4 text-[#ffb66f]" />
            </div>
            {(() => {
              const rate = analytics?.responseRate || 0;
              const rateRing = `conic-gradient(#ffb66f ${rate}%, rgba(255,255,255,0.08) ${rate}% 100%)`;
              return (
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded-full p-[5px]" style={{ background: rateRing }}>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#090909] text-sm font-bold text-[#ffb66f]">
                      {rate}%
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">of emails got replies</p>
                    <p className="mt-1 text-xs text-white/40">{analytics?.emailsSent || 0} sent &middot; {analytics?.replies || 0} replied</p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="glass-panel glass-panel-hover rounded-3xl p-6">
            <h3 className="mb-3 text-[18px] font-semibold text-white">Lead Pipeline</h3>
            <div className="space-y-2">
              {pipelineItems.map((item, index) => (
                <StatusRing
                  key={item.key}
                  label={item.label}
                  value={leadPipeline[item.key]}
                  total={totalPipelineLeads}
                  color={item.color}
                  icon={item.icon}
                  index={index}
                />
              ))}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-3xl p-6">
            <h3 className="mb-3 text-[18px] font-semibold text-white">Workflow Runs</h3>
            <div className="space-y-2">
              {statusItems.map((item, index) => (
                <StatusRing
                  key={item.key}
                  label={item.label}
                  value={workflowStats[item.key]}
                  total={totalRuns}
                  color={item.color}
                  icon={item.icon}
                  index={index}
                />
              ))}
            </div>
          </div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="glass-panel rounded-3xl p-6 text-white"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Quick Action</p>
            <h3 className="mt-2 text-[18px] font-semibold">Create Workflow</h3>
            <p className="mt-2 text-sm text-white/65">
              Launch a new automation pipeline from the control panel.
            </p>
            <button
              onClick={() => navigate('/workflows')}
              className="hover-lift mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/[0.14]"
            >
              <Plus className="h-4 w-4" />
              Get Started
            </button>
          </motion.div>
        </motion.aside>
      </section>
    </div>
  );
}
