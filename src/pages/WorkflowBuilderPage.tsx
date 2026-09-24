import React, { useState, useRef, useEffect } from 'react';
import {
  GitFork,
  Play,
  Save,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Globe,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Settings,
  Code,
  Wrench,
  Sliders,
  ChevronRight,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { Workflow, WorkflowNode, WorkflowEdge, ExecutionLog, StepLog } from '../types';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

interface WorkflowBuilderProps {
  workflow: Workflow;
  onSave: (wf: Workflow) => void;
  onBack: () => void;
  onExecute: (id: string, inputs?: Record<string, any>) => Promise<ExecutionLog | void>;
}

// Available Node Types in Palette
const PALETTE_NODES = [
  {
    type: 'trigger',
    title: 'Trigger Event',
    description: 'Manual or scheduled pipeline entry point',
    icon: Play,
    color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
    defaultConfig: { triggerType: 'manual', defaultInput: { url: 'https://news.ycombinator.com', topic: 'AI Engineering' } },
  },
  {
    type: 'web_scraper',
    title: 'Live Web Scraper',
    description: 'Extract HTML, text, and metadata via Cheerio',
    icon: Globe,
    color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
    defaultConfig: { url: '{{trigger.url}}', selector: 'body', maxChars: 4000 },
  },
  {
    type: 'gemini_llm',
    title: 'Gemini AI Model',
    description: 'Google Gemini 3.8 Flash inference & reasoning',
    icon: Sparkles,
    color: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300',
    defaultConfig: {
      model: 'gemini-3.8-flash',
      temperature: 0.3,
      systemInstruction: 'You are an autonomous intelligence analyst. Summarize and synthesize the incoming data.',
      prompt: 'Summarize the following data into actionable insights:\n\n{{web_scraper.text}}',
    },
  },
  {
    type: 'http_request',
    title: 'HTTP REST Client',
    description: 'Execute proxy HTTP GET/POST requests',
    icon: Send,
    color: 'border-blue-500/40 bg-blue-950/30 text-blue-300',
    defaultConfig: { method: 'GET', url: 'https://jsonplaceholder.typicode.com/todos/1', headers: {} },
  },
  {
    type: 'mcp_tool',
    title: 'MCP Tool Caller',
    description: 'Execute Model Context Protocol tools',
    icon: Wrench,
    color: 'border-violet-500/40 bg-violet-950/30 text-violet-300',
    defaultConfig: { toolName: 'calculator', args: { expression: '150 * 1.25' } },
  },
  {
    type: 'code_transform',
    title: 'JavaScript Code',
    description: 'Transform & filter payloads in JavaScript',
    icon: Code,
    color: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
    defaultConfig: { code: 'return { processed: true, timestamp: Date.now(), data: input };' },
  },
  {
    type: 'condition',
    title: 'Condition / Branch',
    description: 'Branch workflow logic based on expressions',
    icon: GitFork,
    color: 'border-pink-500/40 bg-pink-950/30 text-pink-300',
    defaultConfig: { expression: 'context.gemini_llm?.text?.length > 10' },
  },
  {
    type: 'output',
    title: 'Output & Storage',
    description: 'Format final response and save to DB',
    icon: CheckCircle2,
    color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
    defaultConfig: { outputFormat: 'json', saveToDb: true },
  },
];

export const WorkflowBuilderPage: React.FC<WorkflowBuilderProps> = ({
  workflow: initialWorkflow,
  onSave,
  onBack,
  onExecute,
}) => {
  const { toast } = useToast();

  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialWorkflow.nodes[0]?.id || null
  );
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Canvas Viewport pan & zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState<ExecutionLog | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [nodeOutputPreview, setNodeOutputPreview] = useState<Record<string, any>>({});

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId);

  // Dragging nodes state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (node) {
      dragOffsetRef.current = {
        x: e.clientX / zoom - node.position.x,
        y: e.clientY / zoom - node.position.y,
      };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const newX = Math.round((e.clientX / zoom - dragOffsetRef.current.x) / 10) * 10;
      const newY = Math.round((e.clientY / zoom - dragOffsetRef.current.y) / 10) * 10;
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === draggingNodeId ? { ...n, position: { x: Math.max(10, newX), y: Math.max(10, newY) } } : n
        ),
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      setSelectedNodeId(null);
    }
  };

  const handleAddNode = (template: (typeof PALETTE_NODES)[0]) => {
    const newNodeId = `node_${Date.now().toString(36)}`;
    const highestX = workflow.nodes.reduce((max, n) => Math.max(max, n.position.x), 100);
    const avgY = workflow.nodes.reduce((acc, n) => acc + n.position.y, 0) / (workflow.nodes.length || 1);

    const newNode: WorkflowNode = {
      id: newNodeId,
      type: template.type as any,
      title: template.title,
      position: { x: highestX + 280, y: Math.max(80, avgY) },
      config: JSON.parse(JSON.stringify(template.defaultConfig)),
    };

    // Automatically connect from last selected node if one exists
    const newEdges = [...workflow.edges];
    if (selectedNodeId) {
      newEdges.push({
        id: `e_${selectedNodeId}_${newNodeId}`,
        source: selectedNodeId,
        target: newNodeId,
      });
    }

    setWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      edges: newEdges,
    }));
    setSelectedNodeId(newNodeId);
    toast(`Added "${newNode.title}" node`, 'success');
  };

  const handleDeleteNode = (nodeId: string) => {
    if (workflow.nodes.length <= 1) {
      toast('Workflow must have at least one node', 'error');
      return;
    }
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
    setSelectedNodeId(null);
    toast('Node removed from graph', 'info');
  };

  const handleConnectPort = (nodeId: string, isOutput: boolean) => {
    if (isOutput) {
      setConnectingSourceId(nodeId);
      toast(`Connecting from node "${workflow.nodes.find((n) => n.id === nodeId)?.title}". Click an input port.`, 'info');
    } else {
      if (connectingSourceId && connectingSourceId !== nodeId) {
        // Prevent duplicate edges
        const edgeExists = workflow.edges.some(
          (e) => e.source === connectingSourceId && e.target === nodeId
        );
        if (!edgeExists) {
          const newEdge: WorkflowEdge = {
            id: `e_${connectingSourceId}_${nodeId}`,
            source: connectingSourceId,
            target: nodeId,
          };
          setWorkflow((prev) => ({ ...prev, edges: [...prev.edges, newEdge] }));
          toast('Nodes connected successfully', 'success');
        }
        setConnectingSourceId(null);
      }
    }
  };

  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    toast('Initiating server-side workflow execution...', 'info');
    try {
      const res = await api.executeWorkflow(workflow.id, workflow.nodes[0]?.config?.defaultInput || {});
      if (res.execution) {
        setLastExecution(res.execution);
        // Build node output preview map
        const previewMap: Record<string, any> = {};
        res.execution.steps.forEach((step) => {
          previewMap[step.nodeId] = step.output;
        });
        setNodeOutputPreview(previewMap);
        toast(`Workflow executed successfully in ${res.execution.durationMs}ms`, 'success');
      }
    } catch (err: any) {
      toast(`Execution error: ${err.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden select-none">
      {/* Top Builder Control Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back to Workflows"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                className="text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1 py-0.5 rounded"
              />
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {workflow.status}
              </span>
            </div>
          </div>
        </div>

        {/* Viewport Zoom & Canvas Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Viewport"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSave(workflow);
              toast('Workflow saved to database', 'success');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          <button
            onClick={handleExecuteWorkflow}
            disabled={isExecuting}
            className={`px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer ${
              isExecuting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
            }`}
          >
            {isExecuting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isExecuting ? 'Running Pipeline...' : 'Execute Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Palette on Left, Canvas in Middle, Inspector on Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Node Palette Drawer */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/95 flex flex-col shrink-0 z-20 overflow-y-auto">
          <div className="p-3 border-b border-slate-800">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Node Library</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any node to insert into graph
            </p>
          </div>

          <div className="p-2 space-y-1.5">
            {PALETTE_NODES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  onClick={() => handleAddNode(item)}
                  className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className={`p-1.5 rounded-lg border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed pl-8">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Interactive Node Canvas */}
        <div
          className="flex-1 relative overflow-hidden canvas-grid-pattern cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* Canvas Transform Container */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              position: 'absolute',
            }}
          >
            {/* SVG Connecting Edges */}
            <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-10">
              <defs>
                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              {workflow.edges.map((edge) => {
                const sourceNode = workflow.nodes.find((n) => n.id === edge.source);
                const targetNode = workflow.nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                // Approximate socket positions
                const sourceX = sourceNode.position.x + 240; // width of node
                const sourceY = sourceNode.position.y + 45;
                const targetX = targetNode.position.x;
                const targetY = targetNode.position.y + 45;

                const dx = Math.abs(targetX - sourceX) * 0.5;
                const pathD = `M ${sourceX} ${sourceY} C ${sourceX + dx} ${sourceY}, ${targetX - dx} ${targetY}, ${targetX} ${targetY}`;

                return (
                  <g key={edge.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(99, 102, 241, 0.4)"
                      strokeWidth="4"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#edge-gradient)"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Render Draggable Nodes */}
            {workflow.nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const hasOutput = nodeOutputPreview[node.id];
              const nodeDef = PALETTE_NODES.find((p) => p.type === node.type) || PALETTE_NODES[0];
              const Icon = nodeDef.icon;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  style={{
                    transform: `translate(${node.position.x}px, ${node.position.y}px)`,
                  }}
                  className={`absolute w-60 rounded-xl bg-slate-900 border transition-shadow select-none z-20 ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-2xl shadow-indigo-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left Input Socket */}
                  {node.type !== 'trigger' && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectPort(node.id, false);
                      }}
                      className="absolute -left-2.5 top-10 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-400 hover:scale-125 transition-transform flex items-center justify-center cursor-pointer shadow-md"
                      title="Input Port (Connect source to here)"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    </div>
                  )}

                  {/* Right Output Socket */}
                  {node.type !== 'output' && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectPort(node.id, true);
                      }}
                      className="absolute -right-2.5 top-10 w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-400 hover:scale-125 transition-transform flex items-center justify-center cursor-pointer shadow-md"
                      title="Output Port (Drag or click to target)"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    </div>
                  )}

                  {/* Node Header */}
                  <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-md border ${nodeDef.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[130px]">
                        {node.title}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Delete Node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Node Body Details */}
                  <div className="p-3 text-[11px] space-y-1.5 text-slate-400">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-slate-500 uppercase">{node.type}</span>
                      {hasOutput && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Executed</span>
                        </span>
                      )}
                    </div>

                    {node.type === 'gemini_llm' && (
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-indigo-300 truncate">
                        Model: {node.config.model || 'gemini-3.8-flash'}
                      </div>
                    )}
                    {node.type === 'web_scraper' && (
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-cyan-300 truncate">
                        URL: {node.config.url || '{{trigger.url}}'}
                      </div>
                    )}
                    {node.type === 'http_request' && (
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-blue-300 truncate">
                        {node.config.method || 'GET'}: {node.config.url}
                      </div>
                    )}
                    {node.type === 'trigger' && (
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-emerald-300 truncate">
                        Type: {node.config.triggerType || 'manual'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Execution Status Pill */}
          {lastExecution && (
            <div className="absolute bottom-4 left-4 z-30 p-3 rounded-xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-white">Last Run: {lastExecution.status.toUpperCase()}</span>
              </div>
              <span className="text-slate-400 font-mono">
                Duration: {lastExecution.durationMs}ms
              </span>
              <span className="text-slate-400 font-mono">
                Tokens: {lastExecution.tokensUsed}
              </span>
            </div>
          )}
        </div>

        {/* Right: Node Inspector / Config Panel */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/95 flex flex-col shrink-0 z-20 overflow-y-auto">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Node Inspector
              </h3>
            </div>
            {selectedNode && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                {selectedNode.id}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Node Title
                </label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setWorkflow((prev) => ({
                      ...prev,
                      nodes: prev.nodes.map((n) =>
                        n.id === selectedNode.id ? { ...n, title: newTitle } : n
                      ),
                    }));
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Dynamic parameters for Gemini LLM */}
              {selectedNode.type === 'gemini_llm' && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Gemini Model
                    </label>
                    <select
                      value={selectedNode.config.model || 'gemini-3.8-flash'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkflow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, model: val } }
                              : n
                          ),
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
                      <option value="gemini-3.6-flash">gemini-3.6-flash (High Throughput)</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Paid Key)</option>
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Temperature</span>
                      <span className="font-mono text-indigo-400">
                        {selectedNode.config.temperature ?? 0.3}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedNode.config.temperature ?? 0.3}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setWorkflow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, temperature: val } }
                              : n
                          ),
                        }));
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      System Instruction
                    </label>
                    <textarea
                      rows={2}
                      value={selectedNode.config.systemInstruction || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkflow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, systemInstruction: val } }
                              : n
                          ),
                        }));
                      }}
                      placeholder="Role definition for the AI model..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">Prompt Template</label>
                      <span className="text-[10px] text-slate-500">Supports &#123;&#123;vars&#125;&#125;</span>
                    </div>
                    <textarea
                      rows={4}
                      value={selectedNode.config.prompt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkflow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, prompt: val } }
                              : n
                          ),
                        }));
                      }}
                      placeholder="Enter prompt e.g. Analyze {{web_scraper.text}}"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic parameters for Web Scraper */}
              {selectedNode.type === 'web_scraper' && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Target URL
                    </label>
                    <input
                      type="text"
                      value={selectedNode.config.url || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkflow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, url: val } }
                              : n
                          ),
                        }));
                      }}
                      placeholder="e.g. https://example.com or {{trigger.url}}"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      CSS Selector (Optional)
                    </label>
                    <input
                      type="text"
                      value={selectedNode.config.selector || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkflow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, selector: val } }
                              : n
                          ),
                        }));
                      }}
                      placeholder="body, article, .post-content"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic parameters for HTTP Request */}
              {selectedNode.type === 'http_request' && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Method</label>
                    <select
                      value={selectedNode.config.method || 'GET'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkflow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, method: val } }
                              : n
                          ),
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">URL Endpoint</label>
                    <input
                      type="text"
                      value={selectedNode.config.url || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkflow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, config: { ...n.config, url: val } }
                              : n
                          ),
                        }));
                      }}
                      placeholder="https://api.example.com/v1"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Output Preview for selected node */}
              {nodeOutputPreview[selectedNode.id] && (
                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Last Execution Output</span>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-48">
                    {JSON.stringify(nodeOutputPreview[selectedNode.id], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>Select any node on the graph canvas to inspect and configure its parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
