import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';
import LeadUpload from './pages/LeadUpload';
import CampaignMonitor from './pages/CampaignMonitor';
import AiGenerator from './pages/AiGenerator';
import Settings from './pages/Settings';
import Signup from './pages/Signup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/workflows" element={<Layout><WorkflowBuilder /></Layout>} />
      <Route path="/leads" element={<Layout><LeadUpload /></Layout>} />
      <Route path="/campaigns" element={<Layout><CampaignMonitor /></Layout>} />
      <Route path="/ai-generator" element={<Layout><AiGenerator /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
