import React, { useEffect, useState } from 'react';

export default function ExtensionImportBanner() {
  const [available, setAvailable] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let timeout = setTimeout(async () => {
      try {
        if (window.extensionData?.getLeads) {
          await window.extensionData.getLeads().catch(() => {});
          setAvailable(true);
        }
      } catch {
        setAvailable(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  if (!available) return null;

  const handleImport = async () => {
    if (!window.extensionData?.getLeads) return;
    setImporting(true);
    try {
      const leads = await window.extensionData.getLeads();
      if (!leads.length) {
        alert('No leads captured in extension.');
        return;
      }

      const res = await fetch('/api/sync-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads, timestamp: new Date().toISOString() }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Successfully imported ${data.syncedCount ?? leads.length} leads.`);
        if (window.extensionData.clearLeads) {
          await window.extensionData.clearLeads();
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Import failed: ${err.detail || 'Unknown error'}`);
      }
    } catch (e) {
      alert(`Error importing leads: ${e.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <div className="font-semibold text-sm">Intelligence Scout Connected</div>
          <div className="text-xs text-white/80">Import captured LinkedIn leads from your browser extension.</div>
        </div>
      </div>
      <button
        onClick={handleImport}
        disabled={importing}
        className="text-xs font-semibold bg-white text-indigo-600 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {importing ? 'Importing…' : 'Import Leads'}
      </button>
    </div>
  );
}

