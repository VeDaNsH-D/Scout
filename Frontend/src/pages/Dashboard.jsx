import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Plus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import workflowsService from '../services/workflowsService';
import { mockDashboardData } from '../utils/mockData';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg shadow-[0_0_26px_rgba(255,122,24,0.14)]"
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-orange-500/20 blur-2xl" />
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">{metric.label}</p>
      <div className="mt-3 text-3xl font-semibold text-[#ffb66f]">{displayValue}</div>
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
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <Icon className="h-4 w-4 text-white/70" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="relative h-12 w-12 rounded-full p-[5px]" style={{ background: ring }}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#090909] text-[10px] font-semibold text-white/70">
            {pct}%
          </div>
        </div>
        <div className="text-xs text-white/50">System monitor</div>
      </div>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchDashboardData();
  }, []);

  const chartData = mockDashboardData.chartData;

  const metrics = useMemo(() => {
    if (!analytics) {
      return [
        { label: 'Total Leads', value: 2483, trend: '+12% today', trendUp: true },
        { label: 'Emails Sent', value: 1620, trend: '+8% today', trendUp: true },
        { label: 'Replies', value: 401, trend: '+5% today', trendUp: true },
        { label: 'Lead Score %', value: 64, suffix: '%', trend: '+2% today', trendUp: true },
        { label: 'Conversions', value: 93, trend: '-2% today', trendUp: false },
      ];
    }
    return [
      { label: 'Total Leads', value: analytics.totalLeads || 0, trend: '+12% today', trendUp: true },
      { label: 'Emails Sent', value: analytics.emailsSent || 0, trend: '+8% today', trendUp: true },
      { label: 'Replies', value: analytics.replies || 0, trend: '+5% today', trendUp: true },
      {
        label: 'Lead Score %',
        value: Math.round(analytics.averageLeadScorePct || 0),
        suffix: '%',
        trend: analytics.replies > 0 ? '+reply feedback applied' : 'No reply feedback yet',
        trendUp: analytics.replies > 0,
      },
      {
        label: 'Conversions',
        value: analytics.conversions || 0,
        trend: analytics.conversions > 0 ? '+3% today' : '-2% today',
        trendUp: analytics.conversions > 0,
      },
    ];
  }, [analytics]);

  const workflowStats = useMemo(() => {
    if (analytics?.workflowRuns) return analytics.workflowRuns;
    return workflows.reduce(
      (acc, wf) => {
        const key = wf.status || 'running';
        if (key in acc) acc[key] += 1;
        return acc;
      },
      { running: 0, completed: 0, failed: 0 },
    );
  }, [analytics, workflows]);

  const totalRuns = Math.max(
    workflowStats.running + workflowStats.completed + workflowStats.failed,
    1,
  );

  const statusItems = [
    { key: 'running', label: 'Running', icon: Play, color: '#22c55e' },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, color: '#4cc9f0' },
    { key: 'failed', label: 'Failed', icon: AlertTriangle, color: '#ef4444' },
  ];

  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:120px_120px]" />
      <div className="pointer-events-none absolute -left-28 top-10 -z-10 h-72 w-72 rounded-full bg-[#ff7a18]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-12 -z-10 h-72 w-72 rounded-full bg-[#4cc9f0]/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-white">AI Command Center</h1>
        <p className="mt-1 text-white/45">
          Welcome back{user?.name ? `, ${user.name}` : ''}. Live outreach intelligence is online.
        </p>
        <ExtensionImportBanner />
      </motion.div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricModule key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(255,122,24,0.12)]"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Campaign Activity Visualization</h2>
              <p className="mt-1 text-sm text-white/45">Daily engagement and lead activity trends</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65">
              <Activity className="h-3.5 w-3.5 text-[#ffb66f]" />
              Live feed
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadsBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ff7a18" />
                    <stop offset="100%" stopColor="#ffc371" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="leads" fill="url(#leadsBar)" radius={[8, 8, 0, 0]} animationDuration={1100} />
                <Line
                  type="monotone"
                  dataKey="engaged"
                  stroke="#4cc9f0"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4cc9f0' }}
                  activeDot={{ r: 5 }}
                  animationDuration={1200}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/45">Live Campaign Queue</p>
            {loading ? (
              <p className="text-sm text-white/40">Loading workflows...</p>
            ) : workflows.length > 0 ? (
              <div className="space-y-2">
                {workflows.slice(0, 4).map((workflow) => (
                  <div
                    key={workflow._id || workflow.id}
                    className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2"
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
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(76,201,240,0.08)]">
            <h3 className="mb-4 text-sm uppercase tracking-[0.2em] text-white/55">System Status</h3>
            <div className="space-y-3">
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
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl border border-orange-300/25 bg-gradient-to-br from-[#ff7a18] to-[#ffc371] p-5 text-[#221100] shadow-[0_0_28px_rgba(255,122,24,0.45)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3a1f08]/80">Quick Action</p>
            <h3 className="mt-2 text-xl font-semibold">Create Workflow</h3>
            <p className="mt-2 text-sm text-[#3a1f08]/80">
              Launch a new automation pipeline from the control panel.
            </p>
            <button
              onClick={() => navigate('/workflows')}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/35"
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
