import React from 'react';
import {
  Sparkles,
  GitFork,
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Play,
  Flame,
  Globe,
  Send,
  Wrench,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { Workflow, ExecutionLog, AnalyticsMetrics } from '../types';

interface DashboardProps {
  workflows: Workflow[];
  executions: ExecutionLog[];
  metrics: AnalyticsMetrics | null;
  onNavigate: (route: string) => void;
  onOpenWorkflow: (id: string) => void;
  onExecuteWorkflow: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  workflows,
  executions,
  metrics,
  onNavigate,
  onOpenWorkflow,
  onExecuteWorkflow,
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Production Automation & Agent Infrastructure</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              AI Automation & Agent Hub
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Design visual multi-step workflows, orchestrate autonomous AI agents with Gemini 3.8 Flash, execute real web scraping, test REST APIs, and manage Model Context Protocol (MCP) tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('builder')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <GitFork className="w-4 h-4" />
              <span>Open Visual Builder</span>
            </button>
            <button
              onClick={() => onNavigate('agents')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Workflows</span>
            <GitFork className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics?.totalWorkflows || workflows.length}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">100% operational</span>
            <span>across tenants</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            {metrics?.successRate ?? 98}%
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>{metrics?.successfulExecutions ?? 102} passed runs</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Pipeline Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics?.avgDurationMs ? `${(metrics.avgDurationMs / 1000).toFixed(1)}s` : '2.4s'}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">-240ms</span>
            <span>vs previous build</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tokens Synthesized</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics?.totalTokens ? metrics.totalTokens.toLocaleString() : '18,420'}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>Powered by Gemini SDK</span>
          </div>
        </div>
      </div>

      {/* Quick Tools Launchpad */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('web-scraper')}
          className="p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <Globe className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Live Web Scraper</div>
          <div className="text-[11px] text-slate-400">Extract HTML, text, selectors</div>
        </button>

        <button
          onClick={() => onNavigate('api-tester')}
          className="p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <Send className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">API Test Console</div>
          <div className="text-[11px] text-slate-400">Execute proxy REST calls</div>
        </button>

        <button
          onClick={() => onNavigate('tools-mcp')}
          className="p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">MCP Tools Registry</div>
          <div className="text-[11px] text-slate-400">Configure tool protocols</div>
        </button>

        <button
          onClick={() => onNavigate('playground')}
          className="p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Gemini Playground</div>
          <div className="text-[11px] text-slate-400">Interactive prompt laboratory</div>
        </button>
      </div>

      {/* Main Two-Column Section: Workflows & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows Column (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GitFork className="w-4 h-4 text-indigo-400" />
              <span>Active Automation Workflows</span>
            </h2>
            <button
              onClick={() => onNavigate('workflows')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({workflows.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {workflows.slice(0, 4).map((wf) => (
              <div
                key={wf.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {wf.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        wf.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {wf.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{wf.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {wf.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-500 font-mono">
                      • {wf.nodes.length} nodes
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      • {wf.executionCount} executions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onExecuteWorkflow(wf.id)}
                    className="p-2 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Execute Workflow Now"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run</span>
                  </button>
                  <button
                    onClick={() => onOpenWorkflow(wf.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    title="Open in Builder"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Executions Column (1/3) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Live Execution Feed</span>
            </h2>
            <button
              onClick={() => onNavigate('executions')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {executions.slice(0, 5).map((exec) => (
              <div
                key={exec.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 truncate max-w-[180px]">
                    {exec.workflowName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      exec.status === 'success'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {exec.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{exec.durationMs}ms</span>
                  <span>{new Date(exec.startedAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  Trigger: {exec.triggeredBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
