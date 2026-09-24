import React, { useState } from 'react';
import {
  ListOrdered,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  ArrowRight,
  Code,
  Layers,
  ChevronDown,
  Terminal,
  Cpu,
} from 'lucide-react';
import { ExecutionLog } from '../types';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

interface ExecutionsPageProps {
  executions: ExecutionLog[];
  onRefresh: () => void;
}

export const ExecutionsPage: React.FC<ExecutionsPageProps> = ({ executions, onRefresh }) => {
  const { toast } = useToast();
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(executions[0] || null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const filtered = executions.filter((e) => {
    if (filterStatus === 'all') return true;
    return e.status === filterStatus;
  });

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      const res = await api.retryExecution(id);
      toast(`Workflow re-executed in ${res.execution.durationMs}ms`, 'success');
      onRefresh();
      setSelectedLog(res.execution);
    } catch (err: any) {
      toast(`Retry failed: ${err.message}`, 'error');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ListOrdered className="w-6 h-6 text-indigo-400" />
            <span>Execution Logs & Observability</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time execution telemetry, node traces, token usage, and automated retry orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {['all', 'success', 'failed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === st
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            {st} ({st === 'all' ? executions.length : executions.filter((e) => e.status === st).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Executions List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {filtered.map((log) => {
            const isSelected = selectedLog?.id === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {log.workflowName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
                  <span>{log.durationMs}ms</span>
                  <span>{new Date(log.startedAt).toLocaleTimeString()}</span>
                  <span>{log.tokensUsed} tokens</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  <span className="truncate max-w-[200px]">{log.triggeredBy}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry(log.id);
                    }}
                    disabled={retryingId === log.id}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    {retryingId === log.id ? 'Retrying...' : 'Retry Run'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Trace Drilldown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedLog ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white">{selectedLog.workflowName}</h2>
                  <div className="text-[11px] text-slate-500 font-mono">Execution ID: {selectedLog.id}</div>
                </div>

                <button
                  onClick={() => handleRetry(selectedLog.id)}
                  disabled={retryingId === selectedLog.id}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{retryingId === selectedLog.id ? 'Running...' : 'Retry Run'}</span>
                </button>
              </div>

              {/* Steps timeline */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step-by-Step Node Execution Trace ({selectedLog.steps.length} steps)
                </div>

                {selectedLog.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-mono text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white">{step.nodeTitle}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {step.nodeType}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {step.durationMs}ms
                      </span>
                    </div>

                    {step.logs?.length > 0 && (
                      <div className="space-y-1 pl-7">
                        {step.logs.map((logMsg, logIdx) => (
                          <div key={logIdx} className="text-[11px] text-slate-400 font-mono">
                            &gt; {logMsg}
                          </div>
                        ))}
                      </div>
                    )}

                    {step.output && (
                      <details className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-300">
                        <summary className="cursor-pointer text-indigo-400 font-semibold hover:underline">
                          View Node Output Payload
                        </summary>
                        <pre className="mt-1 p-2 rounded bg-slate-900 border border-slate-800 overflow-x-auto">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
              Select an execution log to inspect step details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
