import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import leadsService from '../services/leadsService';
import { mockLeads } from '../utils/mockData';

export default function LeadUpload() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({ total: 0, valid: 0, duplicates: 0 });
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadInsights, setLeadInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await leadsService.getAll();
      const leadList = Array.isArray(data) ? data : data?.leads || [];
      setLeads(leadList);
      setStats({
        total: leadList.length,
        valid: leadList.filter(l => l.email).length,
        duplicates: 0,
      });
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setLeads(mockLeads);
      setStats({ total: mockLeads.length, valid: mockLeads.length, duplicates: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(ext)) {
      setError('Please upload a CSV or Excel file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await leadsService.upload(file);
      setSuccess(`Successfully uploaded ${result.count || 'your'} leads!`);
      fetchLeads();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadsService.delete(id);
      setLeads(leads.filter(l => (l._id || l.id) !== id));
      setSuccess('Lead deleted successfully');
      if (selectedLead && (selectedLead._id || selectedLead.id) === id) {
        setSelectedLead(null);
        setLeadInsights(null);
      }
    } catch (err) {
      setError('Failed to delete lead');
    }
  };

  const handleLeadClick = async (lead) => {
    setSelectedLead(lead);
    setLeadInsights(null);
    setInsightsLoading(true);
    try {
      const data = await leadsService.getInsights(lead._id || lead.id);
      setLeadInsights(data);
    } catch (err) {
      console.error('Failed to get insights:', err);
      setLeadInsights({
        lead_score: lead.lead_score,
        insights: lead.insights || [],
        best_send_day: lead.best_send_day,
        best_send_hour: lead.best_send_hour
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleGenerateWorkflow = async (lead) => {
    setWorkflowLoading(true);
    setError(null);
    try {
      const result = await leadsService.generateWorkflow(lead._id || lead.id);
      const wfId = result.workflow?._id || result.workflow?.id;
      if (wfId) {
        navigate(`/workflows?id=${wfId}`);
      } else {
        setSuccess('Workflow generated successfully!');
      }
    } catch (err) {
      console.error('Failed to generate workflow:', err);
      setError('Failed to generate workflow. Make sure the ML service is running.');
    } finally {
      setWorkflowLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score == null) return 'text-text-muted';
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score == null) return 'bg-gray-500/20';
    if (score >= 0.7) return 'bg-green-500/20';
    if (score >= 0.4) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const statusColors = {
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    contacted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    engaged: 'bg-green-500/20 text-green-300 border-green-500/30',
    interested: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    replied: 'bg-green-500/20 text-green-300 border-green-500/30',
    converted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Lead Upload</h1>
        <p className="text-text-secondary">Import and manage your lead lists</p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex justify-between items-center">
          {error}
          <button onClick={() => setError(null)} className="text-red-300 hover:text-red-200">x</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm flex justify-between items-center">
          {success}
          <button onClick={() => setSuccess(null)} className="text-green-300 hover:text-green-200">x</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition cursor-pointer ${dragActive
                ? 'border-accent bg-accent-soft'
                : 'border-border-card bg-transparent hover:border-border-strong'
              } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <svg
              className="w-12 h-12 mx-auto mb-4 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-text-primary font-semibold mb-2">
              {uploading ? 'Uploading...' : 'Drag and drop your CSV file here'}
            </p>
            <p className="text-text-secondary text-sm mb-4">or</p>
            <button
              className="px-6 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Browse Files'}
            </button>
          </div>

          {/* CSV Template */}
          <div className="bg-bg-card-hover border border-border-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-3">CSV Template</h3>
            <p className="text-text-secondary text-sm mb-3">
              Your CSV should have columns: name, email, company, phone (optional), position (optional)
            </p>
            <button
              onClick={() => {
                const csvContent = "name,email,company,phone,position\nJohn Doe,john@example.com,Acme Inc,555-1234,CEO";
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'leads_template.csv';
                a.click();
              }}
              className="px-4 py-2 border border-border-card hover:border-border-strong text-text-primary rounded-lg transition text-sm"
            >
              Download Template
            </button>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-sm text-text-secondary mb-2">Total Leads</h3>
            <p className="text-3xl font-bold text-text-primary mb-2">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-text-muted">in database</p>
          </div>
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-sm text-text-secondary mb-2">Valid Emails</h3>
            <p className="text-3xl font-bold text-green-400">
              {stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : 100}%
            </p>
            <p className="text-xs text-text-muted">{stats.valid} verified</p>
          </div>
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-sm text-text-secondary mb-2">Actions</h3>
            <button
              onClick={fetchLeads}
              className="w-full px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition text-sm"
            >
              Refresh Leads
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Panel */}
      {selectedLead && (
        <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border-subtle flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary">
              {selectedLead.name || selectedLead.email}
            </h2>
            <button onClick={() => { setSelectedLead(null); setLeadInsights(null); }} className="text-text-muted hover:text-text-primary text-sm">
              Close
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Lead Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-text-secondary text-xs mb-1">Email</p>
                <p className="text-text-primary text-sm">{selectedLead.email}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Company</p>
                <p className="text-text-primary text-sm">{selectedLead.company || '-'}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Role</p>
                <p className="text-text-primary text-sm">{selectedLead.role || '-'}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Industry</p>
                <p className="text-text-primary text-sm">{selectedLead.industry || '-'}</p>
              </div>
            </div>

            {insightsLoading ? (
              <div className="text-center py-8 text-text-muted">Loading insights...</div>
            ) : leadInsights ? (
              <>
                {/* Score and Send Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-bg-card-hover border border-border-subtle rounded-lg p-4">
                    <h4 className="text-sm text-text-secondary mb-2">Lead Score</h4>
                    <p className={`text-3xl font-bold ${getScoreColor(leadInsights.lead_score)}`}>
                      {leadInsights.lead_score != null ? `${(leadInsights.lead_score * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                    {leadInsights.lead_score != null && (
                      <div className="mt-2 w-full bg-bg-card rounded-full h-2">
                        <div className={`h-2 rounded-full ${leadInsights.lead_score >= 0.7 ? 'bg-green-400' : leadInsights.lead_score >= 0.4 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${leadInsights.lead_score * 100}%` }}></div>
                      </div>
                    )}
                  </div>
                  <div className="bg-bg-card-hover border border-border-subtle rounded-lg p-4">
                    <h4 className="text-sm text-text-secondary mb-2">Best Send Time</h4>
                    <p className="text-2xl font-bold text-text-primary">{leadInsights.best_send_day || 'N/A'}</p>
                    <p className="text-lg text-accent font-semibold">
                      {leadInsights.best_send_hour != null ? `${leadInsights.best_send_hour}:00` : ''}
                    </p>
                  </div>
                </div>

                {/* AI Insights */}
                {leadInsights.insights && leadInsights.insights.length > 0 && (
                  <div className="bg-bg-card-hover border border-border-subtle rounded-lg p-4">
                    <h4 className="text-sm text-text-secondary mb-3 flex items-center gap-2">
                      <span className="text-accent">💡</span> AI Insights
                    </h4>
                    <ul className="space-y-2">
                      {leadInsights.insights.map((insight, idx) => (
                        <li key={idx} className="flex gap-2 text-text-secondary text-sm">
                          <span className="text-accent mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Generate Workflow Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleGenerateWorkflow(selectedLead)}
                    disabled={workflowLoading}
                    className={`px-6 py-3 font-bold rounded-lg transition ${workflowLoading
                        ? 'bg-accent/50 text-text-inverse cursor-not-allowed'
                        : 'bg-accent hover:bg-accent-hover text-text-inverse'
                      }`}
                  >
                    {workflowLoading ? 'Generating Workflow...' : 'Generate Personalized Workflow ⚡'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Current Leads */}
      <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-lg font-bold text-text-primary">Recent Leads</h2>
          <span className="text-text-muted text-sm">{leads.length} total</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-text-muted">Loading leads...</div>
          ) : leads.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 20).map((lead) => (
                  <tr
                    key={lead._id || lead.id}
                    className={`border-b border-border-subtle hover:bg-bg-card-hover transition cursor-pointer ${selectedLead && (selectedLead._id || selectedLead.id) === (lead._id || lead.id) ? 'bg-bg-card-hover' : ''
                      }`}
                    onClick={() => handleLeadClick(lead)}
                  >
                    <td className="px-6 py-3 text-text-primary font-medium">{lead.name}</td>
                    <td className="px-6 py-3 text-text-secondary text-sm">{lead.email}</td>
                    <td className="px-6 py-3 text-text-secondary text-sm">{lead.company || '-'}</td>
                    <td className="px-6 py-3">
                      {lead.lead_score != null ? (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreBg(lead.lead_score)} ${getScoreColor(lead.lead_score)}`}>
                          {(lead.lead_score * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[lead.status] || statusColors.new}`}>
                        {(lead.status || 'new').charAt(0).toUpperCase() + (lead.status || 'new').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead._id || lead.id); }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-text-muted">
              No leads yet. Upload a CSV to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
