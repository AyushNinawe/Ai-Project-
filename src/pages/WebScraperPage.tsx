import React, { useState } from 'react';
import {
  Globe,
  Search,
  Copy,
  Check,
  ExternalLink,
  Code,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

export const WebScraperPage: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://news.ycombinator.com');
  const [selector, setSelector] = useState('');
  const [maxChars, setMaxChars] = useState(4000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleScrape = async () => {
    if (!url.trim()) {
      toast('Please enter a target URL', 'error');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await api.scrapeUrl(url, selector, maxChars);
      setResult(data);
      toast(`Successfully scraped "${data.title}"`, 'success');
    } catch (err: any) {
      toast(`Scrape failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast('Scraped text copied to clipboard', 'info');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Globe className="w-6 h-6 text-cyan-400" />
          <span>Web Scraper Studio</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Extract cleaned DOM text, metadata, headings, and links from any public URL using Cheerio server-side parsing.
        </p>
      </div>

      {/* Input Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7">
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Web URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/blog/article"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              CSS Selector (Optional)
            </label>
            <input
              type="text"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder="e.g. article, .main-content, h1"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleScrape}
              disabled={loading}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Scraping...' : 'Extract Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in-50">
          {/* Metadata & Stats (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Extracted Metadata
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Page Title</span>
                  <span className="font-bold text-slate-200">{result.title}</span>
                </div>

                {result.metaDescription && (
                  <div>
                    <span className="text-slate-500 text-[11px] block">Meta Description</span>
                    <span className="text-slate-300 text-[11px] leading-relaxed">
                      {result.metaDescription}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <span>Status: {result.status} {result.statusText}</span>
                  <span>Latency: {result.durationMs}ms</span>
                </div>
              </div>
            </div>

            {/* Headings */}
            {result.headings?.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Page Headings ({result.headings.length})
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {result.headings.map((h: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-300 font-mono pl-2 border-l border-cyan-500/40">
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cleaned Extracted Text (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Extracted Content ({result.text?.length} chars)
                  </span>
                </div>
                <button
                  onClick={handleCopyText}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {result.text}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
