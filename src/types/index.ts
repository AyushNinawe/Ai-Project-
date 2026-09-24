export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'gemini_llm' | 'web_scraper' | 'http_request' | 'condition' | 'code_transform' | 'mcp_tool' | 'output';
  title: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: 'active' | 'draft' | 'paused';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionCount: number;
  successCount: number;
}

export interface StepLog {
  nodeId: string;
  nodeTitle: string;
  nodeType: string;
  status: 'success' | 'failed' | 'running' | 'skipped';
  durationMs: number;
  input: any;
  output: any;
  error?: string;
  logs: string[];
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'failed' | 'running' | 'queued';
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  triggeredBy: string;
  inputPayload?: any;
  outputPayload?: any;
  errorMessage?: string;
  tokensUsed: number;
  steps: StepLog[];
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  model: string;
  temperature: number;
  tools: string[];
  systemInstruction?: string;
  maxIterations: number;
  createdAt: string;
  status: 'active' | 'idle';
  totalTasksRun: number;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'compute' | 'data' | 'ai' | 'system';
  parametersSchema: Record<string, any>;
  enabled: boolean;
  type: 'builtin' | 'custom';
  endpoint?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  token: string;
}

export interface AnalyticsMetrics {
  totalWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgDurationMs: number;
  totalTokens: number;
  totalAgents: number;
  totalTools: number;
}
