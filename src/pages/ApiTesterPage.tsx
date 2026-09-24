import React, { useState } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  Sparkles,
  GitFork,
  ArrowRight,
  Code,
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

interface ApiTesterProps {
  onConvertToWorkflowNode?: (config: { method: string; url: string; headers: any; body: any }) => void;
}

export const ApiTesterPage: React.FC<ApiTesterProps> = ({ onConvertToWorkflowNode }) => {
  const { toast } = useToast();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('headers');

  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Accept', value: 'application/json' },
    { key: 'User-Agent', value: 'AutomationHub-Client/1.0' },
  ]);

  const [bodyText, setBodyText] = useState('{\n  "title": "Automated Deployment Test",\n  "status": "pending"\n}');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...headers];
    updated[index][field] = value;
    setHeaders(updated);
  };

  const handleSend = async () => {
    if (!url.trim()) {
      toast('Please enter a target URL', 'error');
      return;
    }
    setLoading(true);
    setResponse(null);

    const headersObj: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.key.trim()) headersObj[h.key.trim()] = h.value;
    });

    let parsedBody: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method) && bodyText.trim()) {
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = bodyText;
      }
    }

    try {
      const res = await api.runHttpRequest(method, url, headersObj, parsedBody);
      setResponse(res);
      toast(`Request executed: HTTP ${res.status}`, res.status < 400 ? 'success' : 'error');
    } catch (err: any) {
      toast(`Request error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Send className="w-6 h-6 text-emerald-400" />
            <span>API Request Workbench</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test external REST APIs directly through server proxy with real headers, payload inspection, and zero CORS errors.
          </p>
        </div>

        {response && onConvertToWorkflowNode && (
          <button
            onClick={() => {
              const headersObj: Record<string, string> = {};
              headers.forEach((h) => {
                if (h.key.trim()) headersObj[h.key.trim()] = h.value;
              });
              onConvertToWorkflowNode({
                method,
                url,
                headers: headersObj,
                body: ['POST', 'PUT', 'PATCH'].includes(method) ? bodyText : undefined,
              });
              toast('Request transformed into workflow node', 'success');
            }}
            className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <GitFork className="w-4 h-4" />
            <span>Convert to Workflow Node</span>
          </button>
        )}
      </div>

      {/* URL & Method Input Bar */}
      <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-2 shadow-lg">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className={`px-3 py-2 rounded-lg text-xs font-bold border font-mono ${
            method === 'GET'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
              : method === 'POST'
              ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-400'
              : method === 'PUT'
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
          }`}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/resource"
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'Sending...' : 'Send Request'}</span>
        </button>
      </div>

      {/* Main Request & Response Two-Col Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Request Parameters Tabs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'headers'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Headers ({headers.length})
            </button>
            <button
              onClick={() => setActiveTab('body')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'body'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Request Body (JSON)
            </button>
          </div>

          {activeTab === 'headers' && (
            <div className="space-y-2">
              <div className="space-y-2">
                {headers.map((h, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Header key"
                      value={h.key}
                      onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Header value"
                      value={h.value}
                      onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleRemoveHeader(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddHeader}
                className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Header Row</span>
              </button>
            </div>
          )}

          {activeTab === 'body' && (
            <div className="space-y-2">
              <textarea
                rows={10}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Enter raw JSON payload..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Right: Response Inspector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Response Viewer
            </span>
            {response && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    response.status < 400
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {response.status} {response.statusText}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {response.durationMs}ms
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-200">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                Executing proxy request...
              </div>
            ) : response ? (
              <pre className="whitespace-pre-wrap">
                {typeof response.data === 'object'
                  ? JSON.stringify(response.data, null, 2)
                  : response.data}
              </pre>
            ) : (
              <span className="text-slate-600">Send a request to inspect response data and headers.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
