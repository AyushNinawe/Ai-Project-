import React, { useState } from 'react';
import {
  GitFork,
  Plus,
  Search,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Download,
  Upload,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { Workflow } from '../types';
import { useToast } from '../components/common/Toast';

interface WorkflowsListProps {
  workflows: Workflow[];
  templates: any[];
  onOpenWorkflow: (id: string) => void;
  onExecuteWorkflow: (id: string) => void;
  onCreateWorkflow: (data?: Partial<Workflow>) => void;
  onDuplicateWorkflow: (id: string) => void;
  onDeleteWorkflow: (id: string) => void;
}

export const WorkflowsListPage: React.FC<WorkflowsListProps> = ({
  workflows,
  templates,
  onOpenWorkflow,
  onExecuteWorkflow,
  onCreateWorkflow,
  onDuplicateWorkflow,
  onDeleteWorkflow,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(false);

  // Extract unique tags
  const allTags = Array.from(new Set(workflows.flatMap((w) => w.tags || [])));

  const filtered = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || w.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleExportJson = (wf: Workflow) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(wf, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${wf.name.toLowerCase().replace(/\s+/g, '-')}-workflow.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast(`Exported "${wf.name}" as JSON`, 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onCreateWorkflow({
          name: `${json.name || 'Imported'} (Imported)`,
          description: json.description || 'Imported workflow definition',
          tags: json.tags || ['Imported'],
          nodes: json.nodes || [],
          edges: json.edges || [],
        });
        toast('Workflow imported successfully', 'success');
      } catch {
        toast('Failed to parse workflow JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-indigo-400" />
            <span>Automation Workflows</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build, schedule, version, and monitor enterprise automation graphs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`px-3 py-2 border rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              showTemplates
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showTemplates ? 'Hide Templates' : 'Templates Gallery'}</span>
          </button>

          <button
            onClick={() => onCreateWorkflow()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Templates Drawer */}
      {showTemplates && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/20 border border-indigo-500/30 space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Pre-built Production Templates</h3>
            </div>
            <span className="text-[11px] text-indigo-300">Click a template to load instantly into your workspace</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => {
                  onCreateWorkflow({
                    name: tpl.name,
                    description: tpl.description,
                    tags: tpl.tags,
                    nodes: tpl.nodes,
                    edges: tpl.edges,
                  });
                  toast(`Loaded template: "${tpl.name}"`, 'success');
                  setShowTemplates(false);
                }}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {tpl.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    {tpl.nodes.length} steps
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {tpl.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex gap-1">
                    {tpl.tags.map((t: string) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-indigo-400 font-bold group-hover:underline">Use Template &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search workflows by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-500 font-medium mr-1 shrink-0">Tags:</span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({workflows.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((wf) => (
          <div
            key={wf.id}
            className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between p-5 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    onClick={() => onOpenWorkflow(wf.id)}
                    className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    {wf.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {wf.id}</div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    wf.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {wf.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {wf.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {wf.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Node chain preview */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Graph Topology ({wf.nodes.length} Nodes)</span>
                  <span className="text-slate-500">{wf.edges.length} connections</span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono text-slate-300 py-1">
                  {wf.nodes.map((n, idx) => (
                    <React.Fragment key={n.id}>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 shrink-0 font-medium">
                        {n.title.split(' ')[0]}
                      </span>
                      {idx < wf.nodes.length - 1 && <span className="text-slate-600">&rarr;</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                <span>{wf.executionCount} runs</span>
                <span className="mx-1.5">•</span>
                <span className="text-emerald-400 font-medium">
                  {wf.executionCount > 0 ? `${Math.round((wf.successCount / wf.executionCount) * 100)}% ok` : 'new'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onExecuteWorkflow(wf.id)}
                  className="p-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                  title="Run Workflow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={() => onDuplicateWorkflow(wf.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Duplicate Workflow"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleExportJson(wf)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Export JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onOpenWorkflow(wf.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete workflow "${wf.name}"?`)) {
                      onDeleteWorkflow(wf.id);
                      toast('Workflow deleted', 'info');
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Workflow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
