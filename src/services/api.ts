import { Workflow, ExecutionLog, AIAgent, MCPTool, UserProfile, AnalyticsMetrics } from '../types';

export const api = {
  // Auth
  async getMe(): Promise<{ user: UserProfile; authenticated: boolean }> {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  async login(email?: string, password?: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(name: string, email: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    return res.json();
  },

  // Workflows
  async getWorkflows(): Promise<{ workflows: Workflow[] }> {
    const res = await fetch('/api/workflows');
    return res.json();
  },

  async getWorkflowTemplates(): Promise<{ templates: any[] }> {
    const res = await fetch('/api/workflows/templates');
    return res.json();
  },

  async getWorkflow(id: string): Promise<{ workflow: Workflow }> {
    const res = await fetch(`/api/workflows/${id}`);
    return res.json();
  },

  async createWorkflow(payload: Partial<Workflow>): Promise<{ workflow: Workflow }> {
    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateWorkflow(id: string, payload: Partial<Workflow>): Promise<{ workflow: Workflow }> {
    const res = await fetch(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteWorkflow(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async duplicateWorkflow(id: string): Promise<{ workflow: Workflow }> {
    const res = await fetch(`/api/workflows/${id}/duplicate`, { method: 'POST' });
    return res.json();
  },

  async executeWorkflow(id: string, inputs: Record<string, any> = {}): Promise<{ execution: ExecutionLog }> {
    const res = await fetch(`/api/workflows/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs }),
    });
    return res.json();
  },

  // Executions
  async getExecutions(workflowId?: string, status?: string): Promise<{ executions: ExecutionLog[] }> {
    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId);
    if (status) params.append('status', status);
    const res = await fetch(`/api/executions?${params.toString()}`);
    return res.json();
  },

  async getExecution(id: string): Promise<{ execution: ExecutionLog }> {
    const res = await fetch(`/api/executions/${id}`);
    return res.json();
  },

  async retryExecution(id: string): Promise<{ execution: ExecutionLog }> {
    const res = await fetch(`/api/executions/${id}/retry`, { method: 'POST' });
    return res.json();
  },

  // AI Agents
  async getAgents(): Promise<{ agents: AIAgent[] }> {
    const res = await fetch('/api/agents');
    return res.json();
  },

  async createAgent(payload: Partial<AIAgent>): Promise<{ agent: AIAgent }> {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteAgent(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async runAgentTask(id: string, taskPrompt: string): Promise<{
    agentId: string;
    agentName: string;
    steps: any[];
    finalAnswer: string;
    modelUsed: string;
    isRealAi: boolean;
  }> {
    const res = await fetch(`/api/agents/${id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskPrompt }),
    });
    return res.json();
  },

  // AI Generation & Playground
  async generateAi(prompt: string, systemInstruction?: string, model?: string, temperature?: number): Promise<{
    text: string;
    modelUsed: string;
    isRealAi: boolean;
    latencyMs: number;
    tokenCountEstimate: number;
  }> {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction, model, temperature }),
    });
    return res.json();
  },

  async getAiModels(): Promise<{ models: any[] }> {
    const res = await fetch('/api/ai/models');
    return res.json();
  },

  // Web Scraper
  async scrapeUrl(url: string, selector?: string, maxChars?: number): Promise<any> {
    const res = await fetch('/api/scraper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, selector, maxChars }),
    });
    return res.json();
  },

  // HTTP Runner / Proxy
  async runHttpRequest(method: string, url: string, headers?: Record<string, string>, body?: any): Promise<any> {
    const res = await fetch('/api/http-runner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, url, headers, body }),
    });
    return res.json();
  },

  // Tools & MCP
  async getTools(): Promise<{ tools: MCPTool[] }> {
    const res = await fetch('/api/tools');
    return res.json();
  },

  async createTool(payload: Partial<MCPTool>): Promise<{ tool: MCPTool }> {
    const res = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async testTool(id: string, args: Record<string, any>): Promise<any> {
    const res = await fetch(`/api/tools/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args }),
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<{
    metrics: AnalyticsMetrics;
    nodeTypeUsage: Record<string, number>;
    recentExecutions: ExecutionLog[];
  }> {
    const res = await fetch('/api/analytics');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ settings: any }> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(payload: any): Promise<{ settings: any }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
