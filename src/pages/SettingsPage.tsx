import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sparkles,
  ShieldCheck,
  Server,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    geminiModel: 'gemini-3.8-flash',
    geminiConnected: true,
    localLlmEnabled: false,
    localLlmUrl: 'http://localhost:11434',
    localLlmModel: 'llama3.2',
    executionTimeoutSeconds: 60,
    maxConcurrentWorkflows: 10,
    retentionDays: 30,
  });

  useEffect(() => {
    api.getSettings().then((res) => {
      if (res.settings) setSettings(res.settings);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateSettings(settings);
      toast('System settings updated successfully', 'success');
    } catch (err: any) {
      toast(`Update error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          <span>System & Provider Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure model inference providers, local Ollama endpoints, security boundaries, and runtime execution limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini Provider Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Google Gemini API Service
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Backend Connected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Inference Model
              </label>
              <select
                value={settings.geminiModel}
                onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended default with cascade)</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash (High Throughput)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Paid Key)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Low Latency)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Model invoked across autonomous agents and workflow nodes.
              </p>
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-medium text-slate-300">Security Architecture</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                API credentials are strictly maintained in server-side memory via <code className="text-indigo-400 font-mono">process.env.GEMINI_API_KEY</code> and never forwarded to client web views.
              </div>
            </div>
          </div>
        </div>

        {/* Local LLM / Ollama Optional Provider */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Optional Local LLM (Ollama)
              </h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.localLlmEnabled}
                onChange={(e) => setSettings({ ...settings, localLlmEnabled: e.target.checked })}
                className="w-4 h-4 accent-indigo-500"
              />
              <span className="text-xs text-slate-300 font-medium">Enable Local Inference</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Local Ollama Endpoint URL
              </label>
              <input
                type="text"
                disabled={!settings.localLlmEnabled}
                value={settings.localLlmUrl}
                onChange={(e) => setSettings({ ...settings, localLlmUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Local Model Tag
              </label>
              <input
                type="text"
                disabled={!settings.localLlmEnabled}
                value={settings.localLlmModel}
                onChange={(e) => setSettings({ ...settings, localLlmModel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* Runtime Execution Constraints */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            Pipeline Execution & SRE Limits
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Step Timeout (Seconds)
              </label>
              <input
                type="number"
                value={settings.executionTimeoutSeconds}
                onChange={(e) =>
                  setSettings({ ...settings, executionTimeoutSeconds: parseInt(e.target.value) || 60 })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Concurrent Workflows
              </label>
              <input
                type="number"
                value={settings.maxConcurrentWorkflows}
                onChange={(e) =>
                  setSettings({ ...settings, maxConcurrentWorkflows: parseInt(e.target.value) || 10 })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Audit Log Retention (Days)
              </label>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) =>
                  setSettings({ ...settings, retentionDays: parseInt(e.target.value) || 30 })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
