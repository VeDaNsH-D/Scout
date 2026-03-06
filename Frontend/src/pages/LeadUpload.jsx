import React, { useState } from 'react';
import { mockLeads } from '../utils/mockData';

export default function LeadUpload() {
  const [leads, setLeads] = useState(mockLeads);
  const [dragActive, setDragActive] = useState(false);

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
      alert(`File "${files[0].name}" would be uploaded (demo)`);
    }
  };

  const statusColors = {
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    contacted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    engaged: 'bg-green-500/20 text-green-300 border-green-500/30',
    interested: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Lead Upload</h1>
        <p className="text-text-secondary">Import and manage your lead lists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
              dragActive
                ? 'border-accent bg-accent-soft'
                : 'border-border-card bg-transparent hover:border-border-strong'
            }`}
          >
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
            <p className="text-text-primary font-semibold mb-2">Drag and drop your CSV file here</p>
            <p className="text-text-secondary text-sm mb-4">or</p>
            <button className="px-6 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition">
              Browse Files
            </button>
          </div>

          {/* Import Options */}
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Import Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Select Campaign</label>
                <select className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary">
                  <option>Create New Campaign</option>
                  <option>Add to Existing</option>
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Lead Source</label>
                <select className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary">
                  <option>Manual Upload</option>
                  <option>API Integration</option>
                  <option>Zapier</option>
                </select>
              </div>
              <button className="w-full px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition">
                Import Leads
              </button>
            </div>
          </div>

          {/* CSV Template */}
          <div className="bg-bg-card-hover border border-border-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-3">CSV Template</h3>
            <p className="text-text-secondary text-sm mb-3">Download our template to ensure proper formatting:</p>
            <button className="px-4 py-2 border border-border-card hover:border-border-strong text-text-primary rounded-lg transition text-sm">
              ⬇ Download Template
            </button>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-sm text-text-secondary mb-2">Total Leads</h3>
            <p className="text-3xl font-bold text-text-primary mb-2">1,234</p>
            <p className="text-xs text-text-muted">+45 this week</p>
          </div>
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-sm text-text-secondary mb-2">Valid Emails</h3>
            <p className="text-3xl font-bold text-green-400">98.5%</p>
            <p className="text-xs text-text-muted">1,216 verified</p>
          </div>
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-sm text-text-secondary mb-2">Duplicates Found</h3>
            <p className="text-3xl font-bold text-yellow-400">18</p>
            <p className="text-xs text-text-muted">Will be skipped</p>
          </div>
        </div>
      </div>

      {/* Current Leads */}
      <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-lg font-bold text-text-primary">Recent Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Added</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border-subtle hover:bg-bg-card-hover transition">
                  <td className="px-6 py-3 text-text-primary font-medium">{lead.name}</td>
                  <td className="px-6 py-3 text-text-secondary text-sm">{lead.email}</td>
                  <td className="px-6 py-3 text-text-secondary text-sm">{lead.company}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[lead.status]}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-text-muted text-sm">{lead.added}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
