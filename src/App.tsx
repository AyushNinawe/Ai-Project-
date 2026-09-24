import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { WorkflowsListPage } from './pages/WorkflowsListPage';
import { WorkflowBuilderPage } from './pages/WorkflowBuilderPage';
import { AgentsPage } from './pages/AgentsPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { ApiTesterPage } from './pages/ApiTesterPage';
import { WebScraperPage } from './pages/WebScraperPage';
import { ExecutionsPage } from './pages/ExecutionsPage';
import { ToolsMcpPage } from './pages/ToolsMcpPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './pages/AuthModal';
import { Workflow, ExecutionLog, AIAgent, MCPTool, UserProfile, AnalyticsMetrics } from './types';
import { api } from './services/api';

function AppContent() {
  const { toast } = useToast();

  const [activeRoute, setActiveRoute] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // App Data Stores
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [nodeTypeUsage, setNodeTypeUsage] = useState<Record<string, number>>({});

  // Active workflow being edited in visual builder
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);

  // Load initial data
  const loadAllData = async () => {
    try {
      const [meRes, wfRes, tplRes, execRes, agRes, tlRes, anRes] = await Promise.all([
        api.getMe(),
        api.getWorkflows(),
        api.getWorkflowTemplates(),
        api.getExecutions(),
        api.getAgents(),
        api.getTools(),
        api.getAnalytics(),
      ]);

      if (meRes.user) setCurrentUser(meRes.user);
      if (wfRes.workflows) setWorkflows(wfRes.workflows);
      if (tplRes.templates) setTemplates(tplRes.templates);
      if (execRes.executions) setExecutions(execRes.executions);
      if (agRes.agents) setAgents(agRes.agents);
      if (tlRes.tools) setTools(tlRes.tools);
      if (anRes.metrics) setMetrics(anRes.metrics);
      if (anRes.nodeTypeUsage) setNodeTypeUsage(anRes.nodeTypeUsage);
    } catch (err) {
      console.error('Failed to load application state:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Workflow Handlers
  const handleOpenWorkflow = (id: string) => {
    const wf = workflows.find((w) => w.id === id);
    if (wf) {
      setActiveWorkflow(wf);
      setActiveRoute('builder');
    }
  };

  const handleCreateWorkflow = async (data?: Partial<Workflow>) => {
    try {
      const res = await api.createWorkflow(data || {});
      setWorkflows((prev) => [res.workflow, ...prev]);
      setActiveWorkflow(res.workflow);
      setActiveRoute('builder');
      toast(`Created workflow "${res.workflow.name}"`, 'success');
    } catch (err: any) {
      toast(`Creation error: ${err.message}`, 'error');
    }
  };

  const handleSaveWorkflow = async (updatedWf: Workflow) => {
    try {
      const res = await api.updateWorkflow(updatedWf.id, updatedWf);
      setWorkflows((prev) => prev.map((w) => (w.id === res.workflow.id ? res.workflow : w)));
      setActiveWorkflow(res.workflow);
    } catch (err: any) {
      toast(`Save error: ${err.message}`, 'error');
    }
  };

  const handleDuplicateWorkflow = async (id: string) => {
    try {
      const res = await api.duplicateWorkflow(id);
      setWorkflows((prev) => [res.workflow, ...prev]);
      toast('Workflow cloned successfully', 'success');
    } catch (err: any) {
      toast(`Clone error: ${err.message}`, 'error');
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await api.deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      if (activeWorkflow?.id === id) {
        setActiveWorkflow(null);
        setActiveRoute('workflows');
      }
    } catch (err: any) {
      toast(`Delete error: ${err.message}`, 'error');
    }
  };

  const handleExecuteWorkflow = async (id: string, inputs: Record<string, any> = {}) => {
    try {
      const res = await api.executeWorkflow(id, inputs);
      toast(`Workflow executed successfully in ${res.execution.durationMs}ms`, 'success');
      loadAllData();
      return res.execution;
    } catch (err: any) {
      toast(`Execution failed: ${err.message}`, 'error');
    }
  };

  const handleConvertApiToNode = (config: { method: string; url: string; headers: any; body: any }) => {
    const newWorkflow: Partial<Workflow> = {
      name: `API Pipeline (${config.method} ${new URL(config.url).pathname})`,
      description: `Dispatches ${config.method} request to ${config.url}`,
      tags: ['API Integration', 'REST'],
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          title: 'Manual Trigger',
          position: { x: 100, y: 150 },
          config: { triggerType: 'manual' },
        },
        {
          id: 'node-2',
          type: 'http_request',
          title: `HTTP ${config.method}`,
          position: { x: 450, y: 150 },
          config: {
            method: config.method,
            url: config.url,
            headers: config.headers,
            body: config.body,
          },
        },
        {
          id: 'node-3',
          type: 'gemini_llm',
          title: 'Gemini Response Evaluator',
          position: { x: 800, y: 150 },
          config: {
            model: 'gemini-3.8-flash',
            prompt: 'Evaluate status {{http_request.status}} and inspect payload {{http_request.data}}',
          },
        },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2' },
        { id: 'e2-3', source: 'node-2', target: 'node-3' },
      ],
    };
    handleCreateWorkflow(newWorkflow);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top App Header */}
      <Navbar
        user={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onNewWorkflow={() => handleCreateWorkflow()}
        activeRoute={activeRoute}
      />

      {/* Main Workspace Frame (Sidebar + Viewport) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeRoute={activeRoute}
          onRouteChange={(route) => {
            if (route === 'builder' && !activeWorkflow && workflows.length > 0) {
              setActiveWorkflow(workflows[0]);
            }
            setActiveRoute(route);
          }}
          workflowCount={workflows.length}
          agentCount={agents.length}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeRoute === 'dashboard' && (
            <DashboardPage
              workflows={workflows}
              executions={executions}
              metrics={metrics}
              onNavigate={(route) => {
                if (route === 'builder' && !activeWorkflow && workflows.length > 0) {
                  setActiveWorkflow(workflows[0]);
                }
                setActiveRoute(route);
              }}
              onOpenWorkflow={handleOpenWorkflow}
              onExecuteWorkflow={handleExecuteWorkflow}
            />
          )}

          {activeRoute === 'workflows' && (
            <WorkflowsListPage
              workflows={workflows}
              templates={templates}
              onOpenWorkflow={handleOpenWorkflow}
              onExecuteWorkflow={handleExecuteWorkflow}
              onCreateWorkflow={handleCreateWorkflow}
              onDuplicateWorkflow={handleDuplicateWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
            />
          )}

          {activeRoute === 'builder' && activeWorkflow && (
            <WorkflowBuilderPage
              workflow={activeWorkflow}
              onSave={handleSaveWorkflow}
              onBack={() => setActiveRoute('workflows')}
              onExecute={handleExecuteWorkflow}
            />
          )}

          {activeRoute === 'builder' && !activeWorkflow && (
            <div className="p-12 text-center text-slate-400">
              <p className="mb-4">No workflow selected for editing.</p>
              <button
                onClick={() => handleCreateWorkflow()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                Create New Workflow
              </button>
            </div>
          )}

          {activeRoute === 'agents' && (
            <AgentsPage agents={agents} onRefresh={loadAllData} />
          )}

          {activeRoute === 'playground' && <PlaygroundPage />}

          {activeRoute === 'api-tester' && (
            <ApiTesterPage onConvertToWorkflowNode={handleConvertApiToNode} />
          )}

          {activeRoute === 'web-scraper' && <WebScraperPage />}

          {activeRoute === 'executions' && (
            <ExecutionsPage executions={executions} onRefresh={loadAllData} />
          )}

          {activeRoute === 'tools-mcp' && (
            <ToolsMcpPage tools={tools} onRefresh={loadAllData} />
          )}

          {activeRoute === 'analytics' && (
            <AnalyticsPage metrics={metrics} nodeTypeUsage={nodeTypeUsage} />
          )}

          {activeRoute === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Identity & Persona Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(usr) => setCurrentUser(usr)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
