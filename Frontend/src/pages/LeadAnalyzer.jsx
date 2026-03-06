import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function LeadAnalyzer() {
  const [leadFeatures, setLeadFeatures] = useState({
    role: 'CEO',
    industry: 'Technology',
    company_size: 'Large',
    company_name: 'TechCorp',
    lead_source: 'Referral'
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeadFeatures({ ...leadFeatures, [name]: value });
  };

  const analyzeLead = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analyze-lead`, {
        lead_features: leadFeatures
      });
      setResult(response.data);
    } catch (err) {
      console.error('Failed to analyze lead:', err);
      setError(err.response?.data?.error || err.message || 'Failed to analyze lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Lead Analyzer</h1>
        <p className="text-text-secondary">AI-powered lead scoring, insights, and outreach strategy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Lead Features</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={leadFeatures.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={leadFeatures.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Company Size</label>
                <select
                  name="company_size"
                  value={leadFeatures.company_size}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary"
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={leadFeatures.company_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Lead Source</label>
                <input
                  type="text"
                  name="lead_source"
                  value={leadFeatures.lead_source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                />
              </div>

              <button
                onClick={analyzeLead}
                disabled={loading}
                className={`w-full px-6 py-3 font-bold rounded-lg transition ${
                  loading 
                    ? 'bg-accent/50 text-text-inverse cursor-not-allowed' 
                    : 'bg-accent hover:bg-accent-hover text-text-inverse'
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze Lead ✨'}
              </button>
              
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Score and Send Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lead Score Card */}
                <div className="bg-bg-card border border-border-card rounded-xl p-6">
                  <h3 className="text-sm text-text-secondary mb-2">Predicted Reply Probability</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-accent">
                      {(result.lead_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="mt-4 w-full bg-bg-card-hover rounded-full h-2.5">
                    <div 
                      className="bg-accent h-2.5 rounded-full" 
                      style={{ width: `${result.lead_score * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Best Send Time Card */}
                <div className="bg-bg-card border border-border-card rounded-xl p-6">
                  <h3 className="text-sm text-text-secondary mb-2">Optimal Send Time</h3>
                  <p className="text-2xl font-bold text-text-primary mb-1">
                    {result.best_send_day}s
                  </p>
                  <p className="text-xl text-accent font-semibold">
                    {result.best_send_hour}:00
                  </p>
                  <p className="text-xs text-text-muted mt-2">Predicted highest engagement window</p>
                </div>
              </div>

              {/* Insights Panel */}
              <div className="bg-bg-card border border-border-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span className="text-accent">💡</span> AI Insights
                </h3>
                <ul className="space-y-3">
                  {result.insights && result.insights.length > 0 ? (
                    result.insights.map((insight, idx) => (
                      <li key={idx} className="flex gap-3 text-text-secondary">
                        <span className="text-accent mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-text-muted">No insights available.</li>
                  )}
                </ul>
              </div>

              {/* Workflow Template Visualizer */}
              <div className="bg-bg-card border border-border-card rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <span className="text-accent">⚡</span> Generated Workflow: {result.workflow_template?.workflow_name || 'Custom Outreach'}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {result.workflow_template?.steps?.map((step, idx) => (
                    <div key={idx} className="relative pl-8 pb-4 border-l-2 border-border-card last:border-0 last:pb-0">
                      <div className="absolute w-6 h-6 bg-bg-card border-2 border-accent rounded-full -left-[13px] top-0 flex items-center justify-center text-xs text-accent font-bold">
                        {step.step_number}
                      </div>
                      
                      <div className="bg-bg-card-hover border border-border-subtle rounded-lg p-4 -mt-2 ml-2">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            step.action === 'send_email' 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {step.action.toUpperCase().replace('_', ' ')}
                          </span>
                          {step.condition && (
                            <span className="text-xs text-text-muted bg-bg-card px-2 py-1 rounded border border-border-card">
                              Condition: {step.condition.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        
                        {step.action === 'send_email' && (
                          <div className="text-sm text-text-secondary">
                            <p><span className="font-semibold text-text-primary">Type:</span> {step.email_type?.replace(/_/g, ' ')}</p>
                            <p><span className="font-semibold text-text-primary">Schedule:</span> {step.send_day} at {step.send_hour}:00</p>
                          </div>
                        )}
                        
                        {step.action === 'wait' && (
                          <div className="text-sm text-text-secondary">
                            <p><span className="font-semibold text-text-primary">Delay:</span> {step.delay_days} days</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition text-sm">
                    Use This Template
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-bg-card border border-border-card rounded-xl border-dashed">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-text-secondary">Enter lead details and click "Analyze Lead" to generate insights.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
