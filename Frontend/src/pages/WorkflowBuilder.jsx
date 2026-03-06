import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactFlow, {
  BaseEdge,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlowProvider,
  getSmoothStepPath,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import workflowsService from '../services/workflowsService';

const DND_NODE_TYPE = 'application/x-workflow-node';

const NODE_LIBRARY = [
  {
    id: 'pageVisit',
    label: 'Page Visit',
    subtitle: 'Trigger when a lead visits key pages',
    category: 'trigger',
    group: 'trigger',
    iconClass: 'bg-violet-400/35',
    cardClass: 'border-violet-500/45 bg-violet-500/14 hover:bg-violet-500/22',
  },
  {
    id: 'formSubmit',
    label: 'Form Submit',
    subtitle: 'Lead submits contact/demo form',
    category: 'trigger',
    group: 'trigger',
    iconClass: 'bg-emerald-400/35',
    cardClass: 'border-emerald-500/45 bg-emerald-500/14 hover:bg-emerald-500/22',
  },
  {
    id: 'chatReply',
    label: 'Chatbot Reply',
    subtitle: 'Lead engages with website chatbot',
    category: 'trigger',
    group: 'trigger',
    iconClass: 'bg-fuchsia-400/35',
    cardClass: 'border-fuchsia-500/45 bg-fuchsia-500/14 hover:bg-fuchsia-500/22',
  },
  {
    id: 'enrichLead',
    label: 'Enrich Lead',
    subtitle: 'Append company and profile data',
    category: 'action',
    group: 'action',
    iconClass: 'bg-blue-400/35',
    cardClass: 'border-blue-500/45 bg-blue-500/14 hover:bg-blue-500/22',
  },
  {
    id: 'scoreLead',
    label: 'Score Lead',
    subtitle: 'Apply lead scoring logic',
    category: 'action',
    group: 'action',
    iconClass: 'bg-amber-400/35',
    cardClass: 'border-amber-500/45 bg-amber-500/14 hover:bg-amber-500/22',
  },
  {
    id: 'sendFollowUp',
    label: 'Send Follow-up',
    subtitle: 'Send email or WhatsApp follow-up',
    category: 'action',
    group: 'action',
    iconClass: 'bg-rose-400/35',
    cardClass: 'border-rose-500/45 bg-rose-500/14 hover:bg-rose-500/22',
  },
  {
    id: 'syncCrm',
    label: 'Sync CRM',
    subtitle: 'Create or update CRM contact/deal',
    category: 'action',
    group: 'action',
    iconClass: 'bg-sky-400/35',
    cardClass: 'border-sky-500/45 bg-sky-500/14 hover:bg-sky-500/22',
  },
  {
    id: 'waitDelay',
    label: 'Wait Delay',
    subtitle: 'Pause flow before next action',
    category: 'wait',
    group: 'logic',
    iconClass: 'bg-cyan-400/35',
    cardClass: 'border-cyan-500/45 bg-cyan-500/14 hover:bg-cyan-500/22',
  },
  {
    id: 'ifQualified',
    label: 'If Qualified',
    subtitle: 'Branch by score or intent',
    category: 'decision',
    group: 'logic',
    iconClass: 'bg-lime-400/35',
    cardClass: 'border-lime-500/45 bg-lime-500/14 hover:bg-lime-500/22',
  },
];

const NODE_SECTIONS = [
  { id: 'trigger', title: 'TRIGGERS' },
  { id: 'action', title: 'ACTIONS' },
  { id: 'logic', title: 'LOGIC' },
];

const NODE_LIBRARY_MAP = new Map(NODE_LIBRARY.map((node) => [node.id, node]));

const TEMPLATE_LIBRARY = [
  {
    id: 'website-lead-qualification',
    name: 'Website Lead Qualification',
    description: 'Visit -> Form -> Enrich -> Score -> Qualified Branch',
    nodes: [
      {
        id: 'node_1',
        type: 'workflowNode',
        position: { x: 100, y: 150 },
        data: {
          label: 'Pricing Page Visit',
          subtitle: 'Lead visits pricing or demo page',
          category: 'trigger',
          config: { event: 'page_visit' },
        },
      },
      {
        id: 'node_2',
        type: 'workflowNode',
        position: { x: 400, y: 150 },
        data: {
          label: 'Capture Form Submit',
          subtitle: 'Store website form submission',
          category: 'trigger',
          config: { event: 'form_submit' },
        },
      },
      {
        id: 'node_3',
        type: 'workflowNode',
        position: { x: 700, y: 150 },
        data: {
          label: 'Enrich Lead Profile',
          subtitle: 'Enrich with firmographic data',
          category: 'action',
          config: { provider: 'clearbit' },
        },
      },
      {
        id: 'node_4',
        type: 'workflowNode',
        position: { x: 1000, y: 150 },
        data: {
          label: 'Score Lead',
          subtitle: 'Evaluate fit + intent score',
          category: 'action',
          config: { threshold: 70 },
        },
      },
      {
        id: 'node_5',
        type: 'workflowNode',
        position: { x: 1300, y: 150 },
        data: {
          label: 'Qualified?',
          subtitle: 'Branch on score threshold',
          category: 'decision',
          config: { condition: 'score >= 70' },
        },
      },
      {
        id: 'node_6',
        type: 'workflowNode',
        position: { x: 1600, y: 150 },
        data: {
          label: 'Notify Sales + Sync CRM',
          subtitle: 'Push qualified lead to sales queue',
          category: 'action',
          config: { channel: 'slack', endpoint: '/crm/sync' },
        },
      },
    ],
  },
  {
    id: 'demo-follow-up',
    name: 'Demo Request Follow-up',
    description: 'Form -> Route Owner -> Wait -> Follow-up -> CRM Update',
    nodes: [
      {
        id: 'node_10',
        type: 'workflowNode',
        position: { x: 120, y: 160 },
        data: {
          label: 'Demo Form Submitted',
          subtitle: 'New demo request captured',
          category: 'trigger',
          config: { event: 'demo_form_submit' },
        },
      },
      {
        id: 'node_11',
        type: 'workflowNode',
        position: { x: 420, y: 160 },
        data: {
          label: 'Assign Account Owner',
          subtitle: 'Route by region and company size',
          category: 'action',
          config: { mode: 'round_robin' },
        },
      },
      {
        id: 'node_12',
        type: 'workflowNode',
        position: { x: 720, y: 160 },
        data: {
          label: 'Wait 2 Hours',
          subtitle: 'Grace period before first touch',
          category: 'wait',
          config: { delayHours: 2 },
        },
      },
      {
        id: 'node_13',
        type: 'workflowNode',
        position: { x: 1020, y: 160 },
        data: {
          label: 'Send Confirmation',
          subtitle: 'Send confirmation and scheduling link',
          category: 'action',
          config: { channel: 'email' },
        },
      },
      {
        id: 'node_14',
        type: 'workflowNode',
        position: { x: 1320, y: 160 },
        data: {
          label: 'Update CRM Stage',
          subtitle: 'Mark lead as demo-requested',
          category: 'action',
          config: { endpoint: '/crm/demo-stage' },
        },
      },
    ],
  },
];

const CATEGORY_STYLES = {
  trigger: {
    badge: 'TRIGGER',
    border: 'border-violet-400/45',
    glow: 'shadow-[0_0_0_1px_rgba(167,139,250,0.2),0_14px_34px_rgba(139,92,246,0.22)]',
    dot: 'bg-violet-300',
    text: 'text-violet-200',
    header: 'bg-violet-500/18 border-violet-400/30',
  },
  action: {
    badge: 'ACTION',
    border: 'border-blue-400/40',
    glow: 'shadow-[0_0_0_1px_rgba(96,165,250,0.2),0_16px_35px_rgba(59,130,246,0.2)]',
    dot: 'bg-blue-300',
    text: 'text-blue-200',
    header: 'bg-blue-500/18 border-blue-400/30',
  },
  wait: {
    badge: 'WAIT',
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_16px_35px_rgba(251,146,60,0.2)]',
    dot: 'bg-amber-300',
    text: 'text-amber-200',
    header: 'bg-amber-500/18 border-amber-400/30',
  },
  decision: {
    badge: 'DECISION',
    border: 'border-rose-400/45',
    glow: 'shadow-[0_0_0_1px_rgba(251,113,133,0.2),0_16px_35px_rgba(225,29,72,0.22)]',
    dot: 'bg-rose-300',
    text: 'text-rose-200',
    header: 'bg-rose-500/18 border-rose-400/30',
  },
};

const DEFAULT_EDGE_OPTIONS = {
  type: 'goldenFlow',
  animated: false,
  style: {
    stroke: 'rgba(255, 255, 255, 0.62)',
    strokeWidth: 2,
    filter: 'drop-shadow(0 0 5px rgba(249, 115, 22, 0.33))',
  },
  markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255, 255, 255, 0.74)' },
};

const SIDEBAR_WIDTH_LIMITS = {
  left: { min: 220, max: 420, start: 240 },
  right: { min: 260, max: 460, start: 312 },
};

const SIDEBAR_STORAGE_KEYS = {
  left: 'workflow.sidebar.left.width',
  right: 'workflow.sidebar.right.width',
};

const NODE_BOX_ESTIMATE = {
  width: 240,
  height: 96,
};

const MAGNETIC_INSERT_DISTANCE = 72;

let nodeCounter = 200;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getStoredSidebarWidth(storageKey, fallback, min, max) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(parsed, min, max);
}

function cloneNodes(nodes) {
  return nodes.map((node) => ({
    ...node,
    position: { ...node.position },
    data: {
      ...node.data,
      config: { ...(node.data?.config || {}) },
    },
  }));
}

function cloneEdges(edges) {
  return edges.map((edge) => ({ ...edge }));
}

function nextNodeId() {
  nodeCounter += 1;
  return `node_${nodeCounter}`;
}

function syncNodeCounter(nodes) {
  const highest = nodes.reduce((max, node) => {
    const matches = String(node.id || '').match(/\d+/g);
    if (!matches || matches.length === 0) {
      return max;
    }

    const value = Number(matches[matches.length - 1]);
    if (Number.isNaN(value)) {
      return max;
    }

    return Math.max(max, value);
  }, 0);

  nodeCounter = Math.max(nodeCounter, highest + 1);
}

function mapLegacyTypeToCategory(type) {
  if (type === 'trigger') return 'trigger';
  if (type === 'decision') return 'decision';
  if (type === 'wait') return 'wait';
  return 'action';
}

function createStyledEdge(connectionLike) {
  return {
    id: connectionLike.id || `edge_${connectionLike.source}_${connectionLike.target}_${Date.now()}`,
    source: String(connectionLike.source),
    target: String(connectionLike.target),
    sourceHandle: connectionLike.sourceHandle || null,
    targetHandle: connectionLike.targetHandle || null,
    ...DEFAULT_EDGE_OPTIONS,
  };
}

function createLinearEdges(nodes) {
  if (nodes.length < 2) {
    return [];
  }

  return nodes.slice(0, -1).map((node, index) =>
    createStyledEdge({ source: node.id, target: nodes[index + 1].id })
  );
}

function getEdgeGuidePoints(sourceNode, targetNode) {
  const sourcePoint = {
    x: sourceNode.position.x + NODE_BOX_ESTIMATE.width,
    y: sourceNode.position.y + NODE_BOX_ESTIMATE.height / 2,
  };
  const targetPoint = {
    x: targetNode.position.x,
    y: targetNode.position.y + NODE_BOX_ESTIMATE.height / 2,
  };

  const splitX = sourcePoint.x + (targetPoint.x - sourcePoint.x) / 2;
  const polyline = [
    sourcePoint,
    { x: splitX, y: sourcePoint.y },
    { x: splitX, y: targetPoint.y },
    targetPoint,
  ];

  return polyline.filter(
    (point, index, points) =>
      index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y
  );
}

function getClosestPointOnSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const distanceSq = (point.x - start.x) ** 2 + (point.y - start.y) ** 2;
    return { x: start.x, y: start.y, distanceSq };
  }

  const projected = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq;
  const t = clamp(projected, 0, 1);
  const x = start.x + dx * t;
  const y = start.y + dy * t;
  const distanceSq = (point.x - x) ** 2 + (point.y - y) ** 2;

  return { x, y, distanceSq };
}

function getClosestPointOnPolyline(point, polyline) {
  if (!Array.isArray(polyline) || polyline.length < 2) {
    return null;
  }

  let closest = null;

  for (let index = 0; index < polyline.length - 1; index += 1) {
    const candidate = getClosestPointOnSegment(point, polyline[index], polyline[index + 1]);

    if (!closest || candidate.distanceSq < closest.distanceSq) {
      closest = candidate;
    }
  }

  return closest;
}

function findMagneticInsertCandidate(position, nodes, edges, excludeNodeId = null) {
  if (!Array.isArray(nodes) || !Array.isArray(edges) || edges.length === 0) {
    return null;
  }

  const nodeMap = new Map(nodes.map((node) => [String(node.id), node]));
  const excluded = excludeNodeId ? String(excludeNodeId) : null;
  let bestCandidate = null;

  edges.forEach((edge) => {
    const sourceId = String(edge.source || '');
    const targetId = String(edge.target || '');

    if (!sourceId || !targetId) {
      return;
    }

    if (excluded && (sourceId === excluded || targetId === excluded)) {
      return;
    }

    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);

    if (!sourceNode || !targetNode) {
      return;
    }

    const nearest = getClosestPointOnPolyline(position, getEdgeGuidePoints(sourceNode, targetNode));
    if (!nearest) {
      return;
    }

    if (!bestCandidate || nearest.distanceSq < bestCandidate.distanceSq) {
      bestCandidate = {
        edgeId: edge.id || null,
        source: sourceId,
        target: targetId,
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
        closestPoint: { x: nearest.x, y: nearest.y },
        distanceSq: nearest.distanceSq,
      };
    }
  });

  if (!bestCandidate) {
    return null;
  }

  if (Math.sqrt(bestCandidate.distanceSq) > MAGNETIC_INSERT_DISTANCE) {
    return null;
  }

  return {
    ...bestCandidate,
    snappedPosition: {
      x: Math.max(20, Math.round(bestCandidate.closestPoint.x - NODE_BOX_ESTIMATE.width / 2)),
      y: Math.max(20, Math.round(bestCandidate.closestPoint.y - NODE_BOX_ESTIMATE.height / 2)),
    },
  };
}

function normalizeIncomingNodes(rawNodes) {
  if (!Array.isArray(rawNodes) || rawNodes.length === 0) {
    return [];
  }

  const normalized = rawNodes
    .map((node, index) => {
      const category = mapLegacyTypeToCategory(node?.data?.category || node?.type || node?.data?.type);
      const fallbackTemplate = NODE_LIBRARY.find((item) => item.category === category) || NODE_LIBRARY[1];

      const hasPositionObject =
        node?.position &&
        typeof node.position.x === 'number' &&
        typeof node.position.y === 'number';

      const position = hasPositionObject
        ? { x: node.position.x, y: node.position.y }
        : {
            x: typeof node?.x === 'number' ? node.x : 120 + index * 240,
            y: typeof node?.y === 'number' ? node.y : 140 + (index % 2) * 120,
          };

      return {
        id: String(node?.id || `node_${index + 1}`),
        type: 'workflowNode',
        position,
        data: {
          label: node?.data?.label || node?.label || fallbackTemplate.label,
          subtitle: node?.data?.subtitle || fallbackTemplate.subtitle,
          category,
          config:
            node?.data?.config && typeof node.data.config === 'object'
              ? { ...node.data.config }
              : {},
        },
      };
    })
    .filter(Boolean);

  syncNodeCounter(normalized);
  return normalized;
}

function normalizeIncomingEdges(rawEdges, nodes) {
  const nodeIds = new Set(nodes.map((node) => String(node.id)));

  if (!Array.isArray(rawEdges) || rawEdges.length === 0) {
    return createLinearEdges(nodes);
  }

  const normalized = rawEdges
    .map((edge) => {
      if (!edge?.source || !edge?.target) {
        return null;
      }

      const source = String(edge.source);
      const target = String(edge.target);

      if (!nodeIds.has(source) || !nodeIds.has(target)) {
        return null;
      }

      return createStyledEdge({
        id: edge.id,
        source,
        target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      });
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized : createLinearEdges(nodes);
}

function serializeNodes(nodes) {
  return nodes.map((node) => ({
    id: node.id,
    type: node.data?.category || 'action',
    position: node.position,
    data: {
      label: node.data?.label || '',
      subtitle: node.data?.subtitle || '',
      category: node.data?.category || 'action',
      config: node.data?.config || {},
    },
  }));
}

function serializeEdges(edges) {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));
}

function createNodeFromTemplate(template, position) {
  return {
    id: nextNodeId(),
    type: 'workflowNode',
    position,
    data: {
      label: template.label,
      subtitle: template.subtitle,
      category: template.category,
      config: {},
    },
  };
}

function WorkflowCanvasNode({ data, selected }) {
  const visual = CATEGORY_STYLES[data.category] || CATEGORY_STYLES.action;

  return (
    <div
      className={`min-w-60 rounded-xl border bg-[#0b0f1a]/95 p-2 backdrop-blur-md ${visual.border} ${visual.glow} ${
        selected ? 'ring-2 ring-accent/70' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5! w-2.5! border-none! bg-white/70! shadow-[0_0_0_2px_rgba(6,7,14,0.85)]"
      />

      <div className={`mb-2 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/80 ${visual.header}`}>
        <span className={`h-2 w-2 rounded-full ${visual.dot}`} />
        <span className="ml-1">{visual.badge}</span>
      </div>

      <div className="px-1">
        <div className="text-sm font-semibold text-white">{data.label}</div>
        <div className={`mt-1 text-xs ${visual.text}`}>{data.subtitle}</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5! w-2.5! border-none! bg-white/70! shadow-[0_0_0_2px_rgba(6,7,14,0.85)]"
      />
    </div>
  );
}

function GoldenFlowEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  selected,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
  });

  // Stagger pulse timing by edge id so all connectors do not animate in lockstep.
  const phaseOffsetMs =
    (Array.from(String(id || ''))
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      1400) *
    -1;
  const phaseOffsetSeconds = phaseOffsetMs / 1000;
  const motionPathId = `workflow-edge-motion-${String(id || 'edge').replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  return (
    <>
      <BaseEdge
        id={`${id}-base`}
        path={edgePath}
        markerEnd={markerEnd}
        className="workflow-edge-base"
        style={{
          stroke: 'rgba(255, 255, 255, 0.68)',
          strokeWidth: 2.05,
          strokeDasharray: '6 10',
          filter: 'drop-shadow(0 0 3px rgba(249, 146, 60, 0.22))',
        }}
      />

      <path
        d={edgePath}
        className="workflow-edge-pulse-halo"
        style={{
          stroke: 'rgba(251, 191, 36, 0.42)',
          strokeWidth: selected ? 6.1 : 5.5,
          strokeDasharray: '96 220',
          strokeLinecap: 'round',
          fill: 'none',
          pointerEvents: 'none',
          animationDelay: `${phaseOffsetSeconds}s`,
          animationDuration: selected ? '1.95s' : '2.35s',
          filter: 'drop-shadow(0 0 10px rgba(249, 146, 60, 0.45))',
        }}
      />

      <path
        d={edgePath}
        className={`workflow-edge-pulse-core ${selected ? 'workflow-edge-pulse-core-selected' : ''}`}
        style={{
          stroke: 'rgba(254, 240, 138, 0.98)',
          strokeWidth: selected ? 3.8 : 3.3,
          strokeDasharray: '36 280',
          strokeLinecap: 'round',
          fill: 'none',
          pointerEvents: 'none',
          animationDelay: `${phaseOffsetSeconds}s`,
          animationDuration: selected ? '1.05s' : '1.35s',
          filter:
            'drop-shadow(0 0 6px rgba(254, 240, 138, 0.95)) drop-shadow(0 0 15px rgba(249, 146, 60, 0.65))',
        }}
      />

      <path id={motionPathId} d={edgePath} fill="none" stroke="none" pointerEvents="none" />

      <circle className="workflow-edge-pulse-dot" r={selected ? 4.1 : 3.6} pointerEvents="none">
        <animateMotion
          dur={selected ? '0.95s' : '1.2s'}
          repeatCount="indefinite"
          begin={`${phaseOffsetSeconds}s`}
          rotate="auto"
        >
          <mpath href={`#${motionPathId}`} />
        </animateMotion>
      </circle>

      <circle className="workflow-edge-pulse-dot-tail" r={selected ? 2.7 : 2.3} pointerEvents="none">
        <animateMotion
          dur={selected ? '0.95s' : '1.2s'}
          repeatCount="indefinite"
          begin={`${phaseOffsetSeconds - 0.22}s`}
          rotate="auto"
        >
          <mpath href={`#${motionPathId}`} />
        </animateMotion>
      </circle>
    </>
  );
}

const nodeTypes = { workflowNode: WorkflowCanvasNode };
const edgeTypes = { goldenFlow: GoldenFlowEdge };

const INITIAL_NODES = cloneNodes(TEMPLATE_LIBRARY[0].nodes);
const INITIAL_EDGES = createLinearEdges(INITIAL_NODES);

function WorkflowBuilderContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const [workflowName, setWorkflowName] = useState('New Website Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('Automate website lead capture, routing, and follow-up actions.');
  const [currentWorkflowId, setCurrentWorkflowId] = useState(workflowId || null);

  const [workflowCatalog, setWorkflowCatalog] = useState([]);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(() =>
    getStoredSidebarWidth(
      SIDEBAR_STORAGE_KEYS.left,
      SIDEBAR_WIDTH_LIMITS.left.start,
      SIDEBAR_WIDTH_LIMITS.left.min,
      SIDEBAR_WIDTH_LIMITS.left.max
    )
  );
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() =>
    getStoredSidebarWidth(
      SIDEBAR_STORAGE_KEYS.right,
      SIDEBAR_WIDTH_LIMITS.right.start,
      SIDEBAR_WIDTH_LIMITS.right.min,
      SIDEBAR_WIDTH_LIMITS.right.max
    )
  );
  const [activeResizer, setActiveResizer] = useState(null);

  const flowWrapperRef = useRef(null);
  const layoutRef = useRef(null);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(SIDEBAR_STORAGE_KEYS.left, String(leftSidebarWidth));
  }, [leftSidebarWidth]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(SIDEBAR_STORAGE_KEYS.right, String(rightSidebarWidth));
  }, [rightSidebarWidth]);

  useEffect(() => {
    if (!activeResizer) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const layoutBounds = layoutRef.current?.getBoundingClientRect();
      if (!layoutBounds) {
        return;
      }

      if (activeResizer === 'left') {
        const nextWidth = clamp(
          event.clientX - layoutBounds.left,
          SIDEBAR_WIDTH_LIMITS.left.min,
          SIDEBAR_WIDTH_LIMITS.left.max
        );
        setLeftSidebarWidth(nextWidth);
        return;
      }

      const nextWidth = clamp(
        layoutBounds.right - event.clientX,
        SIDEBAR_WIDTH_LIMITS.right.min,
        SIDEBAR_WIDTH_LIMITS.right.max
      );
      setRightSidebarWidth(nextWidth);
    };

    const stopResizing = () => setActiveResizer(null);

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResizing);
    window.addEventListener('pointercancel', stopResizing);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
      window.removeEventListener('pointercancel', stopResizing);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [activeResizer]);

  const handleResizeStart = useCallback(
    (side) => (event) => {
      event.preventDefault();
      setActiveResizer(side);
    },
    []
  );

  const resetBuilder = useCallback(() => {
    setNodes(cloneNodes(INITIAL_NODES));
    setEdges(cloneEdges(INITIAL_EDGES));
    setWorkflowName('New Website Workflow');
    setWorkflowDescription('Automate website lead capture, routing, and follow-up actions.');
    setCurrentWorkflowId(null);
    setSelectedNodeId(null);
    setErrorMessage(null);
  }, [setEdges, setNodes]);

  const fetchWorkflowCatalog = useCallback(async () => {
    try {
      const response = await workflowsService.getAll();
      const items = Array.isArray(response) ? response : response?.workflows || [];
      setWorkflowCatalog(items);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  }, []);

  const loadWorkflow = useCallback(
    async (id) => {
      setLoadingWorkflow(true);
      setErrorMessage(null);

      try {
        const response = await workflowsService.getById(id);
        const workflow = response?.workflow || response;

        if (!workflow) {
          setErrorMessage('Workflow payload is empty.');
          return;
        }

        const normalizedNodes = normalizeIncomingNodes(workflow.nodes);
        const usableNodes = normalizedNodes.length > 0 ? normalizedNodes : cloneNodes(INITIAL_NODES);
        const usableEdges = normalizeIncomingEdges(workflow.edges, usableNodes);

        setNodes(usableNodes);
        setEdges(usableEdges);
        setWorkflowName(workflow.name || 'Untitled Workflow');
        setWorkflowDescription(workflow.description || '');
        setCurrentWorkflowId(workflow._id || workflow.id || id);
        setSelectedNodeId(null);
      } catch (error) {
        console.error('Failed to fetch workflow:', error);
        setErrorMessage(error.message || 'Failed to load workflow.');
      } finally {
        setLoadingWorkflow(false);
      }
    },
    [setEdges, setNodes]
  );

  useEffect(() => {
    fetchWorkflowCatalog();
  }, [fetchWorkflowCatalog]);

  useEffect(() => {
    if (!workflowId) {
      resetBuilder();
      return;
    }

    loadWorkflow(workflowId);
  }, [loadWorkflow, resetBuilder, workflowId]);

  const spliceNodeIntoEdge = useCallback(
    (candidate, nodeId) => {
      if (!candidate || !nodeId) {
        return;
      }

      const resolvedNodeId = String(nodeId);

      setEdges((currentEdges) => {
        const edgeToReplace = currentEdges.find((edge) => {
          if (candidate.edgeId && edge.id === candidate.edgeId) {
            return true;
          }

          return (
            String(edge.source) === candidate.source &&
            String(edge.target) === candidate.target &&
            (!candidate.edgeId || edge.id === candidate.edgeId)
          );
        });

        if (!edgeToReplace) {
          return currentEdges;
        }

        const remainingEdges = currentEdges.filter((edge) => edge !== edgeToReplace);

        return [
          ...remainingEdges,
          createStyledEdge({
            source: candidate.source,
            target: resolvedNodeId,
            sourceHandle: candidate.sourceHandle,
          }),
          createStyledEdge({
            source: resolvedNodeId,
            target: candidate.target,
            targetHandle: candidate.targetHandle,
          }),
        ];
      });
    },
    [setEdges]
  );

  const addNodeFromLibrary = useCallback(
    (templateId, position) => {
      const template = NODE_LIBRARY_MAP.get(templateId);
      if (!template) {
        return;
      }

      const dropCenter = {
        x: position.x + NODE_BOX_ESTIMATE.width / 2,
        y: position.y + NODE_BOX_ESTIMATE.height / 2,
      };
      const candidate = findMagneticInsertCandidate(dropCenter, nodes, edges);

      const baseNode = createNodeFromTemplate(template, position);
      const nextNode = candidate
        ? {
            ...baseNode,
            position: candidate.snappedPosition,
          }
        : baseNode;

      setNodes((current) => [...current, nextNode]);
      setSelectedNodeId(nextNode.id);

      if (candidate) {
        spliceNodeIntoEdge(candidate, nextNode.id);
      }
    },
    [edges, nodes, setNodes, spliceNodeIntoEdge]
  );

  const handleNodeDragStop = useCallback(
    (_, draggedNode) => {
      const draggedNodeId = String(draggedNode.id);
      const isConnected = edges.some(
        (edge) => String(edge.source) === draggedNodeId || String(edge.target) === draggedNodeId
      );

      // Only auto-splice isolated nodes to avoid surprising rewires.
      if (isConnected) {
        return;
      }

      const dropCenter = {
        x: draggedNode.position.x + NODE_BOX_ESTIMATE.width / 2,
        y: draggedNode.position.y + NODE_BOX_ESTIMATE.height / 2,
      };

      const candidate = findMagneticInsertCandidate(dropCenter, nodes, edges, draggedNodeId);
      if (!candidate) {
        return;
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          String(node.id) === draggedNodeId
            ? {
                ...node,
                position: candidate.snappedPosition,
              }
            : node
        )
      );

      spliceNodeIntoEdge(candidate, draggedNodeId);
    },
    [edges, nodes, setNodes, spliceNodeIntoEdge]
  );

  const handlePaletteDragStart = useCallback((event, templateId) => {
    event.dataTransfer.setData(DND_NODE_TYPE, templateId);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleCanvasDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleCanvasDrop = useCallback(
    (event) => {
      event.preventDefault();

      const templateId = event.dataTransfer.getData(DND_NODE_TYPE);
      if (!templateId) {
        return;
      }

      const wrapperBounds = flowWrapperRef.current?.getBoundingClientRect();
      if (!wrapperBounds) {
        return;
      }

      let position = { x: 220, y: 160 };

      if (reactFlowInstance && typeof reactFlowInstance.screenToFlowPosition === 'function') {
        position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
      } else if (reactFlowInstance && typeof reactFlowInstance.project === 'function') {
        position = reactFlowInstance.project({
          x: event.clientX - wrapperBounds.left,
          y: event.clientY - wrapperBounds.top,
        });
      }

      addNodeFromLibrary(templateId, position);
    },
    [addNodeFromLibrary, reactFlowInstance]
  );

  const handleConnect = useCallback(
    (connection) => {
      setEdges((currentEdges) => addEdge(createStyledEdge(connection), currentEdges));
    },
    [setEdges]
  );

  const handleSelectionChange = useCallback((selection) => {
    const firstSelectedNode = selection.nodes?.[0];
    setSelectedNodeId(firstSelectedNode?.id || null);
  }, []);

  const patchSelectedNodeData = useCallback(
    (patch) => {
      if (!selectedNodeId) {
        return;
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id !== selectedNodeId) {
            return node;
          }

          return {
            ...node,
            data: {
              ...node.data,
              ...patch,
            },
          };
        })
      );
    },
    [selectedNodeId, setNodes]
  );

  const patchSelectedNodeConfig = useCallback(
    (field, value) => {
      if (!selectedNodeId) {
        return;
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id !== selectedNodeId) {
            return node;
          }

          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...(node.data?.config || {}),
                [field]: value,
              },
            },
          };
        })
      );
    },
    [selectedNodeId, setNodes]
  );

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== selectedNodeId));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId)
    );
    setSelectedNodeId(null);
  }, [selectedNodeId, setEdges, setNodes]);

  const applyTemplate = useCallback(
    (template) => {
      const templateNodes = cloneNodes(template.nodes);
      const templateEdges = createLinearEdges(templateNodes);

      setNodes(templateNodes);
      setEdges(templateEdges);
      setWorkflowName(template.name);
      setWorkflowDescription(template.description);
      setCurrentWorkflowId(null);
      setSelectedNodeId(null);
      navigate('/workflows');
    },
    [navigate, setEdges, setNodes]
  );

  const handleSaveWorkflow = useCallback(async () => {
    if (!workflowName.trim()) {
      setErrorMessage('Please enter a workflow name before saving.');
      return;
    }

    setSavingWorkflow(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: workflowName.trim(),
        description: workflowDescription.trim(),
        nodes: serializeNodes(nodes),
        edges: serializeEdges(edges),
      };

      let savedWorkflow;

      if (currentWorkflowId) {
        const response = await workflowsService.update(currentWorkflowId, payload);
        savedWorkflow = response?.workflow || response;
      } else {
        const response = await workflowsService.create(payload);
        savedWorkflow = response?.workflow || response;
      }

      const savedWorkflowId = savedWorkflow?._id || savedWorkflow?.id || currentWorkflowId;

      if (savedWorkflowId) {
        setCurrentWorkflowId(savedWorkflowId);
        navigate(`/workflows?id=${savedWorkflowId}`, { replace: true });
      }

      setSuccessMessage('Workflow saved successfully.');
      fetchWorkflowCatalog();
    } catch (error) {
      console.error('Failed to save workflow:', error);
      setErrorMessage(error.message || 'Failed to save workflow.');
    } finally {
      setSavingWorkflow(false);
    }
  }, [
    currentWorkflowId,
    edges,
    fetchWorkflowCatalog,
    navigate,
    nodes,
    workflowDescription,
    workflowName,
  ]);

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[#04060d]">
      <div
        ref={layoutRef}
        className="grid h-full min-h-0 grid-cols-1 lg:[grid-template-columns:var(--wf-left)_minmax(0,1fr)_var(--wf-right)]"
        style={{
          '--wf-left': `${leftSidebarWidth}px`,
          '--wf-right': `${rightSidebarWidth}px`,
          '--wf-header': '80px',
        }}
      >
        <aside className="relative hidden h-full min-h-0 border-r border-white/8 bg-[#070a13] lg:flex lg:flex-col">
          <div className="h-[var(--wf-header)] border-b border-white/8 px-4">
            <div className="flex h-full flex-col justify-center">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/90">Nodes</h2>
              <p className="mt-1 text-xs text-white/45">Drag or click to add</p>
            </div>
          </div>

          <div className="workflow-scrollbar workflow-scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-2 py-3">
            {NODE_SECTIONS.map((section) => (
              <div key={section.id} className="mb-3">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{section.title}</p>
                <div className="mt-2 space-y-1.5">
                  {NODE_LIBRARY.filter((template) => template.group === section.id).map((template) => (
                    <button
                      key={template.id}
                      draggable
                      onDragStart={(event) => handlePaletteDragStart(event, template.id)}
                      onClick={() => addNodeFromLibrary(template.id, { x: 260, y: 200 })}
                      className={`w-full rounded-xl border px-2.5 py-1.5 text-left transition ${template.cardClass}`}
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-5 w-5 rounded-md ${template.iconClass}`} />
                        <div>
                          <p className="text-[13px] leading-tight font-semibold text-white/95">{template.label}</p>
                          <p className="text-[10px] leading-snug text-white/45">{template.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-2 border-t border-white/8 pt-4">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Templates</p>
              <div className="mt-2 space-y-1.5">
                {TEMPLATE_LIBRARY.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full rounded-lg border border-white/12 bg-white/6 px-2.5 py-1.5 text-left transition hover:border-white/25 hover:bg-white/10"
                    type="button"
                  >
                    <p className="text-[13px] font-semibold text-white/90">{template.name}</p>
                    <p className="mt-0.5 text-[11px] text-white/45">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Saved Workflows</p>
            <select
              value={currentWorkflowId || ''}
              onChange={(event) => {
                const selectedId = event.target.value;
                if (selectedId) {
                  navigate(`/workflows?id=${selectedId}`);
                }
              }}
              className="w-full rounded-lg border border-white/12 bg-[#0d111a] px-2.5 py-1.5 text-[13px] text-white/80 focus:border-accent/60 focus:outline-none"
            >
              <option value="">Open workflow</option>
              {workflowCatalog.map((workflow) => {
                const id = workflow._id || workflow.id;
                return (
                  <option key={id || workflow.name} value={id || ''}>
                    {workflow.name || 'Untitled Workflow'}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="button"
            onPointerDown={handleResizeStart('left')}
            aria-label="Resize left sidebar"
            className="absolute inset-y-0 right-0 z-20 hidden w-2 translate-x-1/2 cursor-col-resize bg-transparent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/60 lg:block"
          />
        </aside>

        <section className="relative h-full min-h-0 overflow-hidden bg-[#04060d]">
          <div className="absolute inset-x-0 top-0 z-20 h-[var(--wf-header)] border-b border-white/8 bg-[#070a13]/94 px-4 backdrop-blur-md">
            <div className="flex h-full flex-wrap items-center gap-2">
              <input
                type="text"
                value={workflowName}
                onChange={(event) => setWorkflowName(event.target.value)}
                placeholder="Workflow name"
                className="min-w-[220px] flex-1 rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-accent/60 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => {
                  resetBuilder();
                  navigate('/workflows');
                }}
                className="rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
              >
                New
              </button>

              <button
                type="button"
                onClick={() => reactFlowInstance?.fitView({ padding: 0.2, duration: 300 })}
                className="rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
              >
                Fit
              </button>

              <button
                type="button"
                onClick={handleSaveWorkflow}
                disabled={savingWorkflow}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-text-inverse transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingWorkflow ? 'Saving...' : 'Save'}
              </button>
            </div>

            {(errorMessage || successMessage || loadingWorkflow) && (
              <div className="absolute left-4 right-4 top-[calc(var(--wf-header)+0.35rem)] z-10 flex flex-wrap gap-2 text-xs">
                {loadingWorkflow && (
                  <span className="rounded-full border border-blue-400/35 bg-blue-500/12 px-3 py-1 text-blue-200">
                    Loading workflow...
                  </span>
                )}
                {errorMessage && (
                  <span className="rounded-full border border-red-400/35 bg-red-500/12 px-3 py-1 text-red-200">
                    {errorMessage}
                  </span>
                )}
                {successMessage && (
                  <span className="rounded-full border border-emerald-400/35 bg-emerald-500/12 px-3 py-1 text-emerald-200">
                    {successMessage}
                  </span>
                )}
              </div>
            )}

            <div className="absolute left-4 right-4 top-[calc(var(--wf-header)+0.35rem)] z-10 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {NODE_LIBRARY.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => addNodeFromLibrary(template.id, { x: 260, y: 180 })}
                  className="whitespace-nowrap rounded-lg border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
                >
                  + {template.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={flowWrapperRef} className="h-full w-full pt-[var(--wf-header)]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
              onSelectionChange={handleSelectionChange}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              onNodeDragStop={handleNodeDragStop}
              onPaneClick={() => setSelectedNodeId(null)}
              onInit={setReactFlowInstance}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              deleteKeyCode={['Delete', 'Backspace']}
              defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
              connectionLineStyle={{
                stroke: 'rgba(255, 255, 255, 0.74)',
                strokeWidth: 2,
                filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.44))',
              }}
              snapToGrid
              snapGrid={[24, 24]}
              panOnScroll
              panOnDrag
              selectionOnDrag
              proOptions={{ hideAttribution: true }}
            >
              <MiniMap
                nodeColor={(node) => {
                  const category = node?.data?.category;
                  if (category === 'trigger') return '#34d399';
                  if (category === 'wait') return '#fbbf24';
                  if (category === 'decision') return '#a78bfa';
                  return '#60a5fa';
                }}
                maskColor="rgba(6, 9, 18, 0.82)"
                className="workflow-minimap"
                style={{ width: 158, height: 96 }}
              />

              <Controls className="workflow-controls" />

              <Background
                id="major-lines"
                variant={BackgroundVariant.Lines}
                gap={120}
                size={1}
                color="rgba(255,255,255,0.05)"
              />
              <Background
                id="dots"
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1.3}
                color="rgba(255,255,255,0.17)"
              />
              <Background
                id="accent-lines"
                variant={BackgroundVariant.Lines}
                gap={360}
                size={1.4}
                color="rgba(249, 146, 60, 0.11)"
              />
            </ReactFlow>
          </div>
        </section>

        <aside className="relative hidden h-full min-h-0 border-l border-white/8 bg-[#070a13] lg:flex lg:flex-col">
          <div className="h-[var(--wf-header)] border-b border-white/8 px-4">
            <div className="flex h-full items-center">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/90">Inspector</h2>
            </div>
          </div>

          <div className="workflow-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            {!selectedNode && (
              <div className="rounded-xl border border-white/12 bg-white/6 p-4 text-sm text-white/65">
                Select a node in the canvas to edit details and configuration.
              </div>
            )}

            {selectedNode && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/12 bg-white/6 p-4">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                    Label
                  </label>
                  <input
                    value={selectedNode.data.label}
                    onChange={(event) => patchSelectedNodeData({ label: event.target.value })}
                    className="w-full rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-sm text-white focus:border-accent/60 focus:outline-none"
                  />

                  <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                    Subtitle
                  </label>
                  <input
                    value={selectedNode.data.subtitle}
                    onChange={(event) => patchSelectedNodeData({ subtitle: event.target.value })}
                    className="w-full rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-sm text-white focus:border-accent/60 focus:outline-none"
                  />

                  <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                    Category
                  </label>
                  <select
                    value={selectedNode.data.category}
                    onChange={(event) => patchSelectedNodeData({ category: event.target.value })}
                    className="w-full rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-sm text-white focus:border-accent/60 focus:outline-none"
                  >
                    <option value="trigger">Trigger</option>
                    <option value="action">Action</option>
                    <option value="wait">Wait</option>
                    <option value="decision">Decision</option>
                  </select>
                </div>

                <div className="rounded-xl border border-white/12 bg-white/6 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-white/90">Step Configuration</h3>

                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                    Delay (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedNode.data.config?.delayHours || 0}
                    onChange={(event) => patchSelectedNodeConfig('delayHours', Number(event.target.value || 0))}
                    className="w-full rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-sm text-white focus:border-accent/60 focus:outline-none"
                  />

                  <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                    Channel
                  </label>
                  <input
                    value={selectedNode.data.config?.channel || ''}
                    onChange={(event) => patchSelectedNodeConfig('channel', event.target.value)}
                    placeholder="email, linkedin, webhook"
                    className="w-full rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent/60 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={deleteSelectedNode}
                  className="w-full rounded-lg border border-red-400/45 bg-red-500/12 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/22"
                >
                  Delete Selected Node
                </button>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-white/12 bg-white/6 p-4">
              <h3 className="mb-2 text-sm font-semibold text-white/90">Canvas Stats</h3>
              <p className="text-sm text-white/70">Nodes: {nodes.length}</p>
              <p className="text-sm text-white/70">Connections: {edges.length}</p>
              <p className="mt-2 text-xs text-white/45">Tip: drag from left palette and connect steps by dragging from node handle to handle.</p>
            </div>
          </div>

          <button
            type="button"
            onPointerDown={handleResizeStart('right')}
            aria-label="Resize right sidebar"
            className="absolute inset-y-0 left-0 z-20 hidden w-2 -translate-x-1/2 cursor-col-resize bg-transparent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/60 lg:block"
          />
        </aside>
      </div>
    </div>
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
}
