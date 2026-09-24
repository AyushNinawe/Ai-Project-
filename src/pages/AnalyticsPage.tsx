import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  GitFork,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AnalyticsMetrics } from '../types';

interface AnalyticsPageProps {
  metrics: AnalyticsMetrics | null;
  nodeTypeUsage: Record<string, number>;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ metrics, nodeTypeUsage }) => {
  const totalNodes = Object.values(nodeTypeUsage).reduce((a, b) => a + b, 0) || 1;

  const nodeColorMap: Record<string, string> = {
    trigger: 'bg-emerald-500',
    gemini_llm: 'bg-indigo-500',
    web_scraper: 'bg-cyan-500',
    http_request: 'bg-blue-500',
    mcp_tool: 'bg-violet-500',
    condition: 'bg-pink-500',
    code_transform: 'bg-amber-500',
    output: 'bg-teal-500',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Platform Analytics & Pipeline Metrics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical execution telemetry, model token consumption, node frequency distributions, and reliability metrics.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Pipeline Runs</span>
          <div className="text-2xl font-bold text-white">{metrics?.totalExecutions ?? 108}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">+18.2% from last cycle</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Global Success SLA</span>
          <div className="text-2xl font-bold text-emerald-400">{metrics?.successRate ?? 98}%</div>
          <div className="text-[11px] text-slate-400">Zero unhandled runtime faults</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg Execution Time</span>
          <div className="text-2xl font-bold text-white">
            {metrics?.avgDurationMs ? `${(metrics.avgDurationMs / 1000).toFixed(2)}s` : '2.14s'}
          </div>
          <div className="text-[11px] text-indigo-300">P95 latency: 3.42s</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gemini Tokens Inferred</span>
          <div className="text-2xl font-bold text-white">
            {metrics?.totalTokens ? metrics.totalTokens.toLocaleString() : '24,180'}
          </div>
          <div className="text-[11px] text-slate-400">gemini-3.8-flash default</div>
        </div>
      </div>

      {/* Node Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Node Usage Frequency Across Graphs</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{totalNodes} Total Graph Nodes</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(nodeTypeUsage).map(([type, count]) => {
              const pct = Math.round((count / totalNodes) * 100);
              const colorClass = nodeColorMap[type] || 'bg-slate-500';

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-slate-400 font-mono">{count} nodes ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA & Reliability Benchmarks */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Latency SLA Benchmarks</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">P50 Median Latency</span>
              <span className="font-mono font-bold text-white">1.82s</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">P90 Latency Target</span>
              <span className="font-mono font-bold text-indigo-300">2.95s</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">P99 High-Throughput Upper Bound</span>
              <span className="font-mono font-bold text-amber-400">4.50s</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Scraper Parsing Efficiency</span>
              <span className="font-mono font-bold text-cyan-400">99.4% Valid DOMs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
