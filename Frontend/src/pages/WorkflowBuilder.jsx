import React, { useState } from 'react';

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState([
    { id: 1, label: 'Start', type: 'trigger', x: 100, y: 100 },
    { id: 2, label: 'Send Email', type: 'action', x: 300, y: 100 },
    { id: 3, label: 'Wait 3 Days', type: 'action', x: 500, y: 100 },
    { id: 4, label: 'If Opened?', type: 'decision', x: 300, y: 250 },
    { id: 5, label: 'End', type: 'trigger', x: 500, y: 250 },
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Workflow Builder</h1>
        <p className="text-text-secondary">Create automated outreach sequences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Tools */}
        <div className="lg:col-span-1 bg-bg-card border border-border-card rounded-xl p-4 h-fit">
          <h3 className="text-lg font-bold text-text-primary mb-4">Tools</h3>
          <div className="space-y-2">
            {[
              { label: 'Trigger', icon: '▶' },
              { label: 'Send Email', icon: '✉' },
              { label: 'Wait/Delay', icon: '⏱' },
              { label: 'Decision', icon: '◆' },
              { label: 'Log', icon: '📝' },
            ].map((tool) => (
              <div
                key={tool.label}
                draggable
                className="p-3 bg-bg-card-hover hover:bg-bg-card-hover border border-border-card rounded-lg cursor-move transition text-center text-text-secondary hover:text-text-primary"
              >
                <span className="mr-2">{tool.icon}</span>
                {tool.label}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border-subtle">
            <button className="w-full px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition">
              Save Workflow
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3 bg-bg-card border border-border-card rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border-subtle">
            <h3 className="font-semibold text-text-primary">Workflow Canvas</h3>
          </div>

          <div
            className="flex-1 bg-bg-primary/50 relative overflow-auto"
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
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
              pointerEvents="none"
            />

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => handleNodeDragStart(e, node.id)}
                onClick={() => setSelectedNode(node.id)}
                className={`absolute w-24 h-12 flex items-center justify-center rounded-lg border-2 font-semibold text-sm cursor-move transition ${getNodeColor(
                  node.type
                )} ${selectedNode === node.id ? 'ring-2 ring-[#f97316]' : ''}`}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
              >
                {node.label}
              </div>
            ))}

            {/* Connection lines (simplified) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Example connections */}
              <line x1="160" y1="115" x2="300" y2="115" stroke="#ffffff40" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="360" y1="115" x2="500" y2="115" stroke="#ffffff40" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="330" y1="130" x2="330" y2="250" stroke="#ffffff40" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-bg-card border border-border-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Email Sequence', desc: 'Send automated email follow-ups', icon: '✉' },
            { name: 'Lead Scoring', desc: 'Score leads based on engagement', icon: '📊' },
            { name: 'Drip Campaign', desc: 'Time-based content delivery', icon: '💧' },
          ].map((template) => (
            <button
              key={template.name}
              className="p-4 bg-bg-card-hover hover:bg-bg-card-hover border border-border-subtle rounded-lg text-left transition"
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
