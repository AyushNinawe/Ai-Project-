import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Sliders,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Cpu,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

export const PlaygroundPage: React.FC = () => {
  const { toast } = useToast();
  const [model, setModel] = useState('gemini-3.8-flash');
  const [temperature, setTemperature] = useState(0.3);
  const [systemInstruction, setSystemInstruction] = useState(
    'You are a senior AI automation engineer. Answer concisely with clear structured output, actionable steps, and exact code or JSON schemas.'
  );
  const [prompt, setPrompt] = useState(
    'Design a robust multi-step automation workflow for monitoring external webhook anomalies and notifying SRE on-call engineers.'
  );
  const [response, setResponse] = useState('');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [modelUsed, setModelUsed] = useState('');
  const [isRealAi, setIsRealAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      title: 'Workflow Design',
      prompt: 'Design a high-throughput webhook processing pipeline that performs deduplication, JSON schema validation, and rate-limiting.',
    },
    {
      title: 'Scraper Selector Advice',
      prompt: 'What are the best Cheerio selectors and resilient DOM parsing strategies for dynamic web pages with shadow DOM?',
    },
    {
      title: 'MCP Protocol Tool Spec',
      prompt: 'Create a production-grade Model Context Protocol (MCP) JSON Schema definition for a database query tool with parameter sanitization.',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const res = await api.generateAi(prompt, systemInstruction, model, temperature);
      setResponse(res.text);
      setLatencyMs(res.latencyMs);
      setTokensUsed(res.tokenCountEstimate);
      setModelUsed(res.modelUsed);
      setIsRealAi(res.isRealAi);
      toast('Inference completed successfully', 'success');
    } catch (err: any) {
      toast(`Generation failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast('Response copied to clipboard', 'info');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <span>Gemini AI Prompt Laboratory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct interactive workbench for testing system instructions, model parameters, and prompt responses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls & Prompt (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Model & Hyperparameters
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Server-Side @google/genai SDK</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gemini Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended with Auto-Cascade)</option>
                  <option value="gemini-3.6-flash">gemini-3.6-flash (High Throughput)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Paid Key)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Low Latency)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Temperature</span>
                  <span className="font-mono text-indigo-400">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                System Instruction
              </label>
              <textarea
                rows={2}
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Presets */}
            <div>
              <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>Prompt Presets:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(p.prompt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors cursor-pointer"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                User Prompt
              </label>
              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt to evaluate..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-500 font-mono">
                ~{Math.floor(prompt.length / 4)} input tokens
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                }`}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? 'Synthesizing...' : 'Run Prompt'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col h-full min-h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Output Inspector
              </div>
              {response && (
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Inference telemetry metrics */}
            {latencyMs !== null && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{latencyMs}ms</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>~{tokensUsed} tokens</span>
                </div>
                <div className="text-emerald-400 font-semibold">{modelUsed}</div>
              </div>
            )}

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Receiving model tokens...</span>
                </div>
              ) : response ? (
                response
              ) : (
                <span className="text-slate-600">Generated model output will appear here.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
