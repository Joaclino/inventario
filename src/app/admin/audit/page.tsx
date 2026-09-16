'use client';

import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/lib/storage';
import { AuditLog } from '@/types/inventory';
import { FileCheck, User, Clock, ShieldCheck, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'create':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1"><Plus className="w-3 h-3 mr-0.5" /> Criação</span>;
      case 'update':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center space-x-1"><Edit className="w-3 h-3 mr-0.5" /> Edição</span>;
      case 'delete':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center space-x-1"><Trash2 className="w-3 h-3 mr-0.5" /> Remoção</span>;
      case 'validate':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center space-x-1"><ShieldCheck className="w-3 h-3 mr-0.5" /> Validação Admin</span>;
      case 'complete':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Conclusão</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">Ação</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
          <FileCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Registos de Auditoria</h1>
          <p className="text-xs text-slate-400">Histórico de ações, alterações de estado, edições e validações no sistema</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {getActionBadge(log.action)}
                  <span className="font-bold text-white text-xs uppercase tracking-wider">{log.entity_type}</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {log.details ? JSON.stringify(log.details) : `ID do item: ${log.entity_id}`}
                </p>
              </div>

              <div className="text-left sm:text-right text-[11px] text-slate-400 space-y-0.5">
                <div className="flex items-center sm:justify-end space-x-1 text-slate-300 font-semibold">
                  <User className="w-3 h-3 text-blue-400" />
                  <span>{log.user_email || 'admin@organizacao.org'}</span>
                </div>
                <div className="flex items-center sm:justify-end space-x-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(log.created_at).toLocaleString('pt-PT')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
