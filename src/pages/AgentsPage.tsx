import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Play,
  Trash2,
  Sparkles,
  Wrench,
  Terminal,
  Clock,
  ArrowRight,
  Send,
  RefreshCw,
  CheckCircle2,
  Cpu,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { AIAgent } from '../types';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

interface AgentsPageProps {
  agents: AIAgent[];
  onRefresh: () => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ agents, onRefresh }) => {
  const { toast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Agent task execution console
  const [taskPrompt, setTaskPrompt] = useState('Analyze tech discussions on https://news.ycombinator.com and calculate (120 * 45) + 800 tokens of compute.');
  const [isRunningTask, setIsRunningTask] = useState(false);
  const [taskResult, setTaskResult] = useState<{
    steps: any[];
    finalAnswer: string;
    modelUsed: string;
    isRealAi: boolean;
  } | null>(null);

  // New agent form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newBackstory, setNewBackstory] = useState('');
  const [newModel, setNewModel] = useState('gemini-3.8-flash');
  const [newTools, setNewTools] = useState<string[]>(['web_scraper', 'calculator']);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const handleRunAgentTask = async () => {
    if (!selectedAgent || !taskPrompt.trim()) return;
    setIsRunningTask(true);
    setTaskResult(null);
    toast(`Running autonomous task on agent: ${selectedAgent.name}`, 'info');

    try {
      const res = await api.runAgentTask(selectedAgent.id, taskPrompt);
      setTaskResult(res);
      toast('Agent completed task and synthesized final answer', 'success');
      onRefresh();
    } catch (err: any) {
      toast(`Agent execution error: ${err.message}`, 'error');
    } finally {
      setIsRunningTask(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole) {
      toast('Please enter name and role', 'error');
      return;
    }

    try {
      await api.createAgent({
        name: newName,
        role: newRole,
        goal: newGoal || 'Execute delegated automated tasks',
        backstory: newBackstory || 'Autonomous agent configured via AI Studio Hub',
        model: newModel,
        temperature: 0.2,
        tools: newTools,
        maxIterations: 5,
      });
      toast(`Created agent "${newName}"`, 'success');
      setShowCreateModal(false);
      setNewName('');
      setNewRole('');
      setNewGoal('');
      setNewBackstory('');
      onRefresh();
    } catch (err: any) {
      toast(`Creation failed: ${err.message}`, 'error');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
      await api.deleteAgent(id);
      toast('Agent deleted', 'info');
      onRefresh();
    } catch (err: any) {
      toast(`Delete failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-indigo-400" />
            <span>Autonomous AI Agents Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deploy specialized autonomous reasoning agents with tool access and Gemini 3.8 Flash intelligence.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Agent</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Agents List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Configured Agents ({agents.length})
          </div>

          <div className="space-y-2.5">
            {agents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {agent.name}
                        </h4>
                        <div className="text-[11px] text-slate-400">{agent.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgent(agent.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Delete Agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {agent.goal}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                    <span className="text-indigo-300">{agent.model}</span>
                    <span className="text-slate-500">{agent.totalTasksRun} tasks run</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Agent Execution & Reasoning Console (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedAgent ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
              {/* Agent Overview Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedAgent.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                      {selectedAgent.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{selectedAgent.role}</div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                    Model: <span className="text-indigo-300">{selectedAgent.model}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                    Temp: <span className="text-indigo-300">{selectedAgent.temperature}</span>
                  </div>
                </div>
              </div>

              {/* Agent Tools Badges */}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assigned Capabilities & Tools:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{tool}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Task Dispatch Console */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Assign Mission / Task Prompt
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={taskPrompt}
                    onChange={(e) => setTaskPrompt(e.target.value)}
                    placeholder="Enter explicit autonomous instruction for the agent..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    onClick={handleRunAgentTask}
                    disabled={isRunningTask}
                    className={`px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex flex-col items-center justify-center gap-1 transition-all shrink-0 cursor-pointer ${
                      isRunningTask ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                    }`}
                  >
                    {isRunningTask ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isRunningTask ? 'Thinking...' : 'Dispatch'}</span>
                  </button>
                </div>
              </div>

              {/* Reasoning Loop Trace Feed */}
              {isRunningTask && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                  <div className="text-xs text-indigo-200">
                    Agent is iterating through autonomous reasoning steps, checking tool schemas, and calling the Gemini API...
                  </div>
                </div>
              )}

              {taskResult && (
                <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reasoning Chain Trace ({taskResult.steps.length} Steps)</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Engine: {taskResult.modelUsed}
                    </span>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    {taskResult.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-indigo-400 font-bold">
                            Iteration #{step.iteration}: Planning & Tool Decision
                          </span>
                          {step.action && (
                            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                              Tool: {step.action}
                            </span>
                          )}
                        </div>

                        <div className="text-slate-300 text-xs">
                          <span className="text-slate-500 font-mono">Thought: </span>
                          {step.thought}
                        </div>

                        {step.observation && (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300">
                            <span className="text-slate-500">Observation: </span>
                            {step.observation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Final Output */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Agent Synthesis & Final Response</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {taskResult.finalAnswer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
              Select or create an agent to launch the console.
            </div>
          )}
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-bold text-white">Configure New Autonomous Agent</h3>

            <form onSubmit={handleCreateAgent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. SRE Root Cause Investigator"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role & Title</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Autonomous Incident Investigator"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Primary Goal</label>
                <textarea
                  rows={2}
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Scrape error traces, correlate microservice logs, and generate mitigation plan."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Backstory & Persona</label>
                <textarea
                  rows={2}
                  value={newBackstory}
                  onChange={(e) => setNewBackstory(e.target.value)}
                  placeholder="Expert SRE with 10 years of experience diagnosing distributed systems."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/25 cursor-pointer"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
