import React, { useState, useEffect } from 'react';
import analyzeService from '../services/analyzeService';
import leadsService from '../services/leadsService';

// Lead Score Card Component
const LeadScoreCard = ({ score, loading }) => {
  const percentage = Math.round((score || 0) * 100);
  
  const getScoreColor = () => {
    if (percentage >= 70) return 'text-green-400';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = () => {
    if (percentage >= 70) return 'High Priority';
    if (percentage >= 40) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <div className="bg-bg-card border border-border-card rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">Lead Score</h3>
      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor()}`}>
            {percentage}%
          </div>
          <div className="text-text-secondary mt-2">{getScoreLabel()}</div>
          <div className="mt-4 w-full bg-border-subtle rounded-full h-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Insights Panel Component
const InsightsPanel = ({ insights, loading }) => {
  return (
    <div className="bg-bg-card border border-border-card rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">AI Insights</h3>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-bg-card-hover animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {(insights || []).map((insight, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="text-text-secondary text-sm">{insight}</span>
            </li>
          ))}
          {(!insights || insights.length === 0) && (
            <p className="text-text-muted text-sm">No insights available yet.</p>
          )}
        </ul>
      )}
    </div>
  );
};

// Best Send Time Component
const BestSendTime = ({ day, hour, loading }) => {
  const formatHour = (h) => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    if (h < 12) return `${h} AM`;
    return `${h - 12} PM`;
  };

  return (
    <div className="bg-bg-card border border-border-card rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">Best Send Time</h3>
      {loading ? (
        <div className="h-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">{day || 'Tuesday'}</div>
            <div className="text-text-muted text-sm">Day</div>
          </div>
          <div className="h-12 w-px bg-border-subtle" />
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">{formatHour(hour || 10)}</div>
            <div className="text-text-muted text-sm">Time</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Workflow Step Component
const WorkflowStep = ({ step, isLast }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'send_email': return '@';
      case 'wait': return '#';
      default: return '>';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'send_email': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'wait': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${getActionColor(step.action)}`}>
          {getActionIcon(step.action)}
        </div>
        {!isLast && <div className="w-0.5 h-8 bg-border-subtle" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="font-semibold text-text-primary">
          Step {step.step_number}: {step.action === 'send_email' ? `Send ${step.email_type?.replace('_', ' ')}` : `Wait ${step.delay_days} days`}
        </div>
        <div className="text-text-muted text-sm mt-1">
          {step.action === 'send_email' && step.send_day && (
            <span>Send on {step.send_day} at {step.send_hour}:00</span>
          )}
          {step.condition && <span className="ml-2 text-yellow-400">({step.condition.replace('_', ' ')})</span>}
        </div>
      </div>
    </div>
  );
};

// Workflow Template Visualizer Component
const WorkflowVisualizer = ({ workflow, loading, onApplyWorkflow }) => {
  return (
    <div className="bg-bg-card border border-border-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">Workflow Template</h3>
        {workflow && !loading && (
          <button
            onClick={onApplyWorkflow}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition text-sm"
          >
            Apply Workflow
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-bg-card-hover animate-pulse" />
              <div className="flex-1 h-6 bg-bg-card-hover animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : workflow ? (
        <div>
          <div className="mb-4 px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg">
            <span className="text-accent font-semibold">{workflow.workflow_name}</span>
          </div>
          <div className="space-y-0">
            {(workflow.steps || []).map((step, idx) => (
              <WorkflowStep
                key={step.step_number}
                step={step}
                isLast={idx === workflow.steps.length - 1}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-text-muted text-sm">Select a lead to generate a workflow.</p>
      )}
    </div>
  );
};

// Lead Selector Component
const LeadSelector = ({ leads, selectedLead, onSelectLead, loading }) => {
  return (
    <div className="bg-bg-card border border-border-card rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">Select Lead</h3>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-bg-card-hover animate-pulse rounded-lg" />
          ))}
        </div>
      ) : leads.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {leads.map((lead) => (
            <button
              key={lead._id || lead.id}
              onClick={() => onSelectLead(lead)}
              className={`w-full p-3 rounded-lg text-left transition ${
                selectedLead?._id === lead._id || selectedLead?.id === lead.id
                  ? 'bg-accent/20 border border-accent/50'
                  : 'bg-bg-card-hover hover:bg-border-card border border-transparent'
              }`}
            >
              <div className="font-semibold text-text-primary">{lead.name || lead.email}</div>
              <div className="text-text-muted text-sm">
                {lead.role || 'Unknown role'} at {lead.company_name || lead.company || 'Unknown company'}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-sm">No leads available. Upload leads first.</p>
      )}
    </div>
  );
};

// Manual Lead Input Form
const ManualLeadForm = ({ onAnalyze, analyzing }) => {
  const [formData, setFormData] = useState({
    role: '',
    industry: '',
    company_size: 'medium',
    lead_source: 'Website',
    company_name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  return (
    <div className="bg-bg-card border border-border-card rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">Manual Analysis</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., CTO, Marketing Manager"
              className="w-full px-3 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-1">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g., SaaS, AI, Finance"
              className="w-full px-3 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1">Company Size</label>
            <select
              value={formData.company_size}
              onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
              className="w-full px-3 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="small">Small (1-50)</option>
              <option value="medium">Medium (51-500)</option>
              <option value="large">Large (500+)</option>
            </select>
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-1">Lead Source</label>
            <select
              value={formData.lead_source}
              onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
              className="w-full px-3 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Conference">Conference</option>
              <option value="Paid Ad">Paid Ad</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-1">Company Name</label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="e.g., Acme Corp"
            className="w-full px-3 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={analyzing}
          className="w-full px-4 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition disabled:opacity-50"
        >
          {analyzing ? 'Analyzing...' : 'Analyze Lead'}
        </button>
      </form>
    </div>
  );
};

// Main Lead Analysis Page
export default function LeadAnalysis() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('select'); // 'select' or 'manual'

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await leadsService.getAll();
      setLeads(data?.leads || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
    setError(null);
    setAnalyzing(true);

    try {
      const leadFeatures = {
        role: lead.role || lead.title || 'Unknown',
        industry: lead.industry || 'Unknown',
        company_size: lead.company_size || 'medium',
        lead_source: lead.lead_source || lead.source || 'Website',
        company_name: lead.company_name || lead.company || 'Unknown'
      };

      const result = await analyzeService.analyzeLead(leadFeatures);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze lead. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualAnalyze = async (leadFeatures) => {
    setError(null);
    setAnalyzing(true);
    setSelectedLead(null);

    try {
      const result = await analyzeService.analyzeLead(leadFeatures);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze lead. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyWorkflow = () => {
    if (analysis?.workflow_template) {
      // Navigate to workflow builder with the template
      const workflowData = encodeURIComponent(JSON.stringify(analysis.workflow_template));
      window.location.href = `/workflows?template=${workflowData}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Lead Analysis</h1>
        <p className="text-text-secondary">
          AI-powered lead scoring, insights, and workflow generation.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Selection */}
        <div className="space-y-6">
          {/* Tab Selector */}
          <div className="flex bg-bg-card border border-border-card rounded-lg p-1">
            <button
              onClick={() => setActiveTab('select')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${
                activeTab === 'select'
                  ? 'bg-accent text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Select Lead
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${
                activeTab === 'manual'
                  ? 'bg-accent text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Manual Input
            </button>
          </div>

          {activeTab === 'select' ? (
            <LeadSelector
              leads={leads}
              selectedLead={selectedLead}
              onSelectLead={handleSelectLead}
              loading={loading}
            />
          ) : (
            <ManualLeadForm onAnalyze={handleManualAnalyze} analyzing={analyzing} />
          )}
        </div>

        {/* Middle Column - Score & Insights */}
        <div className="space-y-6">
          <LeadScoreCard score={analysis?.lead_score} loading={analyzing} />
          <BestSendTime
            day={analysis?.best_send_day}
            hour={analysis?.best_send_hour}
            loading={analyzing}
          />
        </div>

        {/* Right Column - Insights & Workflow */}
        <div className="space-y-6">
          <InsightsPanel insights={analysis?.insights} loading={analyzing} />
        </div>
      </div>

      {/* Full Width - Workflow Visualizer */}
      <WorkflowVisualizer
        workflow={analysis?.workflow_template}
        loading={analyzing}
        onApplyWorkflow={handleApplyWorkflow}
      />
    </div>
  );
}
