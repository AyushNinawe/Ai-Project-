import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Play,
  CheckCircle2,
  Code,
  Layers,
  Sparkles,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { MCPTool } from '../types';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

interface ToolsMcpProps {
  tools: MCPTool[];
  onRefresh: () => void;
}

export const ToolsMcpPage: React.FC<ToolsMcpProps> = ({ tools, onRefresh }) => {
  const { toast } = useToast();
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);

  // Tool tester state
  const [testArgsText, setTestArgsText] = useState('{\n  "expression": "1250 * 1.18"\n}');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // New tool form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'web' | 'compute' | 'data' | 'ai' | 'system'>('compute');

  const selectedTool = tools.find((t) => t.id === selectedToolId) || tools[0];

  const handleTestTool = async () => {
    if (!selectedTool) return;
    setTesting(true);
    setTestResult(null);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(testArgsText);
    } catch {
      toast('Invalid JSON arguments format', 'error');
      setTesting(false);
      return;
    }

    try {
      const res = await api.testTool(selectedTool.id, parsedArgs);
      setTestResult(res);
      toast(`Tool "${selectedTool.name}" executed successfully`, 'success');
    } catch (err: any) {
      toast(`Tool execution failed: ${err.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleCreateCustomTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      toast('Please enter a tool name', 'error');
      return;
    }

    try {
      await api.createTool({
        name: newName.toLowerCase().replace(/\s+/g, '_'),
        description: newDesc || 'Custom automation capability',
        category: newCategory,
        parametersSchema: { type: 'object', properties: {} },
        enabled: true,
        type: 'custom',
      });
      toast(`Tool "${newName}" registered in MCP directory`, 'success');
      setShowAddModal(false);
      setNewName('');
      setNewDesc('');
      onRefresh();
    } catch (err: any) {
      toast(`Registration error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-violet-400" />
            <span>Model Context Protocol (MCP) & Tools</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered tools compliant with the Model Context Protocol for autonomous agent invocation and visual node integration.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register MCP Tool</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tools List (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Available Tools ({tools.length})
          </div>

          <div className="space-y-2">
            {tools.map((tool) => {
              const isSelected = selectedTool?.id === tool.id;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    setSelectedToolId(tool.id);
                    setTestResult(null);
                    if (tool.name === 'calculator') {
                      setTestArgsText('{\n  "expression": "1250 * 1.18"\n}');
                    } else if (tool.name === 'web_scraper') {
                      setTestArgsText('{\n  "url": "https://news.ycombinator.com",\n  "selector": "body"\n}');
                    } else if (tool.name === 'http_request') {
                      setTestArgsText('{\n  "method": "GET",\n  "url": "https://jsonplaceholder.typicode.com/posts/1"\n}');
                    } else {
                      setTestArgsText('{\n  "format": "iso"\n}');
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white font-mono">{tool.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Tool Inspector & Direct Tester (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedTool ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white font-mono">{selectedTool.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedTool.description}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 font-semibold uppercase">
                  {selectedTool.type}
                </span>
              </div>

              {/* JSON Schema */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>Input Parameter Schema</span>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedTool.parametersSchema, null, 2)}
                </pre>
              </div>

              {/* Test runner */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Live Tool Invocation Test
                  </span>
                  <button
                    onClick={handleTestTool}
                    disabled={testing}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{testing ? 'Executing...' : 'Run Tool Test'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={testArgsText}
                  onChange={(e) => setTestArgsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />

                {testResult && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 animate-in fade-in-50">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Execution Result Payload</span>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
              Select a tool to view its parameters schema.
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Tool Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-bold text-white">Register Custom MCP Tool</h3>
            <form onSubmit={handleCreateCustomTool} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tool Identifier</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. database_query_executor"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Execute read-only SQL queries..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="compute">Compute & Math</option>
                  <option value="web">Web & Scraping</option>
                  <option value="data">Data Transformation</option>
                  <option value="ai">AI / Inference</option>
                  <option value="system">System & OS</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/25 cursor-pointer"
                >
                  Register Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
