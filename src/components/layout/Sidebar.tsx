import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  Workflow as WorkflowIcon,
  Bot,
  Sparkles,
  Send,
  Globe,
  ListOrdered,
  Wrench,
  BarChart3,
  Settings,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  activeRoute: string;
  onRouteChange: (route: string) => void;
  workflowCount: number;
  agentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onRouteChange,
  workflowCount,
  agentCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workflows', label: 'Workflows', icon: GitFork, badge: workflowCount },
    { id: 'builder', label: 'Workflow Builder', icon: WorkflowIcon, highlight: true },
    { id: 'agents', label: 'AI Agents', icon: Bot, badge: agentCount },
    { id: 'playground', label: 'AI Playground', icon: Sparkles },
    { id: 'api-tester', label: 'API Tester', icon: Send },
    { id: 'web-scraper', label: 'Web Scraper Studio', icon: Globe },
    { id: 'executions', label: 'Execution Logs', icon: ListOrdered },
    { id: 'tools-mcp', label: 'MCP & Tools', icon: Wrench },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/95 flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-3">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Core Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onRouteChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.highlight && !item.badge && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Fast Execution</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            Workflows execute server-side with direct Gemini 3.8 Flash SDK integration and zero client key exposure.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>SLA: 99.98%</span>
            <span className="text-emerald-400">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
