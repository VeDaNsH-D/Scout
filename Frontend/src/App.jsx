import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';
import LeadUpload from './pages/LeadUpload';
import CampaignMonitor from './pages/CampaignMonitor';
import AiGenerator from './pages/AiGenerator';
import LeadAnalyzer from './pages/LeadAnalyzer';
import Settings from './pages/Settings';
import Chatbot from './pages/Chatbot';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><Layout><WorkflowBuilder /></Layout></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><Layout><LeadUpload /></Layout></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute><Layout><CampaignMonitor /></Layout></ProtectedRoute>} />
      <Route path="/ai-generator" element={<ProtectedRoute><Layout><AiGenerator /></Layout></ProtectedRoute>} />
      <Route path="/lead-analyzer" element={<ProtectedRoute><Layout><LeadAnalyzer /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><Layout><Chatbot /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
