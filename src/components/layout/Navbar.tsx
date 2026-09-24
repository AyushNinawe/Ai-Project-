import React from 'react';
import { Sparkles, Bot, Terminal, ShieldCheck, Plus, User, LogOut, Cpu } from 'lucide-react';
import { UserProfile } from '../../types';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onNewWorkflow: () => void;
  activeRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onOpenAuth, onNewWorkflow, activeRoute }) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-5 flex items-center justify-between">
      {/* Brand & Active Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">
                AI Automation Hub
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.4 Core
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 border-l border-slate-800 pl-4">
          <span>Platform</span>
          <span>/</span>
          <span className="text-slate-300 capitalize font-medium">{activeRoute.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Center status badges */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Gemini AI Engine: Active</span>
          <span className="text-slate-500 text-[11px]">(gemini-3.8-flash)</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Internal Tenant Isolation</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewWorkflow}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>

        {/* User profile button */}
        <div
          onClick={onOpenAuth}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer group"
          title="Switch persona or manage credentials"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/30">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-medium text-slate-200 group-hover:text-white leading-tight">
              {user?.name || 'Engineer'}
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {user?.role || 'Architect'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
