import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import workflowsService from '../services/workflowsService';

const defaultNodes = [
  { id: 1, label: 'Start', type: 'trigger', x: 100, y: 100 },
  { id: 2, label: 'Send Email', type: 'action', x: 300, y: 100 },
  { id: 3, label: 'Wait 3 Days', type: 'action', x: 500, y: 100 },
  { id: 4, label: 'If Opened?', type: 'decision', x: 300, y: 250 },
  { id: 5, label: 'End', type: 'trigger', x: 500, y: 250 },
];

export default function WorkflowBuilder() {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');

  const [nodes, setNodes] = useState(defaultNodes);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(workflowId);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow(workflowId);
    }
  }, [workflowId]);

  const fetchWorkflow = async (id) => {
    setLoading(true);
    try {
      const data = await workflowsService.getById(id);
      if (data) {
        setWorkflowName(data.name || 'Untitled Workflow');
        setNodes(data.nodes?.length > 0 ? data.nodes : defaultNodes);
        setCurrentWorkflowId(data._id || id);
      }
    } catch (err) {
      console.error('Failed to fetch workflow:', err);
      setError('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      setError('Please enter a workflow name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const workflowData = {
        name: workflowName,
        nodes: nodes,
        edges: [], // Could be expanded to track connections
      };

      let result;
      if (currentWorkflowId) {
        result = await workflowsService.update(currentWorkflowId, workflowData);
      } else {
        result = await workflowsService.create(workflowData);
        setCurrentWorkflowId(result._id || result.id);
      }

      setSuccess('Workflow saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save workflow:', err);
      setError(err.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleNodeDragStart = (e, nodeId) => {
    setDraggedNode(nodeId);
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e) => {
    if (!draggedNode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 30;

    setNodes(
      nodes.map((node) =>
        node.id === draggedNode ? { ...node, x, y } : node
      )
    );
    setDraggedNode(null);
  };

  const handleAddNode = (type, label) => {
    const newId = Math.max(...nodes.map(n => n.id)) + 1;
    setNodes([
      ...nodes,
      { id: newId, label, type, x: 200, y: 200 },
    ]);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes(nodes.filter(n => n.id !== selectedNode));
    setSelectedNode(null);
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'trigger':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'action':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'decision':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      default:
        return 'bg-white/10 border-white/30 text-white';
    }
  };

  const toolItems = [
    { label: 'Trigger', icon: '>', type: 'trigger' },
    { label: 'Send Email', icon: '@', type: 'action' },
    { label: 'Wait/Delay', icon: '#', type: 'action' },
    { label: 'Decision', icon: '?', type: 'decision' },
    { label: 'Log', icon: '*', type: 'action' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Loading workflow...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Workflow Builder</h1>
          <p className="text-text-secondary">Create automated outreach sequences</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow name"
            className="px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary"
          />
          <button
            onClick={handleSaveWorkflow}
            disabled={saving}
            className="px-6 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Tools */}
        <div className="lg:col-span-1 bg-bg-card border border-border-card rounded-xl p-4 h-fit">
          <h3 className="text-lg font-bold text-text-primary mb-4">Tools</h3>
          <div className="space-y-2">
            {toolItems.map((tool) => (
              <div
                key={tool.label}
                onClick={() => handleAddNode(tool.type, tool.label)}
                className="p-3 bg-bg-card-hover hover:bg-border-card border border-border-card rounded-lg cursor-pointer transition text-center text-text-secondary hover:text-text-primary"
              >
                <span className="mr-2">{tool.icon}</span>
                {tool.label}
              </div>
            ))}
          </div>

          {selectedNode && (
            <div className="mt-6 pt-6 border-t border-border-subtle">
              <p className="text-sm text-text-secondary mb-2">Selected Node</p>
              <button
                onClick={handleDeleteNode}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold rounded-lg transition"
              >
                Delete Node
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border-subtle space-y-2">
            <button
              onClick={() => {
                setNodes(defaultNodes);
                setWorkflowName('New Workflow');
                setCurrentWorkflowId(null);
                setSelectedNode(null);
              }}
              className="w-full px-4 py-2 bg-bg-card-hover hover:bg-border-card border border-border-card text-text-primary font-semibold rounded-lg transition"
            >
              New Workflow
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3 bg-bg-card border border-border-card rounded-xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-border-subtle flex justify-between items-center">
            <h3 className="font-semibold text-text-primary">Workflow Canvas</h3>
            <span className="text-text-muted text-sm">{nodes.length} nodes</span>
          </div>

          <div
            className="flex-1 bg-bg-primary/50 relative overflow-auto"
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            style={{ minHeight: '400px' }}
          >
            {/* Grid background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent),
                  linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent)
                `,
                backgroundSize: '50px 50px',
              }}
            />

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => handleNodeDragStart(e, node.id)}
                onClick={() => setSelectedNode(node.id)}
                className={`absolute px-4 py-3 min-w-[100px] flex items-center justify-center rounded-lg border-2 font-semibold text-sm cursor-move transition ${getNodeColor(
                  node.type
                )} ${selectedNode === node.id ? 'ring-2 ring-accent' : ''}`}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
              >
                {node.label}
              </div>
            ))}

            {/* Connection lines (simplified) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.length > 1 && nodes.slice(0, -1).map((node, idx) => {
                const nextNode = nodes[idx + 1];
                if (!nextNode) return null;
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={node.x + 50}
                    y1={node.y + 20}
                    x2={nextNode.x}
                    y2={nextNode.y + 20}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-bg-card border border-border-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              name: 'Email Sequence', 
              desc: 'Send automated email follow-ups', 
              icon: '@',
              nodes: [
                { id: 1, label: 'Start', type: 'trigger', x: 100, y: 100 },
                { id: 2, label: 'Send Email 1', type: 'action', x: 300, y: 100 },
                { id: 3, label: 'Wait 2 Days', type: 'action', x: 500, y: 100 },
                { id: 4, label: 'Send Email 2', type: 'action', x: 300, y: 200 },
                { id: 5, label: 'End', type: 'trigger', x: 500, y: 200 },
              ],
            },
            { 
              name: 'Lead Scoring', 
              desc: 'Score leads based on engagement', 
              icon: '#',
              nodes: [
                { id: 1, label: 'New Lead', type: 'trigger', x: 100, y: 100 },
                { id: 2, label: 'Check Engagement', type: 'decision', x: 300, y: 100 },
                { id: 3, label: 'Score High', type: 'action', x: 200, y: 200 },
                { id: 4, label: 'Score Low', type: 'action', x: 400, y: 200 },
              ],
            },
            { 
              name: 'Drip Campaign', 
              desc: 'Time-based content delivery', 
              icon: '*',
              nodes: [
                { id: 1, label: 'Start', type: 'trigger', x: 100, y: 100 },
                { id: 2, label: 'Send Welcome', type: 'action', x: 300, y: 100 },
                { id: 3, label: 'Wait 7 Days', type: 'action', x: 500, y: 100 },
                { id: 4, label: 'Send Value', type: 'action', x: 300, y: 200 },
                { id: 5, label: 'Wait 7 Days', type: 'action', x: 500, y: 200 },
                { id: 6, label: 'Send CTA', type: 'action', x: 400, y: 300 },
              ],
            },
          ].map((template) => (
            <button
              key={template.name}
              onClick={() => {
                setNodes(template.nodes);
                setWorkflowName(template.name);
                setCurrentWorkflowId(null);
              }}
              className="p-4 bg-bg-card-hover hover:bg-border-card border border-border-subtle rounded-lg text-left transition"
            >
              <div className="text-2xl mb-2">{template.icon}</div>
              <p className="font-semibold text-text-primary">{template.name}</p>
              <p className="text-text-secondary text-sm">{template.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
