import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Key, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { useToast } from '../components/common/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile) => void;
}

const DEMO_PERSONAS: UserProfile[] = [
  {
    id: 'usr_architect',
    name: 'Ayush Ninawe',
    email: 'ayushninawe.9@gmail.com',
    role: 'AI System Architect & Admin',
    token: 'jwt_hub_token_ayush_arch',
  },
  {
    id: 'usr_mloops',
    name: 'Elena Rostova',
    email: 'elena.rostova@enterprise.internal',
    role: 'Senior MLOps & Pipelines Lead',
    token: 'jwt_hub_token_elena_mloops',
  },
  {
    id: 'usr_sre',
    name: 'Marcus Chen',
    email: 'marcus.chen@enterprise.internal',
    role: 'Autonomous Agent Engineer',
    token: 'jwt_hub_token_marcus_agent',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'switch' | 'custom'>('switch');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('Automation Engineer');

  if (!isOpen) return null;

  const handleSelectPersona = (persona: UserProfile) => {
    onUserChange(persona);
    toast(`Switched active persona to ${persona.name}`, 'success');
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      toast('Please enter both name and email', 'error');
      return;
    }
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: customName,
      email: customEmail,
      role: customRole,
      token: `jwt_hub_custom_${Date.now()}`,
    };
    onUserChange(newUser);
    toast(`Authenticated as ${newUser.name}`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Identity & Access</h3>
              <p className="text-xs text-slate-400">Internal Hub Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-slate-950 rounded-lg mb-5 border border-slate-800">
          <button
            onClick={() => setMode('switch')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'switch'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quick Persona Switch
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'custom'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Credentials
          </button>
        </div>

        {mode === 'switch' ? (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 mb-2">
              Select an authorized internal persona to simulate role-based execution boundaries:
            </p>
            {DEMO_PERSONAS.map((persona) => {
              const isCurrent = currentUser?.id === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white">
                      {persona.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{persona.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{persona.role}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{persona.email}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Internal Email</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="jordan@enterprise.internal"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="AI Automation Architect">AI Automation Architect</option>
                <option value="Autonomous Agent Specialist">Autonomous Agent Specialist</option>
                <option value="MLOps Engineer">MLOps Engineer</option>
                <option value="Security & Compliance Auditor">Security & Compliance Auditor</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              Sign In with Custom Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
